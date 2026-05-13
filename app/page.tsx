import type { Metadata } from "next";
import Link from "next/link";
import { geoCities, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI 智能编程助手",
  description:
    "为中国开发者打造的 AI 编程助手：代码生成、调试优化、团队协作。配套官网营销、用户账户与运营后台，支持商业化支付与用量统计。",
};

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "这个产品是做什么的？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "面向中国开发者的智能编程助手，帮助完成代码生成、调试优化与团队协作，并提供官网、账户体系与运营后台。",
        },
      },
      {
        "@type": "Question",
        name: "如何开始使用？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "注册账户后可进入用户中心管理充值与订单；产品侧接入（IDE/插件/客户端）可按文档集成。",
        },
      },
      {
        "@type": "Question",
        name: "是否支持中文支付与运营数据？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "支持支付宝与微信支付；后台可查看订单、用户余额与模型调用消耗统计，便于商业化运营。",
        },
      },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "AI 驱动的编程助手：代码生成、调试优化、实时协作。配套中文营销站、用户账户与运营后台。",
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
        <header className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold tracking-wide text-cyan-300">{siteConfig.shortName}</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
            <Link href="/models" className="hover:text-cyan-200">
              能力
            </Link>
            <Link href="/pricing" className="hover:text-cyan-200">
              价格
            </Link>
            <Link href="/cases" className="hover:text-cyan-200">
              案例
            </Link>
            <Link href="/tutorials" className="hover:text-cyan-200">
              教程
            </Link>
            <Link href="/help" className="hover:text-cyan-200">
              帮助
            </Link>
            <Link href="/announcements" className="hover:text-cyan-200">
              公告
            </Link>
            <Link href="/login" className="hover:text-cyan-200">
              登录
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-cyan-500/90 px-3 py-1.5 font-medium text-slate-950 hover:bg-cyan-400"
            >
              注册
            </Link>
          </nav>
        </header>

        <section className="relative mt-16 text-center md:mt-24">
          <p className="text-4xl opacity-40 select-none" aria-hidden>
            ❄
          </p>
          <p className="mt-4 inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs text-cyan-100">
            为中国开发者量身打造
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl md:leading-tight">
            <span className="bg-gradient-to-r from-cyan-200 via-white to-blue-300 bg-clip-text text-transparent">
              AI 驱动的智能编程助手
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
            用先进的大模型能力，帮助你完成代码生成、调试优化与团队协作，让编程更高效、更智能。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
            >
              立即使用
            </Link>
            <Link
              href="/tutorials"
              className="rounded-xl border border-slate-500 bg-slate-900/50 px-8 py-3.5 text-sm font-medium text-slate-100 backdrop-blur hover:border-cyan-400/60"
            >
              观看演示
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            视频教程与演示内容见「教程」页；产品客户端/插件接入以实际交付渠道为准。
          </p>
        </section>

        <section className="mt-20 rounded-2xl border border-slate-700/80 bg-slate-900/50 p-8 backdrop-blur md:p-10">
          <h2 className="text-center text-xl font-semibold md:text-2xl">强大功能，助力开发体验</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-400">
            AI 编程的革新力量——从想法到可运行代码，更快完成迭代。
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "智能代码生成",
                desc: "根据自然语言描述生成函数、模块与测试用例，减少重复劳动。",
              },
              {
                title: "调试与优化",
                desc: "定位报错、解释堆栈、给出重构建议，让代码更清晰、更稳健。",
              },
              {
                title: "实时协作",
                desc: "适合团队评审与结对编程场景，统一上下文、加速交付。",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-left shadow-[0_20px_50px_rgba(2,6,23,0.35)]"
              >
                <h3 className="text-lg font-medium text-cyan-100">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-2xl border border-slate-700 bg-slate-900/60 p-8 text-center">
          <h2 className="text-xl font-semibold md:text-2xl">功能演示 · 视频教程</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
            从零到精通，跟着视频掌握核心能力与最佳实践。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/tutorials"
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-medium text-slate-950"
            >
              前往教程中心
            </Link>
            <Link href="/pricing" className="rounded-xl border border-slate-600 px-6 py-3 text-sm text-slate-200">
              查看套餐与计费
            </Link>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-xl font-semibold md:text-2xl">城市落地页（GEO 示例）</h2>
          <p className="mt-2 text-sm text-slate-400">
            便于覆盖「城市 + AI 编程助手 / 开发效率」等地域与长尾检索需求。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {geoCities.map((city) => (
              <Link
                key={city.slug}
                href={`/geo/${city.slug}`}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-cyan-400/70"
              >
                {city.name} · 开发者方案
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-8 text-center md:p-10">
          <h2 className="text-xl font-semibold md:text-2xl">准备好提升开发效率了吗？</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
            注册账户管理充值与订单；运营与模型配置请使用管理后台。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-medium text-slate-950"
            >
              免费注册
            </Link>
            <Link href="/admin/login" className="rounded-xl border border-slate-600 px-6 py-3 text-sm text-slate-200">
              管理后台
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
