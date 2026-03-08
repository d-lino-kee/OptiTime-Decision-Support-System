"use client";

import { useEffect, useMemo, useState } from "react";
import { UserIdBar, getSavedUserId } from "@/components/UserIdBar";
import { tasksApi, type Task } from "@/lib/api";

const defaults = {
  priority: "medium" as const,
  difficulty: "medium" as const,
  type: "study" as const,
  estimatedMinutes: 30,
  tags: [] as string[],
};

export default function TasksPage() {
  const [userId, setUserId] = useState("");
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
    const id = getSavedUserId();
    setUserId(id);
    if (id) refresh(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh(id = userId) {
    if (!id) return;
    setLoading(true);
    try {
      const data = await tasksApi.listByUser(id);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const mins = tasks.reduce((a, t) => a + (t.estimatedMinutes ?? 0), 0);
    return { total, mins };
  }, [tasks]);

  async function createTask() {
    if (!userId) return alert("Set a userId first.");
    if (!title.trim()) return alert("Title is required.");

    await tasksApi.create({
        userId,
        title: title.trim(),
        notes: notes.trim() || undefined,
        priority,
        difficulty,
        type,
        estimatedMinutes,
        tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
    });

    // Reset form
    setTitle("");
    setNotes("");
    setTags("");
    setEstimatedMinutes(defaults.estimatedMinutes);

    await refresh(userId);
    }


  async function deleteTask(id: string) {
    await tasksApi.remove(id);
    await refresh(userId);
  }

  return (
    <div className="flex flex-col gap-4">
      <UserIdBar />

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm text-zinc-500">Tasks</div>
            <div className="text-2xl font-semibold">Create & Prioritize</div>
            <div className="mt-1 text-sm text-zinc-600">
              Total: <span className="font-medium">{stats.total}</span> • Estimated minutes:{" "}
              <span className="font-medium">{stats.mins}</span>
            </div>
          </div>
          <button
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            onClick={() => refresh()}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <textarea
            className="md:col-span-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3 md:col-span-2 md:grid-cols-4">
            <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}>
              <option value="low">Priority: Low</option>
              <option value="medium">Priority: Medium</option>
              <option value="high">Priority: High</option>
            </select>
            <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Task["difficulty"])}>
              <option value="easy">Difficulty: Easy</option>
              <option value="medium">Difficulty: Medium</option>
              <option value="hard">Difficulty: Hard</option>
            </select>
            <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value as Task["type"])}>
              <option value="study">Type: Study</option>
              <option value="work">Type: Work</option>
              <option value="health">Type: Health</option>
              <option value="personal">Type: Personal</option>
              <option value="other">Type: Other</option>
            </select>
            <input
              type="number"
              min={1}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              placeholder="Est. minutes"
            />
          </div>

          <button
            className="md:col-span-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            onClick={createTask}
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-zinc-500">List</div>
        <div className="mt-1 text-lg font-semibold">Your tasks</div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          {tasks.map((t) => (
            <div key={t._id} className="rounded-2xl border border-zinc-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {t.type.toUpperCase()} • {t.priority.toUpperCase()} • {t.difficulty.toUpperCase()} • {t.estimatedMinutes} min
                  </div>
                  {t.notes ? <div className="mt-2 text-sm text-zinc-700">{t.notes}</div> : null}
                  {t.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {t.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50"
                  onClick={() => deleteTask(t._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!tasks.length && (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
              No tasks yet. Add one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}