"use client";

import { useMemo, useState } from "react";
import { UserIdBar, getSavedUserId } from "@/components/UserIdBar";
import { chatApi } from "@/lib/api";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hey — I’m your OptiTime coach. What are you working on today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const userId = useMemo(() => getSavedUserId(), []);

  async function send() {
    if (!userId) return alert("Set a userId first.");
    const text = input.trim();
    if (!text) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      // This will error until you add /v1/chat in NestJS.
      const res = await chatApi.send({ userId, message: text });
      setMessages((m) => [...m, { role: "assistant", text: res.reply }]);
    } catch (e: unknown) {
      console.error(e);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text:
            "Chat endpoint isn’t wired yet. Next step: add POST /v1/chat in NestJS that forwards to FastAPI AI.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <UserIdBar />

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-zinc-500">AI Coach</div>
        <div className="text-2xl font-semibold">Chat</div>
        <p className="mt-2 text-sm text-zinc-600">
          This UI is ready. Once FastAPI + Weaviate are connected, it can remember context and answer “How was my week?”
        </p>

        <div className="mt-4 h-105 overflow-auto rounded-2xl border border-zinc-200 p-3">
          <div className="flex flex-col gap-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={[
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-zinc-900 text-white"
                    : "mr-auto bg-zinc-100 text-zinc-900",
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
            onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
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