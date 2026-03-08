const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/v1";
    
type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type User = {
    _id: string;
    displayName: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
};

export type TaskPriority = "low" | "medium" | "high";
export type TaskDifficulty = "easy" | "medium" | "hard";
export type TaskType = "study" | "work" | "health" | "personal" | "other";

export type Task = {
    _id: string;
    userId: string;
    title: string;
    notes?: string;
    priority: TaskPriority;
    difficulty: TaskDifficulty;
    type: TaskType;
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
    updatedAt?: string;
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
    updatedAt?: string;
};

async function http<T>(
    path: string,
    opts?: {
        method?: HttpMethod;
        body?: unknown;
        headers?: Record<string, string>;
    }
) : Promise<T> {
    const method = opts?.method ?? "GET";

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(opts?.headers ?? {}),
        },
        body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
        cache: "no-store",
    });

    if (!res.ok) {
        // Nest error response can be JSON; fall back to text
        const text = await res.text().catch(() => "");
        throw new Error(
            `API error ${res.status}: ${text || res.statusText} on ${method} ${path}: ${
            text || "(no body)"
            }`
        );
    }

    // DELETE often returns { ok: true }, still JSON
    return (await res.json()) as T;
}

//** Health */
export const healthApi = {
    ping: () => http<{ ok: boolean; service: string; timestamp: string }>("/health"),
};

//** Users */
export const usersApi = {
    list: () => http<User[]>("/users"),
    get: (id: string) => http<User>(`/users/${encodeURIComponent(id)}`),
    create: (body: { displayName: string; email: string }) =>
        http<User>("/users", { method: "POST", body }),
    update: (id: string, body: Partial<Pick<User, "displayName" | "email">>) =>
        http<User>(`/users/${encodeURIComponent(id)}`, { method: "PATCH", body }),
    remove: (id: string) =>
        http<{ ok: true }>(`/users/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

/** Tasks */
export const tasksApi = {
  listByUser: (userId: string) =>
    http<Task[]>(`/tasks?userId=${encodeURIComponent(userId)}`),

  get: (id: string) => http<Task>(`/tasks/${encodeURIComponent(id)}`),

  create: (body: {
    userId: string;
    title: string;
    notes?: string;
    priority: TaskPriority;
    difficulty: TaskDifficulty;
    type: TaskType;
    dueAt?: string;
    estimatedMinutes: number;
    tags?: string[];
  }) =>
    http<Task>("/tasks", {
      method: "POST",
      body: { ...body, tags: body.tags ?? [] },
    }),

  update: (
    id: string,
    body: Partial<{
      userId: string;
      title: string;
      notes?: string;
      priority: TaskPriority;
      difficulty: TaskDifficulty;
      type: TaskType;
      dueAt?: string;
      estimatedMinutes: number;
      tags: string[];
    }>
  ) =>
    http<Task>(`/tasks/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    }),

  remove: (id: string) =>
    http<{ ok: true }>(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

/** Reflections */
export const reflectionsApi = {
  listByUser: (userId: string) =>
    http<Reflection[]>(`/reflections?userId=${encodeURIComponent(userId)}`),

  get: (id: string) => http<Reflection>(`/reflections/${encodeURIComponent(id)}`),

  create: (body: { userId: string; text: string }) =>
    http<Reflection>("/reflections", { method: "POST", body }),

  update: (id: string, body: Partial<{ userId: string; text: string }>) =>
    http<Reflection>(`/reflections/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    }),

  remove: (id: string) =>
    http<{ ok: true }>(`/reflections/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};

/** Focus sessions */
export const sessionsApi = {
  listByUser: (userId: string) =>
    http<FocusSession[]>(`/sessions?userId=${encodeURIComponent(userId)}`),

  get: (id: string) => http<FocusSession>(`/sessions/${encodeURIComponent(id)}`),

  create: (body: {
    userId: string;
    taskId?: string;
    startedAt: string; // ISO string
    endedAt?: string; // ISO string
    interruptions?: number;
    notes?: string;
  }) =>
    http<FocusSession>("/sessions", {
      method: "POST",
      body: { ...body, interruptions: body.interruptions ?? 0 },
    }),

  update: (
    id: string,
    body: Partial<{
      userId: string;
      taskId?: string;
      startedAt: string;
      endedAt?: string;
      interruptions: number;
      notes?: string;
    }>
  ) =>
    http<FocusSession>(`/sessions/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    }),

  remove: (id: string) =>
    http<{ ok: true }>(`/sessions/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

/**
 * Chatbot (placeholder)
 * NOTE: Your NestJS API does not have /chat yet.
 * Once you add POST /v1/chat, this will work.
 */
export const chatApi = {
  send: (body: { userId: string; message: string }) =>
    http<{ reply: string }>("/chat", { method: "POST", body }),
};