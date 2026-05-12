import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "价格与计费说明",
  description: "查看 AI 聚合平台的充值、计费和成本统计说明，支持支付宝与微信支付。",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-3xl font-semibold">价格与计费</h1>
        <p className="mt-2 text-sm text-slate-300">
          当前版本支持人民币充值、Token 消耗统计与成本估算，适合先做 MVP 快速上线。
        </p>
      </header>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        {[
          {
            name: "免费试用",
            price: "¥0",
            desc: "本地部署体验全部流程，适合功能验证。",
          },
          {
            name: "标准版",
            price: "按量付费",
            desc: "按模型真实调用成本计费，支持充值运营。",
          },
          {
            name: "企业版",
            price: "定制",
            desc: "支持私有化网关、专属风控与多租户能力。",
          },
        ].map((plan) => (
          <article key={plan.name} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <h2 className="text-lg font-medium">{plan.name}</h2>
            <p className="mt-2 text-2xl font-semibold text-cyan-300">{plan.price}</p>
            <p className="mt-2 text-sm text-slate-300">{plan.desc}</p>
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
