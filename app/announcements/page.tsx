import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "官方公告",
  description: "查看平台版本更新、活动通知和运维公告。",
  alternates: {
    canonical: "/announcements",
  },
};

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: { enabled: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-3xl font-semibold">官方公告</h1>
        <p className="mt-2 text-sm text-slate-300">产品更新、活动消息、维护通知都会在这里发布。</p>
      </header>

      <section className="mt-4 flex flex-col gap-3">
        {announcements.length === 0 && (
          <article className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 text-sm text-slate-400">
            暂无公告
          </article>
        )}
        {announcements.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-1 text-xs text-slate-500">
              发布时间：{(item.publishedAt ?? item.createdAt).toLocaleString("zh-CN")}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{item.content}</p>
          </article>
        ))}
      </section>

      <footer className="mt-6 flex gap-3 text-sm">
        <Link href="/" className="rounded-lg border border-slate-600 px-3 py-2">
          返回首页
        </Link>
        <Link href="/help" className="rounded-lg border border-slate-600 px-3 py-2">
          帮助中心
        </Link>
      </footer>
    </main>
  );
}
