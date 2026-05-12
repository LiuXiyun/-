import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "客户案例",
  description: "查看 AI 中转站在客服、教育、研发效率等场景的落地案例。",
  alternates: {
    canonical: "/cases",
  },
};

export default function CasesPage() {
  const cases = [
    {
      title: "SaaS 客服机器人升级",
      desc: "通过多模型路由把响应成本下降 28%，并用余额体系完成内部计费。",
    },
    {
      title: "教育产品 AI 作业批改",
      desc: "接入模型聚合后可按学科切换模型，稳定性和命中率显著提升。",
    },
    {
      title: "研发团队代码助手",
      desc: "用会话历史和成本看板追踪团队调用效率，提升代码评审速度。",
    },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-3xl font-semibold">客户案例</h1>
        <p className="mt-2 text-sm text-slate-300">这些案例展示了平台在不同业务中的真实使用方式。</p>
      </header>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        {cases.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
          </article>
        ))}
      </section>

      <footer className="mt-6 flex gap-3 text-sm">
        <Link href="/models" className="rounded-lg border border-slate-600 px-3 py-2">
          查看模型能力
        </Link>
        <Link href="/pricing" className="rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950">
          查看价格
        </Link>
      </footer>
    </main>
  );
}
