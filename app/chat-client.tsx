"use client";

import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";

type ProviderItem = {
  id: string;
  name: string;
  provider: string;
};

type Props = {
  providerKeys: ProviderItem[];
  user: {
    id: string;
    email: string;
    displayName: string;
    balanceCny: number;
  };
  initialSessions: Array<{
    id: string;
    title: string;
    preview: string;
    updatedAt: string;
  }>;
  initialSessionId: string;
  initialMessages: UIMessage[];
  suggestedAmount?: number;
};

type ChatPanelProps = {
  sessionId: string;
  providerKeyId: string;
  initialMessages: UIMessage[];
  onSessionPreview: (text: string) => void;
  onCompleted: () => void;
};

function ChatPanel({
  sessionId,
  providerKeyId,
  initialMessages,
  onSessionPreview,
  onCompleted,
}: ChatPanelProps) {
  const [model, setModel] = useState("");
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ providerKeyId, model, sessionId }),
      }),
    [providerKeyId, model, sessionId],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: sessionId,
    messages: initialMessages,
    transport,
  });

  const disabled = status === "submitted" || status === "streaming";

  useEffect(() => {
    const latest = [...messages].reverse().find((item) => item.role === "user");
    if (!latest) {
      return;
    }
    const text = latest.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();
    if (text) {
      onSessionPreview(text);
    }
  }, [messages, onSessionPreview]);

  useEffect(() => {
    if (status === "ready") {
      onCompleted();
    }
  }, [status, onCompleted]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          模型名（可选）
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="例如 gpt-4.1-mini"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
        </label>
        <div className="flex items-end text-xs text-slate-400">
          当前会话 ID：{sessionId.slice(0, 8)}...
        </div>
      </div>

      <div className="h-[52vh] overflow-y-auto rounded-lg border border-slate-700 bg-slate-950/60 p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-sm text-slate-500">还没有消息，输入内容后开始对话。</p>
          )}
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-1">
              <p className="text-xs font-medium text-slate-500">
                {message.role === "user" ? "你" : "AI"}
              </p>
              <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
                {message.parts.map((part, index) =>
                  part.type === "text" ? <p key={index}>{part.text}</p> : null,
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">请求失败：{error.message}</p>}

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!input.trim() || !providerKeyId || disabled) {
            return;
          }

          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          placeholder="输入问题..."
          value={input}
          disabled={disabled || !providerKeyId}
          onChange={(event) => setInput(event.target.value)}
        />
        <button
          type="submit"
          disabled={disabled || !providerKeyId}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {disabled ? "生成中..." : "发送"}
        </button>
      </form>
    </div>
  );
}

export function ChatClient({
  providerKeys,
  user,
  initialSessions,
  initialSessionId,
  initialMessages,
  suggestedAmount,
}: Props) {
  const [providerKeyId, setProviderKeyId] = useState(providerKeys[0]?.id ?? "");
  const [sessions, setSessions] = useState(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState(initialSessionId);
  const [seedMessages, setSeedMessages] = useState<UIMessage[]>(initialMessages);
  const [chatKey, setChatKey] = useState(0);
  const [balance, setBalance] = useState(user.balanceCny);
  const [channel, setChannel] = useState<"ALIPAY" | "WECHAT">("ALIPAY");
  const [amount, setAmount] = useState((suggestedAmount ?? 19.9).toString());
  const [payMessage, setPayMessage] = useState("");
  const [payUrl, setPayUrl] = useState("");

  async function refreshBalance() {
    const response = await fetch("/api/user/profile");
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    setBalance(payload.user.balanceCny);
  }

  async function createSession() {
    const response = await fetch("/api/chat/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "新对话" }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setPayMessage(payload.error ?? "创建会话失败");
      return;
    }

    const created = payload.session as { id: string; title: string; updatedAt: string };
    const newSession = {
      id: created.id,
      title: created.title,
      preview: "",
      updatedAt: created.updatedAt,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(created.id);
    setSeedMessages([]);
    setChatKey((value) => value + 1);
  }

  async function openSession(sessionId: string) {
    if (sessionId === activeSessionId) {
      return;
    }
    const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
    const payload = await response.json();
    if (!response.ok) {
      setPayMessage(payload.error ?? "读取会话失败");
      return;
    }
    setActiveSessionId(sessionId);
    setSeedMessages(payload.messages as UIMessage[]);
    setChatKey((value) => value + 1);
  }

  function updateSessionPreview(text: string) {
    setSessions((prev) =>
      prev.map((item) =>
        item.id === activeSessionId
          ? {
              ...item,
              preview: text,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  }

  async function createOrder() {
    setPayMessage("");
    setPayUrl("");
    const response = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        amountCny: Number(amount),
        subject: "账户充值",
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setPayMessage(payload.error ?? "创建订单失败");
      return;
    }
    setPayUrl(payload.order.payUrl || "");
    setPayMessage(`订单创建成功：${payload.order.orderNo}，请完成支付后点击“刷新余额”。`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/70 p-3">
        <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
          <p className="text-slate-300">当前用户</p>
          <p className="mt-1 font-medium">{user.displayName}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
          <p className="mt-2 text-cyan-300">余额：¥{balance.toFixed(2)}</p>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
          <p className="font-medium">充值账户</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select
              value={channel}
              onChange={(event) => setChannel(event.target.value as "ALIPAY" | "WECHAT")}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
            >
              <option value="ALIPAY">支付宝</option>
              <option value="WECHAT">微信</option>
            </select>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
              placeholder="金额"
            />
          </div>
          <button
            type="button"
            onClick={createOrder}
            className="mt-2 w-full rounded-lg bg-cyan-500 px-3 py-2 text-xs font-medium text-slate-950"
          >
            创建充值订单
          </button>
          <button
            type="button"
            onClick={refreshBalance}
            className="mt-2 w-full rounded-lg border border-slate-600 px-3 py-2 text-xs"
          >
            我已支付，刷新余额
          </button>
          {payMessage && <p className="mt-2 text-xs text-slate-300">{payMessage}</p>}
          {payUrl && (
            <a
              href={payUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block break-all text-xs text-cyan-300 underline"
            >
              打开支付链接 / 二维码
            </a>
          )}
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium">历史会话</p>
            <button type="button" onClick={createSession} className="text-xs text-cyan-300">
              + 新建
            </button>
          </div>
          <div className="mt-2 max-h-[360px] space-y-2 overflow-y-auto">
            {sessions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openSession(item.id)}
                className={`w-full rounded-lg border px-2 py-2 text-left text-xs ${
                  item.id === activeSessionId
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-slate-700 bg-slate-950/60"
                }`}
              >
                <p className="truncate font-medium">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-slate-400">{item.preview || "暂无内容"}</p>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
        <label className="mb-3 flex max-w-sm flex-col gap-1 text-sm">
          选择模型 Key
          <select
            value={providerKeyId}
            onChange={(event) => setProviderKeyId(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          >
            {providerKeys.length === 0 ? (
              <option value="">请先去后台配置 Key</option>
            ) : (
              providerKeys.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}（{item.provider}）
                </option>
              ))
            )}
          </select>
        </label>

        <ChatPanel
          key={`${activeSessionId}-${chatKey}`}
          sessionId={activeSessionId}
          providerKeyId={providerKeyId}
          initialMessages={seedMessages}
          onSessionPreview={updateSessionPreview}
          onCompleted={refreshBalance}
        />
      </section>
    </div>
  );
}
