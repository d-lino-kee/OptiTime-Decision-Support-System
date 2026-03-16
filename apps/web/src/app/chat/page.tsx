"use client";

import { useState } from "react";
import { chatApi } from "@/lib/api";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hey — I'm your OptiTime coach. What are you working on today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      const res = await chatApi.send({ message: text });
      setMessages((m) => [...m, { role: "assistant", text: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Chat endpoint isn't wired yet. Next step: add POST /v1/chat in NestJS." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-zinc-500">AI Coach</div>
        <div className="text-2xl font-semibold">Chat</div>
        <p className="mt-2 text-sm text-zinc-600">
          Once FastAPI + Weaviate are connected, it can remember context and answer &ldquo;How was my week?&rdquo;
        </p>

        <div className="mt-4 h-96 overflow-auto rounded-2xl border border-zinc-200 p-3">
          <div className="flex flex-col gap-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={[
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user" ? "ml-auto bg-zinc-900 text-white" : "mr-auto bg-zinc-100 text-zinc-900",
                ].join(" ")}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            disabled={sending}
          />
          <button
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            onClick={send}
            disabled={sending}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
