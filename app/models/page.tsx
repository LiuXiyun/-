import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "模型聚合能力",
  description:
    "查看中文 AI 聚合站点支持的模型供应商与路由策略，包含 OpenAI、Claude、Gemini 和兼容 OpenAI 协议模型。",
  alternates: {
    canonical: "/models",
  },
};

export default function ModelsPage() {
  const rows = [
    { name: "OpenAI", models: "gpt-4.1-mini / gpt-4.1-nano 等", status: "已支持" },
    { name: "Anthropic", models: "claude-3-5-haiku / sonnet 系列", status: "已支持" },
    { name: "Google", models: "gemini-2.5-flash / pro 系列", status: "已支持" },
    { name: "Custom", models: "兼容 OpenAI 协议的自定义网关", status: "已支持" },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-slate-100">
      <header className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-3xl font-semibold">模型聚合能力</h1>
        <p className="mt-2 text-sm text-slate-300">
          一个后台管理多个模型 Key，按业务场景灵活选择模型，减少切换成本。
        </p>
      </header>

      <section className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-300">
              <th className="px-3 py-2">供应商</th>
              <th className="px-3 py-2">典型模型</th>
              <th className="px-3 py-2">状态</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-slate-800">
                <td className="px-3 py-3">{row.name}</td>
                <td className="px-3 py-3">{row.models}</td>
                <td className="px-3 py-3 text-cyan-300">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-6 flex gap-3 text-sm">
        <Link href="/" className="rounded-lg border border-slate-600 px-3 py-2">
          返回首页
        </Link>
        <Link href="/chat" className="rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950">
          立即体验
        </Link>
      </footer>
    </main>
  );
}
