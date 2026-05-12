import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChatClient } from "@/app/chat-client";

export default async function HomePage() {
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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-6">
      <header className="card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">AI 聚合聊天站点（MVP）</h1>
          <p className="text-sm text-slate-600">
            支持多模型 Key 轮换、支付配置、后台 Token 消耗统计。
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex w-fit items-center rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
        >
          进入管理后台
        </Link>
      </header>

      <section className="card min-h-[70vh]">
        <ChatClient providerKeys={providerKeys} />
      </section>
    </main>
  );
}
