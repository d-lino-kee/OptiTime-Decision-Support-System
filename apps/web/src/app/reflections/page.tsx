"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm text-zinc-500">Reflections</div>
            <div className="text-2xl font-semibold">Daily check-in</div>
            <p className="mt-2 text-sm text-zinc-600">
              These will power sentiment analysis + weekly summaries in the AI service.
            </p>
          </div>
          <button className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50" onClick={refresh}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
        <textarea
          className="mt-4 w-full rounded-2xl border border-zinc-200 p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="How did today go?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />
        <button className="mt-3 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800" onClick={add}>
          Add Reflection
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="text-lg font-semibold">History</div>
        <div className="mt-4 grid gap-3">
          {items.map((r) => (
            <div key={r._id} className="rounded-2xl border border-zinc-200 p-4">
              <div className="text-sm text-zinc-700">{r.text}</div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <span>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</span>
                  {r.sentimentLabel && (
                    <span className={`rounded-full px-2 py-0.5 font-medium capitalize ${
                      r.sentimentLabel === "positive"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.sentimentLabel === "negative"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {r.sentimentLabel}
                      {r.sentimentScore != null && ` · ${Math.round(r.sentimentScore * 100)}%`}
                    </span>
                  )}
                </div>
                <button className="rounded-lg border border-zinc-200 px-2 py-1 hover:bg-zinc-50" onClick={() => remove(r._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!items.length && (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
              No reflections yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
