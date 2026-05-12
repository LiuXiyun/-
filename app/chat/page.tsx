import type { Metadata } from "next";
import Link from "next/link";
import { ChatClient } from "@/app/chat-client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "在线 AI 对话",
  description: "在线体验多模型对话，支持按 Key 切换 OpenAI / Claude / Gemini。",
  alternates: {
    canonical: "/chat",
  },
};

export default async function ChatPage() {
  const providerKeys = await prisma.modelProviderKey.findMany({
    where: { enabled: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      provider: true,
    },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">AI 在线对话</h1>
            <p className="mt-1 text-sm text-slate-300">选择 Key 和模型后即可开始。每次调用会自动统计成本。</p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link href="/" className="rounded-lg border border-slate-600 px-3 py-2">
              返回首页
            </Link>
            <Link href="/admin/login" className="rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950">
              后台管理
            </Link>
          </div>
        </div>
      </header>

      <section className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
        <ChatClient providerKeys={providerKeys} />
      </section>
    </main>
  );
}
