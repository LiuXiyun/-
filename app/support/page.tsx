import type { Metadata } from "next";
import Link from "next/link";
import { createSupportTicketAction } from "@/app/support/actions";
import { requireUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "工单支持",
  description: "提交问题工单，查看客服回复与处理状态。",
};

export default async function SupportPage() {
  const user = await requireUser();
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-3xl font-semibold">工单支持中心</h1>
        <p className="mt-2 text-sm text-slate-300">遇到支付、模型调用或账号问题时可以在这里提交工单。</p>
      </header>

      <section className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <h2 className="text-xl font-semibold">提交新工单</h2>
        <form action={createSupportTicketAction} className="mt-3 flex flex-col gap-2">
          <input
            name="subject"
            required
            placeholder="问题标题"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          <textarea
            name="content"
            required
            placeholder="请描述你的问题、复现步骤、报错信息"
            rows={4}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          <button className="w-fit rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950">
            提交工单
          </button>
        </form>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <h2 className="text-xl font-semibold">我的工单</h2>
        <div className="mt-3 flex flex-col gap-3">
          {tickets.length === 0 && <p className="text-sm text-slate-400">暂无工单记录。</p>}
          {tickets.map((ticket) => (
            <article key={ticket.id} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{ticket.subject}</p>
                <span className="rounded-full border border-slate-600 px-2 py-1 text-xs">{ticket.status}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{ticket.content}</p>
              <p className="mt-2 text-xs text-slate-500">提交时间：{ticket.createdAt.toLocaleString("zh-CN")}</p>
              {ticket.adminReply && (
                <div className="mt-3 rounded border border-cyan-500/40 bg-cyan-500/10 p-2 text-sm text-cyan-200">
                  <p className="text-xs text-cyan-300">官方回复</p>
                  <p className="mt-1 whitespace-pre-wrap">{ticket.adminReply}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-6 flex gap-3 text-sm">
        <Link href="/dashboard" className="rounded-lg border border-slate-600 px-3 py-2">
          返回用户中心
        </Link>
        <Link href="/announcements" className="rounded-lg border border-slate-600 px-3 py-2">
          查看公告
        </Link>
      </footer>
    </main>
  );
}
