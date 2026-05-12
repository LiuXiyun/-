import type { Metadata } from "next";
import Link from "next/link";
import { logoutUserAction } from "@/app/auth/actions";
import { requireUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "用户中心",
  description: "查看余额、订单、扣费流水和会话统计。",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const [orders, transactions, sessions] = await Promise.all([
    prisma.rechargeOrder.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.chatSession.count({ where: { userId: user.id } }),
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">用户中心</h1>
            <p className="mt-1 text-sm text-slate-300">
              {user.displayName}（{user.email}）
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link href="/chat" className="rounded-lg border border-slate-600 px-3 py-2">
              去聊天
            </Link>
            <form action={logoutUserAction}>
              <button className="rounded-lg bg-slate-700 px-3 py-2">退出登录</button>
            </form>
          </div>
        </div>
      </header>

      <section className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">账户余额</p>
          <p className="mt-2 text-2xl font-semibold text-cyan-300">¥{user.balanceCny.toFixed(2)}</p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">充值订单</p>
          <p className="mt-2 text-2xl font-semibold">{orders.length}</p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">会话数</p>
          <p className="mt-2 text-2xl font-semibold">{sessions}</p>
        </article>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
        <h2 className="text-lg font-semibold">最近钱包流水</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="px-2 py-2">时间</th>
                <th className="px-2 py-2">类型</th>
                <th className="px-2 py-2">金额</th>
                <th className="px-2 py-2">余额</th>
                <th className="px-2 py-2">备注</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-2 text-slate-500">
                    暂无流水
                  </td>
                </tr>
              )}
              {transactions.map((item) => (
                <tr key={item.id} className="border-b border-slate-800">
                  <td className="px-2 py-2">{item.createdAt.toLocaleString("zh-CN")}</td>
                  <td className="px-2 py-2">{item.type}</td>
                  <td className={`px-2 py-2 ${item.amountCny >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                    {item.amountCny >= 0 ? "+" : ""}
                    {item.amountCny.toFixed(2)}
                  </td>
                  <td className="px-2 py-2">{item.balanceAfterCny.toFixed(2)}</td>
                  <td className="px-2 py-2">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
