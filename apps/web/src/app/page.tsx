"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import { tasksApi, reflectionsApi, sessionsApi, type Task, type Reflection, type FocusSession } from "@/lib/api";

export default function Page() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const [t, r, s] = await Promise.all([
        tasksApi.list(),
        reflectionsApi.list(),
        sessionsApi.list(),
      ]);
      setTasks(t);
      setReflections(r);
      setSessions(s);
    } finally {
      setLoading(false);
    }
  }

  const taskStats = {
    total: tasks.length,
    totalMins: tasks.reduce((a, t) => a + (t.estimatedMinutes ?? 0), 0),
    high: tasks.filter((t) => t.priority === "high").length,
  };

  const sessionStats = (() => {
    const completed = sessions.filter((s) => s.endedAt);
    const totalMins = completed.reduce((acc, s) => {
      const ms = new Date(s.endedAt!).getTime() - new Date(s.startedAt).getTime();
      return acc + ms / 60000;
    }, 0);
    return { total: sessions.length, totalMins: Math.round(totalMins) };
  })();

  const latestReflection = reflections[0] ?? null;

  const sentimentColor = (label?: string) => {
    if (!label) return "text-zinc-500";
    if (label === "positive") return "text-emerald-600";
    if (label === "negative") return "text-red-500";
    return "text-yellow-600";
  };

  return (
    <>
      <TopBar />

      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Overview</div>
        <button
          className="rounded-xl border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50"
          onClick={load}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-zinc-500">Today</div>
          <div className="mt-1 text-2xl font-semibold">Your Tasks</div>
          {tasks.length ? (
            <div className="mt-3 flex flex-col gap-1">
              <div className="text-sm text-zinc-700">
                <span className="font-medium">{taskStats.total}</span> tasks •{" "}
                <span className="font-medium">{taskStats.totalMins}</span> est. min
              </div>
              {taskStats.high > 0 && (
                <div className="text-sm font-medium text-red-500">{taskStats.high} high-priority</div>
              )}
              <ul className="mt-2 flex flex-col gap-1">
                {tasks.slice(0, 4).map((t) => (
                  <li key={t._id} className="flex items-center gap-2 text-sm text-zinc-700">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${t.priority === "high" ? "bg-red-400" : t.priority === "medium" ? "bg-yellow-400" : "bg-zinc-300"}`} />
                    {t.title}
                  </li>
                ))}
                {tasks.length > 4 && <li className="text-xs text-zinc-400">+{tasks.length - 4} more</li>}
              </ul>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No tasks yet. Add some in Tasks.</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-zinc-500">Mood Trend</div>
          <div className="mt-1 text-2xl font-semibold">Latest Reflection</div>
          {latestReflection ? (
            <div className="mt-3">
              <p className="line-clamp-3 text-sm text-zinc-700">{latestReflection.text}</p>
              {latestReflection.sentimentLabel && (
                <div className={`mt-2 text-sm font-medium capitalize ${sentimentColor(latestReflection.sentimentLabel)}`}>
                  {latestReflection.sentimentLabel}
                  {latestReflection.sentimentScore != null && (
                    <span className="ml-1 font-normal text-zinc-500">
                      ({Math.round(latestReflection.sentimentScore * 100)}%)
                    </span>
                  )}
                </div>
              )}
              <div className="mt-1 text-xs text-zinc-400">
                {latestReflection.createdAt ? new Date(latestReflection.createdAt).toLocaleDateString() : ""}
              </div>
              <div className="mt-2 text-xs text-zinc-400">{reflections.length} total reflections</div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No reflections yet. Log one in Reflections.</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-zinc-500">Focus</div>
          <div className="mt-1 text-2xl font-semibold">Sessions</div>
          {sessions.length ? (
            <div className="mt-3">
              <div className="text-sm text-zinc-700">
                <span className="font-medium">{sessionStats.total}</span> sessions •{" "}
                <span className="font-medium">{sessionStats.totalMins}</span> min tracked
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {sessions.slice(0, 3).map((s) => (
                  <li key={s._id} className="text-sm text-zinc-600">
                    {new Date(s.startedAt).toLocaleDateString()} — {s.interruptions} interruption{s.interruptions !== 1 ? "s" : ""}
                  </li>
                ))}
                {sessions.length > 3 && <li className="text-xs text-zinc-400">+{sessions.length - 3} more</li>}
              </ul>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No sessions yet. Log one in Sessions.</p>
          )}
        </div>
      </section>
    </>
  );
}
