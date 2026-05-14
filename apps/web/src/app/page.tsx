"use client";

import { useEffect, useState } from "react";
import { ListChecks, NotebookPen, Timer, TrendingUp } from "lucide-react";
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

  const sentimentChip = (label?: string) => {
    if (!label) return null;
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
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <TopBar />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-zinc-800">Overview</h2>
        <button
          type="button"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          onClick={load}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          icon={<ListChecks className="h-5 w-5" />}
          accent="emerald"
          eyebrow="Today"
          title="Tasks"
        >
          {tasks.length ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-zinc-900">{taskStats.total}</span>
                <span className="text-sm text-zinc-500">queued</span>
              </div>
              <div className="mt-1 text-sm text-zinc-600">
                {taskStats.totalMins} min estimated
                {taskStats.high > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                    {taskStats.high} high priority
                  </span>
                )}
              </div>
              <ul className="mt-4 flex flex-col gap-1.5">
                {tasks.slice(0, 4).map((t) => (
                  <li key={t._id} className="flex items-center gap-2 text-sm text-zinc-700">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        t.priority === "high"
                          ? "bg-rose-400"
                          : t.priority === "medium"
                            ? "bg-amber-400"
                            : "bg-zinc-300"
                      }`}
                    />
                    <span className="truncate">{t.title}</span>
                  </li>
                ))}
                {tasks.length > 4 && (
                  <li className="text-xs text-zinc-400">+{tasks.length - 4} more</li>
                )}
              </ul>
            </>
          ) : (
            <EmptyState>No tasks yet. Add some in Tasks.</EmptyState>
          )}
        </StatCard>

        <StatCard
          icon={<NotebookPen className="h-5 w-5" />}
          accent="violet"
          eyebrow="Mood trend"
          title="Latest reflection"
        >
          {latestReflection ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-zinc-900">{reflections.length}</span>
                <span className="text-sm text-zinc-500">total</span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-zinc-700">{latestReflection.text}</p>
              <div className="mt-3 flex items-center gap-2">
                {sentimentChip(latestReflection.sentimentLabel)}
                <span className="text-xs text-zinc-400">
                  {latestReflection.createdAt ? new Date(latestReflection.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
            </>
          ) : (
            <EmptyState>No reflections yet. Log one in Reflections.</EmptyState>
          )}
        </StatCard>

        <StatCard
          icon={<Timer className="h-5 w-5" />}
          accent="amber"
          eyebrow="Focus"
          title="Sessions"
        >
          {sessions.length ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-zinc-900">{sessionStats.totalMins}</span>
                <span className="text-sm text-zinc-500">min tracked</span>
              </div>
              <div className="mt-1 text-sm text-zinc-600">{sessionStats.total} sessions logged</div>
              <ul className="mt-4 flex flex-col gap-1.5">
                {sessions.slice(0, 3).map((s) => (
                  <li key={s._id} className="flex items-center gap-2 text-sm text-zinc-600">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                    {new Date(s.startedAt).toLocaleDateString()}
                    <span className="text-zinc-400">•</span>
                    <span>{s.interruptions} interruption{s.interruptions !== 1 ? "s" : ""}</span>
                  </li>
                ))}
                {sessions.length > 3 && (
                  <li className="text-xs text-zinc-400">+{sessions.length - 3} more</li>
                )}
              </ul>
            </>
          ) : (
            <EmptyState>No sessions yet. Log one in Sessions.</EmptyState>
          )}
        </StatCard>
      </section>
    </div>
  );
}

type Accent = "emerald" | "violet" | "amber";
const accentStyles: Record<Accent, { ring: string; iconBg: string; iconText: string; eyebrow: string }> = {
  emerald: {
    ring: "before:bg-linear-to-br before:from-emerald-200/60 before:to-emerald-100/0",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    eyebrow: "text-emerald-700",
  },
  violet: {
    ring: "before:bg-linear-to-br before:from-violet-200/60 before:to-violet-100/0",
    iconBg: "bg-violet-100",
    iconText: "text-violet-600",
    eyebrow: "text-violet-700",
  },
  amber: {
    ring: "before:bg-linear-to-br before:from-amber-200/60 before:to-amber-100/0",
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    eyebrow: "text-amber-700",
  },
};

function StatCard({
  icon,
  accent,
  eyebrow,
  title,
  children,
}: {
  icon: React.ReactNode;
  accent: Accent;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  const a = accentStyles[accent];
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg before:pointer-events-none before:absolute before:-right-12 before:-top-12 before:h-40 before:w-40 before:rounded-full before:blur-2xl before:transition before:duration-500 group-hover:before:scale-110 ${a.ring}`}
    >
      <div className="relative flex items-center justify-between">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${a.iconBg} ${a.iconText}`}>
          {icon}
        </div>
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${a.eyebrow}`}>{eyebrow}</span>
      </div>
      <div className="relative mt-4 text-lg font-semibold tracking-tight text-zinc-800">{title}</div>
      <div className="relative mt-3">{children}</div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}
