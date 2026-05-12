"use client";

import { useState } from "react";

type Props = {
  defaultChannel: "ALIPAY" | "WECHAT";
};

export function OrderTools({ defaultChannel }: Props) {
  const [channel, setChannel] = useState<"ALIPAY" | "WECHAT">(defaultChannel);
  const [amount, setAmount] = useState("9.9");
  const [subject, setSubject] = useState("AI 充值测试");
  const [lastOrderNo, setLastOrderNo] = useState("");
  const [lastPayUrl, setLastPayUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function createOrder() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          amountCny: Number(amount),
          subject,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "创建订单失败");
      } else {
        setLastOrderNo(payload.order.orderNo);
        setLastPayUrl(payload.order.payUrl ?? "");
        setMessage(`订单创建成功：${payload.order.orderNo}`);
      }
    } catch {
      setMessage("网络异常，创建失败");
    } finally {
      setLoading(false);
    }
  }

  async function mockPay() {
    if (!lastOrderNo) {
      setMessage("请先创建订单");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/payments/mock-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo: lastOrderNo }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "回调失败");
      } else {
        setMessage(`订单已标记支付成功：${payload.order.orderNo}`);
      }
    } catch {
      setMessage("网络异常，回调失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <h3 className="text-sm font-semibold">订单联调工具（开发环境）</h3>
      <p className="mt-1 text-xs text-slate-500">真实支付前先用它自测下单和回调链路。</p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
        <select
          value={channel}
          onChange={(event) => setChannel(event.target.value as "ALIPAY" | "WECHAT")}
          className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="ALIPAY">支付宝</option>
          <option value="WECHAT">微信支付</option>
        </select>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          placeholder="金额（元）"
        />
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          placeholder="订单标题"
        />
        <button
          type="button"
          onClick={createOrder}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:bg-slate-400"
        >
          创建订单
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={mockPay}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          模拟回调成功
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          刷新页面
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-600">{message}</p>
      {lastPayUrl && (
        <p className="mt-1 break-all text-xs text-cyan-700">
          支付链接/二维码内容：{lastPayUrl}
        </p>
      )}
    </div>
  );
}
