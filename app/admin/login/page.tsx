import Link from "next/link";
import { loginAction } from "@/app/admin/actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <section className="card w-full">
        <h1 className="text-lg font-semibold">管理员登录</h1>
        <p className="mt-1 text-sm text-slate-600">
          请输入 .env 里配置的 <code>ADMIN_PASSWORD</code>
        </p>
        {hasError && <p className="mt-2 text-sm text-red-600">密码错误，请重试。</p>}

        <form action={loginAction} className="mt-4 flex flex-col gap-3">
          <input
            name="password"
            type="password"
            required
            placeholder="管理员密码"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">登录</button>
        </form>

        <Link href="/" className="mt-4 inline-flex text-sm text-slate-600 underline">
          返回聊天页
        </Link>
      </section>
    </main>
  );
}
