import type { Metadata } from "next";
import type { UIMessage } from "ai";
import Link from "next/link";
import { ChatClient } from "@/app/chat-client";
import { logoutUserAction } from "@/app/auth/actions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "在线 AI 对话",
  description: "在线体验多模型对话，支持按 Key 切换 OpenAI / Claude / Gemini。",
  alternates: {
    canonical: "/chat",
  },
};

type Props = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function ChatPage({ searchParams }: Props) {
  const user = await requireUser();
  const params = await searchParams;

  const providerKeys = await prisma.modelProviderKey.findMany({
    where: { enabled: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      provider: true,
    },
  });

  const sessions = await prisma.chatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true },
      },
    },
  });

  const firstSession =
    sessions[0] ??
    (await prisma.chatSession.create({
      data: {
        userId: user.id,
        title: "新对话",
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true },
        },
      },
    }));

  const firstSessionMessages = await prisma.chatMessage.findMany({
    where: { sessionId: firstSession.id },
    orderBy: { createdAt: "asc" },
  });

  const mappedMessages: UIMessage[] = firstSessionMessages.map((item) => ({
    id: item.id,
    role:
      item.role === "USER"
        ? ("user" as const)
        : item.role === "ASSISTANT"
          ? ("assistant" as const)
          : ("system" as const),
    parts: [{ type: "text" as const, text: item.content }],
  }));

  const selectedPlan = params.plan
    ? await prisma.plan.findUnique({
        where: { slug: params.plan },
        select: { priceCny: true },
      })
    : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">AI 在线对话</h1>
            <p className="mt-1 text-sm text-slate-300">
              欢迎你，{user.displayName}。当前余额：¥{user.balanceCny.toFixed(2)}
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link href="/" className="rounded-lg border border-slate-600 px-3 py-2">
              返回首页
            </Link>
            <Link href="/dashboard" className="rounded-lg border border-slate-600 px-3 py-2">
              用户中心
            </Link>
            <Link href="/invite" className="rounded-lg border border-slate-600 px-3 py-2">
              邀请返佣
            </Link>
            <Link href="/support" className="rounded-lg border border-slate-600 px-3 py-2">
              工单支持
            </Link>
            <form action={logoutUserAction}>
              <button className="rounded-lg bg-slate-700 px-3 py-2">退出登录</button>
            </form>
          </div>
        </div>
      </header>

      <section className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
        <ChatClient
          providerKeys={providerKeys}
          user={user}
          initialSessions={sessions.map((item) => ({
            id: item.id,
            title: item.title,
            preview: item.messages[0]?.content || "",
            updatedAt: item.updatedAt.toISOString(),
          }))}
          initialSessionId={firstSession.id}
          initialMessages={mappedMessages}
          suggestedAmount={selectedPlan?.priceCny}
        />
      </section>
    </main>
  );
}
