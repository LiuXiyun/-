import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "价格与计费说明",
  description: "查看 AI 聚合平台的充值、计费和成本统计说明，支持支付宝与微信支付。",
  alternates: {
    canonical: "/pricing",
  },
};

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({
    where: { enabled: true },
    orderBy: { priceCny: "asc" },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-3xl font-semibold">价格与计费</h1>
        <p className="mt-2 text-sm text-slate-300">
          当前版本支持人民币充值、Token 消耗统计与成本估算，适合先做 MVP 快速上线。
        </p>
      </header>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        {plans.length === 0 && (
          <article className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 md:col-span-3">
            <h2 className="text-lg font-medium">暂无套餐数据</h2>
            <p className="mt-2 text-sm text-slate-300">请先到管理员后台创建套餐后再展示。</p>
          </article>
        )}
        {plans.map((plan) => (
          <article key={plan.name} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <h2 className="text-lg font-medium">{plan.name}</h2>
            <p className="mt-2 text-2xl font-semibold text-cyan-300">¥{plan.priceCny.toFixed(2)}</p>
            <p className="mt-2 text-sm text-slate-300">{plan.description}</p>
            <p className="mt-1 text-xs text-slate-400">到账额度：¥{plan.creditsCny.toFixed(2)}</p>
            <Link
              href={`/register?plan=${plan.slug}`}
              className="mt-3 inline-flex rounded-lg border border-cyan-400/60 px-3 py-2 text-xs text-cyan-300"
            >
              选择此套餐
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 text-sm text-slate-300">
        <p>计费说明：</p>
        <ul className="mt-2 space-y-2">
          <li>1. 后台按请求记录输入/输出 Token，并估算对应成本。</li>
          <li>2. 订单由支付宝或微信支付创建并回调确认，可用于真实充值流程。</li>
          <li>3. 你可按自身毛利策略，在业务层加价形成最终售价。</li>
        </ul>
      </section>

      <footer className="mt-6 flex gap-3 text-sm">
        <Link href="/" className="rounded-lg border border-slate-600 px-3 py-2">
          返回首页
        </Link>
        <Link href="/admin/login" className="rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950">
          去后台配置支付
        </Link>
      </footer>
    </main>
  );
}
