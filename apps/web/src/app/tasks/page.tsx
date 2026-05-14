"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { tasksApi, type Task } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const defaults = {
  priority: "medium" as const,
  difficulty: "medium" as const,
  type: "study" as const,
  estimatedMinutes: 30,
};

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>(defaults.priority);
  const [difficulty, setDifficulty] = useState<Task["difficulty"]>(defaults.difficulty);
  const [type, setType] = useState<Task["type"]>(defaults.type);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(defaults.estimatedMinutes);
  const [tags, setTags] = useState<string>("");

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  async function refresh() {
    setLoading(true);
    try {
      setTasks(await tasksApi.list());
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(
    () => ({
      total: tasks.length,
      mins: tasks.reduce((a, t) => a + (t.estimatedMinutes ?? 0), 0),
    }),
    [tasks],
  );

  async function createTask() {
    if (!title.trim()) return alert("Title is required.");
    await tasksApi.create({
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      difficulty,
      type,
      estimatedMinutes,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setTitle("");
    setNotes("");
    setTags("");
    setEstimatedMinutes(defaults.estimatedMinutes);
    await refresh();
  }

  async function deleteTask(id: string) {
    await tasksApi.remove(id);
    await refresh();
  }

  const priorityBadge = (p: Task["priority"]) => {
    const cls =
      p === "high"
        ? "bg-rose-100 text-rose-700 ring-rose-200"
        : p === "medium"
          ? "bg-amber-100 text-amber-700 ring-amber-200"
          : "bg-zinc-100 text-zinc-600 ring-zinc-200";
    return (
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ring-1 ring-inset ${cls}`}>
        {p}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        accent="emerald"
        icon={<ListChecks className="h-6 w-6" />}
        eyebrow="Tasks"
        title="Plan and prioritise"
        subtitle="Capture work, set priority and difficulty, and let the AI cluster what's similar."
        right={
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span className="rounded-xl bg-emerald-100 px-3 py-1.5 font-semibold text-emerald-700">{stats.total}</span>
            <span className="hidden sm:inline">tasks</span>
            <span className="text-zinc-300">•</span>
            <span className="rounded-xl bg-zinc-100 px-3 py-1.5 font-semibold text-zinc-700">{stats.mins}</span>
            <span className="hidden sm:inline">min</span>
          </div>
        }
      />

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold tracking-tight text-zinc-800">New task</div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field
            placeholder="Task title"
            value={title}
            onChange={setTitle}
            className="md:col-span-2"
          />
          <Field
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={setTags}
            className="md:col-span-2"
          />
          <textarea
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 md:col-span-2"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(v) => setPriority(v as Task["priority"])}
            options={["low", "medium", "high"]}
          />
          <Select
            label="Difficulty"
            value={difficulty}
            onChange={(v) => setDifficulty(v as Task["difficulty"])}
            options={["easy", "medium", "hard"]}
          />
          <Select
            label="Type"
            value={type}
            onChange={(v) => setType(v as Task["type"])}
            options={["study", "work", "health", "personal", "other"]}
          />
          <NumberField
            label="Estimated min"
            value={estimatedMinutes}
            onChange={setEstimatedMinutes}
          />

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:shadow-lg md:col-span-2"
            onClick={createTask}
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight text-zinc-800">Your tasks</div>
          <button
            type="button"
            onClick={refresh}
            className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          {tasks.map((t) => (
            <div
              key={t._id}
              className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-zinc-900">{t.title}</span>
                    {priorityBadge(t.priority)}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600">{t.type}</span>
                    <span>•</span>
                    <span>{t.difficulty} difficulty</span>
                    <span>•</span>
                    <span>{t.estimatedMinutes} min</span>
                  </div>
                  {t.notes && <div className="mt-2 text-sm text-zinc-700">{t.notes}</div>}
                  {t.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-inset ring-emerald-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                  onClick={() => deleteTask(t._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!tasks.length && (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
              No tasks yet. Add one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      className={`rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 ${className ?? ""}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      <select
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o.charAt(0).toUpperCase() + o.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      <input
        type="number"
        min={1}
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function PageHeader({
  accent,
  icon,
  eyebrow,
  title,
  subtitle,
  right,
}: {
  accent: "emerald" | "violet" | "amber" | "sky";
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  const palette = {
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600", eyebrow: "text-emerald-700" },
    violet: { bg: "bg-violet-100", text: "text-violet-600", eyebrow: "text-violet-700" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", eyebrow: "text-amber-700" },
    sky: { bg: "bg-sky-100", text: "text-sky-600", eyebrow: "text-sky-700" },
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-zinc-100/70 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${palette.bg} ${palette.text}`}>
            {icon}
          </div>
          <div>
            <div className={`text-[11px] font-semibold uppercase tracking-wider ${palette.eyebrow}`}>{eyebrow}</div>
            <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-900">{title}</h2>
            <p className="mt-1 max-w-xl text-sm text-zinc-600">{subtitle}</p>
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}
