"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

type ProviderItem = {
  id: string;
  name: string;
  provider: string;
};

type Props = {
  providerKeys: ProviderItem[];
};

export function ChatClient({ providerKeys }: Props) {
  const [providerKeyId, setProviderKeyId] = useState(providerKeys[0]?.id ?? "");
  const [model, setModel] = useState("");
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { providerKeyId, model },
      }),
    [providerKeyId, model],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const disabled = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
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

        <label className="flex flex-col gap-1 text-sm">
          模型名（可选）
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="例如 gpt-4.1-mini"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
        </label>
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
