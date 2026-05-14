"use client";

import { useEffect, useState } from "react";
import { NotebookPen, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { reflectionsApi, type Reflection } from "@/lib/api";

export default function ReflectionsPage() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [items, setItems] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  async function refresh() {
    setLoading(true);
    try {
      setItems(await reflectionsApi.list());
    } finally {
      setLoading(false);
    }
  }

  async function add() {
    if (text.trim().length < 3) return alert("Write a longer reflection.");
    await reflectionsApi.create({ text: text.trim() });
    setText("");
    await refresh();
  }

  async function remove(id: string) {
    await reflectionsApi.remove(id);
    await refresh();
  }

  const sentimentChip = (label?: string, score?: number) => {
    if (!label) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 ring-1 ring-inset ring-zinc-200">
          <Sparkles className="h-3 w-3" />
          analysing
        </span>
      );
    }
    const cls =
      label === "positive"
        ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
        : label === "negative"
          ? "bg-rose-100 text-rose-700 ring-rose-200"
          : "bg-amber-100 text-amber-700 ring-amber-200";
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${cls}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
        {label}
        {score != null && <span className="opacity-70">· {Math.round(score * 100)}%</span>}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-100/70 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <NotebookPen className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-700">Reflections</div>
            <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-900">Daily check in</h2>
            <p className="mt-1 max-w-xl text-sm text-zinc-600">
              Write a few sentences about your day. The AI worker tags each one with sentiment and feeds it into your weekly summary.
            </p>
          </div>
        </div>

        <textarea
          className="relative mt-5 w-full rounded-2xl border border-zinc-200 bg-white p-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          placeholder="How did today go? What worked, what didn't, what's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />
        <button
          type="button"
          className="relative mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:shadow-lg"
          onClick={add}
        >
          <Sparkles className="h-4 w-4" />
          Save reflection
        </button>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight text-zinc-800">History</div>
          <button
            type="button"
            onClick={refresh}
            className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {items.map((r) => (
            <div key={r._id} className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-violet-200 hover:shadow-sm">
              <div className="text-sm leading-relaxed text-zinc-800">{r.text}</div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  {sentimentChip(r.sentimentLabel, r.sentimentScore)}
                  <span>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                  onClick={() => remove(r._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!items.length && (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
              No reflections yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
