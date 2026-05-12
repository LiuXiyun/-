import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { geoCities } from "@/lib/site";

type Props = {
  params: Promise<{ city: string }>;
};

export function generateStaticParams() {
  return geoCities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = geoCities.find((item) => item.slug === citySlug);
  if (!city) {
    return {};
  }

  return {
    title: `${city.name} AI 中转站`,
    description: `${city.name} 企业/团队可用的中文 AI 模型聚合服务，支持支付宝微信支付、Token 成本统计和后台运维。`,
    alternates: {
      canonical: `/geo/${city.slug}`,
    },
  };
}

export default async function GeoCityPage({ params }: Props) {
  const { city: citySlug } = await params;
  const city = geoCities.find((item) => item.slug === citySlug);
  if (!city) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-slate-100">
      <article className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-3xl font-semibold">{city.name} AI 中转站解决方案</h1>
        <p className="mt-3 text-sm text-slate-300">
          面向 {city.name} 的开发者、创业团队和企业，提供可商业化的 AI 模型聚合能力：统一接入主流模型，支持中文支付与后台消耗统计，帮助你更快完成业务闭环。
        </p>

        <h2 className="mt-6 text-xl font-semibold">适用场景</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>{city.name} 本地业务 AI 客服 / AI 助手平台</li>
          <li>{city.name} SaaS 产品对接多模型 API</li>
          <li>海外模型能力在中文市场的本地化运营</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">为什么适合 GEO 引流</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>可覆盖“{city.name} + AI 中转站 / 模型 API / ChatGPT 接口”等地域长尾词。</li>
          <li>页面内容与城市关键词强相关，利于搜索引擎理解页面意图。</li>
          <li>可持续扩展到更多城市形成内容矩阵。</li>
        </ul>
      </article>

      <div className="mt-6 flex gap-3 text-sm">
        <Link href="/" className="rounded-lg border border-slate-600 px-3 py-2">
          返回首页
        </Link>
        <Link href="/chat" className="rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950">
          立即体验
        </Link>
      </div>
    </main>
  );
}
