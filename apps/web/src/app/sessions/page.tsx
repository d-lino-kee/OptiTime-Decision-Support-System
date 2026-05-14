"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Timer, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sessionsApi, type FocusSession } from "@/lib/api";

export default function SessionsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(false);

  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [interruptions, setInterruptions] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  async function refresh() {
    setLoading(true);
    try {
      setItems(await sessionsApi.list());
    } finally {
      setLoading(false);
    }
  }

  async function add() {
    if (!startedAt) return alert("Start time required.");
    await sessionsApi.create({
      startedAt: new Date(startedAt).toISOString(),
      endedAt: endedAt ? new Date(endedAt).toISOString() : undefined,
      interruptions,
      notes: notes.trim() || undefined,
    });
    setStartedAt("");
    setEndedAt("");
    setInterruptions(0);
    setNotes("");
    await refresh();
  }

  async function remove(id: string) {
    await sessionsApi.remove(id);
    await refresh();
  }

  const stats = useMemo(() => {
    const completed = items.filter((s) => s.endedAt);
    const totalMins = completed.reduce((acc, s) => acc + (new Date(s.endedAt!).getTime() - new Date(s.startedAt).getTime()) / 60000, 0);
    const interruptionsAvg = completed.length
      ? Math.round((completed.reduce((a, s) => a + s.interruptions, 0) / completed.length) * 10) / 10
      : 0;
    return { total: items.length, totalMins: Math.round(totalMins), interruptionsAvg };
  }, [items]);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-100/70 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Timer className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Focus sessions</div>
              <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-900">Deep work tracker</h2>
              <p className="mt-1 max-w-xl text-sm text-zinc-600">
                Log when you started, when you stopped, and how often you got pulled out. Patterns over weeks become coaching prompts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Stat value={stats.totalMins} label="min tracked" />
            <Stat value={stats.total} label="sessions" />
            <Stat value={stats.interruptionsAvg} label="avg pulls" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold tracking-tight text-zinc-800">Log a session</div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <DateField label="Started" value={startedAt} onChange={setStartedAt} />
          <DateField label="Ended (optional)" value={endedAt} onChange={setEndedAt} />
          <NumberField label="Interruptions" value={interruptions} onChange={setInterruptions} />
          <Field label="Notes" placeholder="How did it go?" value={notes} onChange={setNotes} />
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition hover:shadow-lg md:col-span-2"
          >
            <Plus className="h-4 w-4" />
            Add session
          </button>
        </div>
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
          {items.map((s) => {
            const duration = s.endedAt
              ? Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000)
              : null;
            return (
              <div key={s._id} className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-amber-200 hover:shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {new Date(s.startedAt).toLocaleString()}
                      {s.endedAt && (
                        <span className="text-zinc-500"> → {new Date(s.endedAt).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      {duration != null && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                          {duration} min
                        </span>
                      )}
                      <span>•</span>
                      <span>{s.interruptions} interruption{s.interruptions !== 1 ? "s" : ""}</span>
                    </div>
                    {s.notes && <div className="mt-2 text-sm text-zinc-700">{s.notes}</div>}
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                    onClick={() => remove(s._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {!items.length && (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
              No sessions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-center shadow-sm">
      <div className="text-lg font-bold tracking-tight text-zinc-900">{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }: { label: string; placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      <input
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      <input
        type="datetime-local"
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      <input
        type="number"
        min={0}
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
