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
    title: `${city.name} AI 编程助手`,
    description: `${city.name} 开发者与团队可用的智能编程助手方案：代码生成、调试优化、协作与商业化运营后台。`,
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
        <h1 className="text-3xl font-semibold">{city.name} · AI 编程助手与开发者方案</h1>
        <p className="mt-3 text-sm text-slate-300">
          面向 {city.name} 的开发者、创业团队与企业，提供与 CodexZH 同类的「官网营销 + 用户账户 + 运营后台」能力，并支持中文支付与用量统计，便于商业化落地。
        </p>

        <h2 className="mt-6 text-xl font-semibold">适用场景</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>{city.name} 本地团队提升研发效率（代码生成、调试、评审）</li>
          <li>{city.name} 创业团队快速上线 AI 编程类产品官网与账户体系</li>
          <li>需要中文支付、订单与后台运营数据的商业化场景</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">为什么适合 GEO 引流</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>可覆盖「{city.name} + AI 编程助手 / 智能写代码 / 开发效率」等地域与长尾词。</li>
          <li>页面内容与城市关键词强相关，利于搜索引擎理解页面意图。</li>
          <li>可持续扩展到更多城市形成内容矩阵。</li>
        </ul>
      </article>

      <div className="mt-6 flex gap-3 text-sm">
        <Link href="/" className="rounded-lg border border-slate-600 px-3 py-2">
          返回首页
        </Link>
        <Link href="/register" className="rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950">
          立即注册
        </Link>
      </div>
    </main>
  );
}
