import { convertToModelMessages, streamText, UIMessage } from "ai";
import { NextResponse } from "next/server";
import { debitForChat, usdToCny } from "@/lib/billing";
import { DEFAULT_MODEL_BY_PROVIDER, createLanguageModel, estimateCostUsd } from "@/lib/model-provider";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { assessPromptRisk } from "@/lib/risk-control";
import { getCurrentUser } from "@/lib/user-auth";

export const maxDuration = 30;

function pickLatestUserText(messages: UIMessage[]) {
  const reversed = [...messages].reverse();
  const latestUser = reversed.find((item) => item.role === "user");
  if (!latestUser) {
    return "";
  }
  return latestUser.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limiter = checkRateLimit({
      key: `chat:${ip}`,
      limit: 25,
      windowMs: 60 * 1000,
    });
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "请求太频繁，请稍后再试" },
        { status: 429, headers: { "Retry-After": Math.ceil(limiter.retryAfterMs / 1000).toString() } },
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录后再对话" }, { status: 401 });
    }

    const {
      messages,
      providerKeyId,
      model,
      sessionId,
    }: {
      messages: UIMessage[];
      providerKeyId?: string;
      model?: string;
      sessionId?: string;
    } = await request.json();

    if (!providerKeyId) {
      return NextResponse.json({ error: "请先选择一个模型 Key" }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: "会话不存在，请刷新后重试" }, { status: 400 });
    }

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: user.id },
      select: { id: true },
    });
    if (!session) {
      return NextResponse.json({ error: "会话无效" }, { status: 404 });
    }
    if (user.balanceCny <= 0) {
      return NextResponse.json({ error: "余额不足，请先充值" }, { status: 402 });
    }

    const providerKey = await prisma.modelProviderKey.findUnique({
      where: { id: providerKeyId },
      select: {
        id: true,
        provider: true,
        encryptedKey: true,
        baseUrl: true,
        enabled: true,
      },
    });

    if (!providerKey || !providerKey.enabled) {
      return NextResponse.json({ error: "模型 Key 不存在或已禁用" }, { status: 404 });
    }

    const modelId = model?.trim() || DEFAULT_MODEL_BY_PROVIDER[providerKey.provider];
    const languageModel = createLanguageModel(providerKey, modelId);
    const latestUserText = pickLatestUserText(messages);
    const riskResult = assessPromptRisk(latestUserText);
    if (riskResult.blocked) {
      return NextResponse.json({ error: riskResult.reason }, { status: 400 });
    }

    if (latestUserText) {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: "USER",
          content: latestUserText,
        },
      });
    }

    const result = streamText({
      model: languageModel,
      system:
        "你是一个耐心、清晰、实用的中文助手。优先给出可执行步骤，避免空话，回答要便于初学者理解。",
      messages: await convertToModelMessages(messages),
      onFinish: async ({ usage, response, text }) => {
        try {
          const promptTokens = usage.inputTokens ?? 0;
          const completionTokens = usage.outputTokens ?? 0;
          const totalTokens = usage.totalTokens ?? 0;
          const estimatedCostUsd = estimateCostUsd(modelId, promptTokens, completionTokens);
          const chargeCny = usdToCny(estimatedCostUsd);

          const usageLog = await prisma.usageLog.create({
            data: {
              userId: user.id,
              chatSessionId: session.id,
              providerKeyId: providerKey.id,
              provider: providerKey.provider,
              model: modelId,
              requestId: response?.id,
              promptTokens,
              completionTokens,
              totalTokens,
              estimatedCostUsd,
            },
          });

          await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              role: "ASSISTANT",
              content: text || "（模型未返回文本）",
              model: modelId,
              promptTokens,
              outputTokens: completionTokens,
              totalTokens,
              costUsd: estimatedCostUsd,
            },
          });

          if (chargeCny > 0) {
            await debitForChat({
              userId: user.id,
              amountCny: chargeCny,
              usageLogId: usageLog.id,
              note: `AI 对话扣费（${modelId}）`,
            });
          }
        } catch (onFinishError) {
          console.error("聊天后处理失败:", onFinishError);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("聊天接口异常:", error);
    return NextResponse.json({ error: "聊天服务暂时不可用" }, { status: 500 });
  }
}
