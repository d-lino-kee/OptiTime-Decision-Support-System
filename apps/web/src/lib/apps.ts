const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/v1";

export type User = { _id: string; displayName: string; email: string };
export type Task = {
  _id: string;
  userId: string;
  title: string;
  notes?: string;
  priority: "low" | "medium" | "high";
  difficulty: "easy" | "medium" | "hard";
  type: "study" | "work" | "health" | "personal" | "other";
  dueAt?: string;
  estimatedMinutes: number;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type Reflection = {
  _id: string;
  userId: string;
  text: string;
  sentimentLabel?: string;
  sentimentScore?: number;
  sentimentConfidence?: number;
  createdAt?: string;
};

export type FocusSession = {
  _id: string;
  userId: string;
  taskId?: string;
  startedAt: string;
  endedAt?: string;
  interruptions: number;
  notes?: string;
  createdAt?: string;
};

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

// Users
export const usersApi = {
  list: () => http<User[]>("/users"),
  create: (body: { displayName: string; email: string }) =>
    http<User>("/users", { method: "POST", body: JSON.stringify(body) }),
};

// Tasks
export const tasksApi = {
  listByUser: (userId: string) => http<Task[]>(`/tasks?userId=${encodeURIComponent(userId)}`),
  create: (body: Omit<Task, "_id" | "createdAt" | "updatedAt">) =>
    http<Task>("/tasks", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Task>) =>
    http<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (id: string) => http<{ ok: true }>(`/tasks/${id}`, { method: "DELETE" }),
};

// Reflections
export const reflectionsApi = {
  listByUser: (userId: string) => http<Reflection[]>(`/reflections?userId=${encodeURIComponent(userId)}`),
  create: (body: { userId: string; text: string }) =>
    http<Reflection>("/reflections", { method: "POST", body: JSON.stringify(body) }),
  remove: (id: string) => http<{ ok: true }>(`/reflections/${id}`, { method: "DELETE" }),
};

// Sessions
export const sessionsApi = {
  listByUser: (userId: string) => http<FocusSession[]>(`/sessions?userId=${encodeURIComponent(userId)}`),
  create: (body: Omit<FocusSession, "_id" | "createdAt">) =>
    http<FocusSession>("/sessions", { method: "POST", body: JSON.stringify(body) }),
  remove: (id: string) => http<{ ok: true }>(`/sessions/${id}`, { method: "DELETE" }),
};

// Chatbot (placeholder: you’ll add /chat later in NestJS)
export const chatApi = {
  send: (body: { userId: string; message: string }) =>
    http<{ reply: string }>("/chat", { method: "POST", body: JSON.stringify(body) }),
};