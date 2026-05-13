import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "帮助中心",
  description: "常见问题、充值说明、模型调用与故障排查指南。",
  alternates: {
    canonical: "/help",
  },
};

export default function HelpPage() {
  const faqs = [
    {
      q: "为什么我支付成功后余额没变？",
      a: "先在聊天页点击“我已支付，刷新余额”。若仍未到账，请到工单中心提交订单号。",
    },
    {
      q: "聊天为什么提示余额不足？",
      a: "平台按模型调用成本进行扣费，余额小于本次调用预估成本时会阻止请求。",
    },
    {
      q: "可以接入自己的模型代理吗？",
      a: "可以，在后台模型 Key 管理中选择 CUSTOM 并填写兼容 OpenAI 协议的 Base URL。",
    },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-3xl font-semibold">帮助中心</h1>
        <p className="mt-2 text-sm text-slate-300">遇到问题先看这里，能快速定位大部分常见场景。</p>
      </header>

      <section className="mt-4 flex flex-col gap-3">
        {faqs.map((item) => (
          <article key={item.q} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">{item.q}</h2>
            <p className="mt-2 text-sm text-slate-300">{item.a}</p>
          </article>
        ))}
      </section>

      <footer className="mt-6 flex gap-3 text-sm">
        <Link href="/support" className="rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950">
          提交工单
        </Link>
        <Link href="/announcements" className="rounded-lg border border-slate-600 px-3 py-2">
          查看公告
        </Link>
      </footer>
    </main>
  );
}
