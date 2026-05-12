import type { Metadata } from "next";
import Link from "next/link";
import { registerAction } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "用户注册",
  description: "创建账户后即可使用 AI 对话、充值和会话历史功能。",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8 text-slate-100">
      <section className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold">创建账户</h1>
        <p className="mt-1 text-sm text-slate-300">注册后可直接体验完整的商业化闭环功能。</p>
        {params.error && <p className="mt-3 text-sm text-red-400">{params.error}</p>}

        <form action={registerAction} className="mt-5 flex flex-col gap-3">
          <input
            type="text"
            name="displayName"
            required
            placeholder="昵称"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="邮箱"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="密码（至少8位）"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          />
          <input
            type="password"
            name="confirmPassword"
            required
            placeholder="确认密码"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          />
          <button className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950">注册并进入</button>
        </form>

        <p className="mt-4 text-sm text-slate-300">
          已有账号？{" "}
          <Link href="/login" className="text-cyan-300 underline">
            立即登录
          </Link>
        </p>
      </section>
    </main>
  );
}
