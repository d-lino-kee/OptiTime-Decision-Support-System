"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { chatApi } from "@/lib/api";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hey, I'm your OptiTime coach. What are you working on today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

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
        {
          role: "assistant",
          text: "I'm offline right now. Start the FastAPI sidecar (`apps/ai-service`) and try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">AI coach</div>
            <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-900">Chat</h2>
            <p className="mt-1 max-w-xl text-sm text-zinc-600">
              Ask anything about your week. The coach retrieves grounded context from your reflections and tasks before answering.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div
          ref={scrollRef}
          className="h-112 overflow-y-auto rounded-2xl border border-zinc-200 bg-linear-to-b from-zinc-50 to-white p-4"
        >
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={[
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                  m.role === "user"
                    ? "ml-auto bg-linear-to-br from-zinc-900 to-zinc-800 text-white"
                    : "mr-auto bg-white text-zinc-900 ring-1 ring-zinc-200",
                ].join(" ")}
              >
                {m.role === "assistant" && (
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-sky-600">
                    <Sparkles className="h-3 w-3" />
                    Coach
                  </div>
                )}
                {m.text}
              </div>
            ))}
            {sending && (
              <div className="mr-auto inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                <span className="flex gap-1">
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:120ms]" />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:240ms]" />
                </span>
                thinking
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            placeholder="Ask me anything about your week…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={sending}
          />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-sky-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition hover:shadow-lg disabled:opacity-60"
            onClick={send}
            disabled={sending}
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

