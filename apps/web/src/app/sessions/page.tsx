"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm text-zinc-500">Focus Sessions</div>
            <div className="text-2xl font-semibold">Deep work tracking</div>
          </div>
          <button className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50" onClick={refresh}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs text-zinc-500">Started At</div>
            <input type="datetime-local" className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-zinc-500">Ended At (optional)</div>
            <input type="datetime-local" className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-zinc-500">Interruptions</div>
            <input type="number" min={0} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={interruptions} onChange={(e) => setInterruptions(Number(e.target.value))} />
          </div>
          <div>
            <div className="text-xs text-zinc-500">Notes</div>
            <input className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it go?" />
          </div>
          <button className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 md:col-span-2" onClick={add}>
            Add Session
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="text-lg font-semibold">History</div>
        <div className="mt-4 grid gap-3">
          {items.map((s) => (
            <div key={s._id} className="rounded-2xl border border-zinc-200 p-4">
              <div className="text-sm font-medium">
                {new Date(s.startedAt).toLocaleString()}{" "}
                {s.endedAt ? `→ ${new Date(s.endedAt).toLocaleString()}` : ""}
              </div>
              <div className="mt-1 flex gap-3 text-xs text-zinc-500">
                <span>Interruptions: {s.interruptions}</span>
                {s.endedAt && (
                  <span>
                    Duration:{" "}
                    {Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000)} min
                  </span>
                )}
              </div>
              {s.notes && <div className="mt-2 text-sm text-zinc-700">{s.notes}</div>}
              <div className="mt-2 flex justify-end">
                <button className="rounded-lg border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50" onClick={() => remove(s._id)}>Delete</button>
              </div>
            </div>
          ))}
          {!items.length && (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">No sessions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
