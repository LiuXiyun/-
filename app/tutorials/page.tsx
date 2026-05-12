import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "视频教程",
  description: "从零到精通，快速掌握平台注册、充值、模型调用和运营配置。",
  alternates: {
    canonical: "/tutorials",
  },
};

export default function TutorialsPage() {
  const lessons = [
    "10 分钟快速上手：注册、登录、创建首个对话",
    "充值与支付回调联调（支付宝 / 微信）",
    "模型 Key 管理与路由策略",
    "用量统计与成本控制",
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-3xl font-semibold">视频教程</h1>
        <p className="mt-2 text-sm text-slate-300">从零到精通，跟着教程快速搭起可商业化的 AI 站点。</p>
      </header>

      <section className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <h2 className="text-xl font-semibold">教程目录</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          {lessons.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          说明：这里预留了 Bilibili/视频平台嵌入位置。你可以把正式教程链接替换到页面中。
        </p>
      </section>

      <footer className="mt-6 flex gap-3 text-sm">
        <Link href="/" className="rounded-lg border border-slate-600 px-3 py-2">
          返回首页
        </Link>
        <Link href="/register" className="rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950">
          注册体验
        </Link>
      </footer>
    </main>
  );
}
