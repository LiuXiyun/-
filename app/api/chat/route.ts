import { convertToModelMessages, streamText, UIMessage } from "ai";
import { NextResponse } from "next/server";
import { DEFAULT_MODEL_BY_PROVIDER, createLanguageModel, estimateCostUsd } from "@/lib/model-provider";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const {
      messages,
      providerKeyId,
      model,
    }: {
      messages: UIMessage[];
      providerKeyId?: string;
      model?: string;
    } = await request.json();

    if (!providerKeyId) {
      return NextResponse.json({ error: "请先选择一个模型 Key" }, { status: 400 });
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

    const result = streamText({
      model: languageModel,
      system:
        "你是一个耐心、清晰、实用的中文助手。优先给出可执行步骤，避免空话，回答要便于初学者理解。",
      messages: await convertToModelMessages(messages),
      onFinish: async ({ usage, response }) => {
        const promptTokens = usage.inputTokens ?? 0;
        const completionTokens = usage.outputTokens ?? 0;
        const totalTokens = usage.totalTokens ?? 0;

        await prisma.usageLog.create({
          data: {
            providerKeyId: providerKey.id,
            provider: providerKey.provider,
            model: modelId,
            requestId: response?.id,
            promptTokens,
            completionTokens,
            totalTokens,
            estimatedCostUsd: estimateCostUsd(modelId, promptTokens, completionTokens),
          },
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("聊天接口异常:", error);
    return NextResponse.json({ error: "聊天服务暂时不可用" }, { status: 500 });
  }
}
