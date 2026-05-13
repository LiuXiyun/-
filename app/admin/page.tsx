import Link from "next/link";
import { PaymentChannel } from "@prisma/client";
import {
  adjustUserBalanceAction,
  deleteProviderKeyAction,
  deleteAnnouncementAction,
  logoutAction,
  replySupportTicketAction,
  saveAnnouncementAction,
  savePlanAction,
  savePaymentConfigAction,
  saveProviderKeyAction,
} from "@/app/admin/actions";
import { OrderTools } from "@/app/admin/order-tools";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function usd(cost: number) {
  return `$${cost.toFixed(4)}`;
}

export default async function AdminPage() {
  await requireAdmin();

  const [providerKeys, usageLogs, paymentConfigs, orders, users, plans, tickets, announcements] = await Promise.all([
    prisma.modelProviderKey.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.usageLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        providerKey: {
          select: { name: true },
        },
      },
    }),
    prisma.paymentConfig.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.rechargeOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { email: true, displayName: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, email: true, displayName: true, balanceCny: true, createdAt: true },
    }),
    prisma.plan.findMany({ orderBy: { priceCny: "asc" } }),
    prisma.supportTicket.findMany({
      orderBy: { updatedAt: "desc" },
      take: 40,
      include: { user: { select: { email: true, displayName: true } } },
    }),
    prisma.announcement.findMany({ orderBy: { updatedAt: "desc" }, take: 30 }),
  ]);

  const usageSummary = usageLogs.reduce(
    (acc, item) => {
      acc.totalTokens += item.totalTokens;
      acc.totalCost += item.estimatedCostUsd;
      return acc;
    },
    { totalTokens: 0, totalCost: 0 },
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-6">
      <header className="card flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">管理后台</h1>
          <p className="text-sm text-slate-600">
            统一管理模型 Key、支付配置，并查看消耗统计。
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            返回官网
          </Link>
          <form action={logoutAction}>
            <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">退出登录</button>
          </form>
        </div>
      </header>

      <section className="card">
        <h2 className="text-lg font-semibold">总体消耗</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">总请求条数</p>
            <p className="text-xl font-semibold">{usageLogs.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">总 Token</p>
            <p className="text-xl font-semibold">{usageSummary.totalTokens}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">估算总成本</p>
            <p className="text-xl font-semibold">{usd(usageSummary.totalCost)}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">新增模型 Key</h2>
        <form action={saveProviderKeyAction} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            name="name"
            placeholder="显示名称，例如 OpenAI 主账号"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <select
            name="provider"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
            defaultValue="OPENAI"
          >
            <option value="OPENAI">OPENAI</option>
            <option value="ANTHROPIC">ANTHROPIC</option>
            <option value="GOOGLE">GOOGLE</option>
            <option value="CUSTOM">CUSTOM（兼容 OpenAI 协议）</option>
          </select>
          <input
            name="apiKey"
            placeholder="API Key（新建必填）"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            required
          />
          <input
            name="baseUrl"
            placeholder="Base URL（可选，自建代理时填写）"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            name="note"
            placeholder="备注（可选）"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="enabled" defaultChecked />
            启用
          </label>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">保存模型 Key</button>
        </form>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">已有模型 Key</h2>
        <div className="mt-3 flex flex-col gap-3">
          {providerKeys.length === 0 && <p className="text-sm text-slate-500">暂无配置</p>}
          {providerKeys.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3">
              <form action={saveProviderKeyAction} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input type="hidden" name="id" defaultValue={item.id} />
                <input
                  name="name"
                  defaultValue={item.name}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
                <select
                  name="provider"
                  defaultValue={item.provider}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="OPENAI">OPENAI</option>
                  <option value="ANTHROPIC">ANTHROPIC</option>
                  <option value="GOOGLE">GOOGLE</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
                <input
                  name="apiKey"
                  placeholder="留空表示不修改原 Key"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  name="baseUrl"
                  defaultValue={item.baseUrl ?? ""}
                  placeholder="Base URL"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  name="note"
                  defaultValue={item.note ?? ""}
                  placeholder="备注"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="enabled" defaultChecked={item.enabled} />
                  启用
                </label>
                <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  更新
                </button>
              </form>
              <form action={deleteProviderKeyAction} className="mt-2">
                <input type="hidden" name="id" value={item.id} />
                <button className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  删除
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">支付配置（支付宝 / 微信）</h2>
        <p className="mt-1 text-xs text-slate-500">
          注意：私钥字段仅在你填写时才会更新；留空表示保留原值。
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3">
          {(["ALIPAY", "WECHAT"] as PaymentChannel[]).map((channel) => {
            const current = paymentConfigs.find((item) => item.channel === channel);
            return (
              <form
                key={channel}
                action={savePaymentConfigAction}
                className="rounded-lg border border-slate-200 p-3"
              >
                <input type="hidden" name="channel" value={channel} />
                <h3 className="text-sm font-semibold">{channel === "ALIPAY" ? "支付宝" : "微信支付"}</h3>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    name="appId"
                    defaultValue={current?.appId ?? ""}
                    placeholder="App ID"
                    required
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    name="merchantId"
                    defaultValue={current?.merchantId ?? ""}
                    placeholder="商户号（可选）"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    name="privateKey"
                    placeholder="私钥（留空不改）"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                  />
                  <input
                    name="publicKey"
                    defaultValue={current?.publicKey ?? ""}
                    placeholder={
                      channel === "ALIPAY"
                        ? "支付宝公钥（用于回调验签）"
                        : "微信平台公钥（用于通知验签）"
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                  />
                  <input
                    name="certSerial"
                    defaultValue={current?.certSerial ?? ""}
                    placeholder="微信证书序列号（微信必填）"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                  />
                  <input
                    name="apiV3Key"
                    placeholder="微信 APIv3 Key（微信首次必填，留空不改）"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                  />
                  <input
                    name="gateway"
                    defaultValue={current?.gateway ?? ""}
                    placeholder={
                      channel === "ALIPAY"
                        ? "支付宝网关（可选，默认官方）"
                        : "微信网关（可选，默认官方）"
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                  />
                  <input
                    name="notifyUrl"
                    defaultValue={current?.notifyUrl ?? ""}
                    placeholder="回调地址（生产建议必填）"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="enabled" defaultChecked={current?.enabled ?? false} />
                    启用
                  </label>
                  <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm">保存配置</button>
                </div>
              </form>
            );
          })}
        </div>

        <div className="mt-3">
          <OrderTools defaultChannel="ALIPAY" />
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">最近用量明细</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-2 py-2">时间</th>
                <th className="px-2 py-2">Key</th>
                <th className="px-2 py-2">模型</th>
                <th className="px-2 py-2">输入 Token</th>
                <th className="px-2 py-2">输出 Token</th>
                <th className="px-2 py-2">总 Token</th>
                <th className="px-2 py-2">估算成本(USD)</th>
              </tr>
            </thead>
            <tbody>
              {usageLogs.length === 0 && (
                <tr>
                  <td className="px-2 py-2 text-slate-500" colSpan={7}>
                    暂无数据
                  </td>
                </tr>
              )}
              {usageLogs.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-2 py-2">{item.createdAt.toLocaleString("zh-CN")}</td>
                  <td className="px-2 py-2">{item.providerKey?.name ?? "已删除 Key"}</td>
                  <td className="px-2 py-2">{item.model}</td>
                  <td className="px-2 py-2">{item.promptTokens}</td>
                  <td className="px-2 py-2">{item.completionTokens}</td>
                  <td className="px-2 py-2">{item.totalTokens}</td>
                  <td className="px-2 py-2">{usd(item.estimatedCostUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">最近订单</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-2 py-2">订单号</th>
                <th className="px-2 py-2">用户</th>
                <th className="px-2 py-2">第三方单号</th>
                <th className="px-2 py-2">渠道</th>
                <th className="px-2 py-2">金额(元)</th>
                <th className="px-2 py-2">状态</th>
                <th className="px-2 py-2">支付时间</th>
                <th className="px-2 py-2">创建时间</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td className="px-2 py-2 text-slate-500" colSpan={8}>
                    暂无订单
                  </td>
                </tr>
              )}
              {orders.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-2 py-2">{item.orderNo}</td>
                  <td className="px-2 py-2">{item.user.displayName || item.user.email}</td>
                  <td className="px-2 py-2">{item.externalOrderNo ?? "-"}</td>
                  <td className="px-2 py-2">{item.channel}</td>
                  <td className="px-2 py-2">{item.amountCny}</td>
                  <td className="px-2 py-2">{item.status}</td>
                  <td className="px-2 py-2">{item.paidAt ? item.paidAt.toLocaleString("zh-CN") : "-"}</td>
                  <td className="px-2 py-2">{item.createdAt.toLocaleString("zh-CN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">用户账户管理</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-2 py-2">用户</th>
                <th className="px-2 py-2">邮箱</th>
                <th className="px-2 py-2">余额</th>
                <th className="px-2 py-2">注册时间</th>
                <th className="px-2 py-2">调整余额</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td className="px-2 py-2 text-slate-500" colSpan={5}>
                    暂无用户
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 align-top">
                  <td className="px-2 py-2">{user.displayName}</td>
                  <td className="px-2 py-2">{user.email}</td>
                  <td className="px-2 py-2">¥{user.balanceCny.toFixed(2)}</td>
                  <td className="px-2 py-2">{user.createdAt.toLocaleString("zh-CN")}</td>
                  <td className="px-2 py-2">
                    <form action={adjustUserBalanceAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <input
                        name="amount"
                        placeholder="+20 或 -5"
                        className="w-24 rounded border border-slate-300 px-2 py-1"
                        required
                      />
                      <input
                        name="note"
                        placeholder="备注"
                        className="w-32 rounded border border-slate-300 px-2 py-1"
                      />
                      <button className="rounded border border-slate-300 px-2 py-1">执行</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">套餐管理</h2>
        <form action={savePlanAction} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input name="name" placeholder="套餐名" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input name="slug" placeholder="slug（唯一）" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input
            name="description"
            placeholder="描述"
            className="rounded border border-slate-300 px-3 py-2 text-sm sm:col-span-3"
          />
          <input name="priceCny" placeholder="售价" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input
            name="creditsCny"
            placeholder="到账额度"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="enabled" defaultChecked />
            启用
          </label>
          <button className="rounded border border-slate-300 px-3 py-2 text-sm">新增套餐</button>
        </form>

        <div className="mt-3 flex flex-col gap-2">
          {plans.map((plan) => (
            <form
              key={plan.id}
              action={savePlanAction}
              className="grid grid-cols-1 gap-2 rounded border border-slate-200 p-2 sm:grid-cols-5"
            >
              <input type="hidden" name="id" value={plan.id} />
              <input name="name" defaultValue={plan.name} className="rounded border border-slate-300 px-2 py-1 text-sm" />
              <input name="slug" defaultValue={plan.slug} className="rounded border border-slate-300 px-2 py-1 text-sm" />
              <input
                name="priceCny"
                defaultValue={plan.priceCny}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
              />
              <input
                name="creditsCny"
                defaultValue={plan.creditsCny}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" name="enabled" defaultChecked={plan.enabled} />
                  启用
                </label>
                <button className="rounded border border-slate-300 px-2 py-1 text-xs">更新</button>
              </div>
              <input
                name="description"
                defaultValue={plan.description}
                className="rounded border border-slate-300 px-2 py-1 text-sm sm:col-span-5"
              />
            </form>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">工单处理</h2>
        <div className="mt-3 flex flex-col gap-3">
          {tickets.length === 0 && <p className="text-sm text-slate-500">暂无工单</p>}
          {tickets.map((ticket) => (
            <article key={ticket.id} className="rounded border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {ticket.subject}（{ticket.user.displayName || ticket.user.email}）
                </p>
                <span className="text-xs text-slate-500">{ticket.status}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{ticket.content}</p>
              <form action={replySupportTicketAction} className="mt-2 flex flex-col gap-2">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <textarea
                  name="adminReply"
                  defaultValue={ticket.adminReply ?? ""}
                  placeholder="请输入回复"
                  rows={3}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                  required
                />
                <div className="flex items-center gap-2">
                  <select name="status" defaultValue={ticket.status} className="rounded border border-slate-300 px-2 py-1 text-sm">
                    <option value="REPLIED">REPLIED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <button className="rounded border border-slate-300 px-3 py-1 text-sm">保存回复</button>
                </div>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">公告管理</h2>
        <form action={saveAnnouncementAction} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input name="title" placeholder="公告标题" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <input name="slug" placeholder="slug（可选）" className="rounded border border-slate-300 px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="enabled" defaultChecked />
            发布
          </label>
          <textarea
            name="content"
            placeholder="公告内容"
            rows={4}
            className="rounded border border-slate-300 px-3 py-2 text-sm sm:col-span-3"
          />
          <button className="rounded border border-slate-300 px-3 py-2 text-sm sm:col-span-3">发布公告</button>
        </form>

        <div className="mt-3 flex flex-col gap-2">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="rounded border border-slate-200 p-3">
              <form action={saveAnnouncementAction} className="grid grid-cols-1 gap-2">
                <input type="hidden" name="id" value={announcement.id} />
                <input
                  name="title"
                  defaultValue={announcement.title}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <input
                  name="slug"
                  defaultValue={announcement.slug}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <textarea
                  name="content"
                  defaultValue={announcement.content}
                  rows={3}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" name="enabled" defaultChecked={announcement.enabled} />
                    发布
                  </label>
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs">更新</button>
                </div>
              </form>
              <form action={deleteAnnouncementAction} className="mt-2">
                <input type="hidden" name="id" value={announcement.id} />
                <button className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-600">
                  删除公告
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
