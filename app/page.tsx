import type { Metadata } from "next";
import Link from "next/link";
import { geoCities, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "中文 AI 模型聚合平台",
  description:
    "一键接入 OpenAI、Claude、Gemini。支持支付宝/微信支付、实时 Token 消耗统计，适合中文业务快速上线。",
};

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "这个平台可以接入哪些大模型？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "支持 OpenAI、Anthropic Claude、Google Gemini，也支持兼容 OpenAI 协议的自定义网关。",
        },
      },
      {
        "@type": "Question",
        name: "是否支持中文支付方式？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "支持支付宝与微信支付，包含真实下单与回调验签流程，可用于中国市场商业化。",
        },
      },
      {
        "@type": "Question",
        name: "后台能看到 Key 的消耗吗？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "后台可查看每次请求的输入/输出/总 Token，以及按模型估算的成本。",
        },
      },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    offers: {
      "@type": "Offer",
      priceCurrency: "CNY",
      price: "0",
    },
  };

  return (
    <main className="relative overflow-hidden bg-[#05070f] text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(43,98,255,0.35),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.2),transparent_28%)]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-8">
        <header className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-wide text-cyan-300">{siteConfig.shortName}</p>
          <nav className="flex items-center gap-3 text-sm text-slate-300">
            <Link href="/models">模型</Link>
            <Link href="/pricing">价格</Link>
            <Link href="/tutorials">教程</Link>
            <Link href="/chat">体验</Link>
            <Link href="/login">登录</Link>
          </nav>
        </header>

        <section className="relative mt-20 grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="inline-flex rounded-full border border-cyan-400/50 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
              中文市场 · SEO / GEO 增长友好
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              一个站点，接入主流大模型，
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                {" "}
                支持支付宝与微信变现
              </span>
            </h1>
            <p className="mt-5 text-base text-slate-300">
              为中文团队打造的 AI 聚合平台：统一 Key 管理、真实支付接入、后台消耗统计，帮助你更快做出可运营产品。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-medium text-slate-950"
              >
                免费注册并开始
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-medium text-slate-200"
              >
                账号登录
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5 shadow-[0_0_80px_rgba(8,145,178,0.2)] backdrop-blur">
            <p className="text-sm text-slate-300">平台能力</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>• 多模型聚合：OpenAI / Claude / Gemini / 自建网关</li>
              <li>• 商业化支付：支付宝 + 微信支付真实下单与回调验签</li>
              <li>• 后台可观测：Token 消耗、模型成本、订单状态</li>
              <li>• 增长支持：中文 SEO 页面 + GEO 城市落地页</li>
            </ul>
          </div>
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "统一模型接入",
              desc: "同一套接口调度不同供应商，降低切换成本和故障风险。",
            },
            {
              title: "支付闭环",
              desc: "下单、回调、订单落库全链路打通，方便直接商业化。",
            },
            {
              title: "运营可视化",
              desc: "按请求记录 Token 与费用，辅助定价和利润优化。",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.4)]"
            >
              <h2 className="text-lg font-medium">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
            </article>
          ))}
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold">GEO 城市落地页（示例）</h2>
          <p className="mt-2 text-sm text-slate-300">
            这些页面可承接“城市 + AI 接口/模型聚合/中转站”的长尾搜索需求。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {geoCities.map((city) => (
              <Link
                key={city.slug}
                href={`/geo/${city.slug}`}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-cyan-400"
              >
                {city.name} AI 中转站
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-2xl border border-slate-700 bg-slate-900/80 p-8 text-center">
          <h2 className="text-2xl font-semibold">先上线中文站点，再扩展多语言市场</h2>
          <p className="mt-2 text-sm text-slate-300">
            你现在可以直接从中文流量开始，后续再加英文和其他语种内容矩阵。
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/chat"
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-medium text-slate-950"
            >
              立即体验
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-medium text-slate-200"
            >
              查看套餐
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
