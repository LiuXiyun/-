import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "邀请返佣",
  description: "分享邀请码，邀请好友注册后可获得返佣奖励。",
};

export default async function InvitePage() {
  const user = await requireUser();
  const invitedUsers = await prisma.user.findMany({
    where: { invitedById: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      displayName: true,
      createdAt: true,
      walletTransactions: {
        where: { type: "REFERRAL_BONUS" },
        select: { amountCny: true },
      },
    },
  });

  const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/register?inviter=${user.inviteCode}`;
  const totalBonus = invitedUsers.reduce((sum, item) => {
    return sum + item.walletTransactions.reduce((inner, tx) => inner + tx.amountCny, 0);
  }, 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-3xl font-semibold">邀请返佣中心</h1>
        <p className="mt-2 text-sm text-slate-300">分享你的邀请码，好友消费后你可获得返佣奖励。</p>
      </header>

      <section className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <p className="text-sm text-slate-300">你的邀请码</p>
        <p className="mt-1 text-2xl font-semibold text-cyan-300">{user.inviteCode}</p>
        <p className="mt-3 text-xs text-slate-400 break-all">{inviteLink}</p>
        <p className="mt-2 text-sm">累计返佣：¥{totalBonus.toFixed(2)}</p>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <h2 className="text-xl font-semibold">已邀请用户</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="px-2 py-2">用户</th>
                <th className="px-2 py-2">邮箱</th>
                <th className="px-2 py-2">注册时间</th>
              </tr>
            </thead>
            <tbody>
              {invitedUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-2 py-2 text-slate-500">
                    暂无邀请记录
                  </td>
                </tr>
              )}
              {invitedUsers.map((item) => (
                <tr key={item.id} className="border-b border-slate-800">
                  <td className="px-2 py-2">{item.displayName}</td>
                  <td className="px-2 py-2">{item.email}</td>
                  <td className="px-2 py-2">{item.createdAt.toLocaleString("zh-CN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-6 flex gap-3 text-sm">
        <Link href="/dashboard" className="rounded-lg border border-slate-600 px-3 py-2">
          返回用户中心
        </Link>
        <Link href="/chat" className="rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950">
          去聊天
        </Link>
      </footer>
    </main>
  );
}
