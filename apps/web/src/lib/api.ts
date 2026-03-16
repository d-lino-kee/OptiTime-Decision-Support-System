const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/v1";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
    _getToken = fn;
}

export type User = {
    _id: string;
    firebaseUid: string;
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
): Promise<T> {
    const method = opts?.method ?? "GET";
    const token = await _getToken?.();

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(opts?.headers ?? {}),
        },
        body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
            `API error ${res.status}: ${text || res.statusText} on ${method} ${path}`
        );
    }

    return (await res.json()) as T;
}

/** Health */
export const healthApi = {
    ping: () => http<{ ok: boolean; service: string; timestamp: string }>("/health"),
};

/** Auth */
export const authApi = {
    me: () => http<User>("/auth/me"),
};

/** Users */
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
    list: () => http<Task[]>("/tasks"),

    get: (id: string) => http<Task>(`/tasks/${encodeURIComponent(id)}`),

    create: (body: {
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
        http<Task>(`/tasks/${encodeURIComponent(id)}`, { method: "PATCH", body }),

    remove: (id: string) =>
        http<{ ok: true }>(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

/** Reflections */
export const reflectionsApi = {
    list: () => http<Reflection[]>("/reflections"),

    get: (id: string) => http<Reflection>(`/reflections/${encodeURIComponent(id)}`),

    create: (body: { text: string }) =>
        http<Reflection>("/reflections", { method: "POST", body }),

    update: (id: string, body: Partial<{ text: string }>) =>
        http<Reflection>(`/reflections/${encodeURIComponent(id)}`, { method: "PATCH", body }),

    remove: (id: string) =>
        http<{ ok: true }>(`/reflections/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

/** Focus sessions */
export const sessionsApi = {
    list: () => http<FocusSession[]>("/sessions"),

    get: (id: string) => http<FocusSession>(`/sessions/${encodeURIComponent(id)}`),

    create: (body: {
        taskId?: string;
        startedAt: string;
        endedAt?: string;
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
            taskId?: string;
            startedAt: string;
            endedAt?: string;
            interruptions: number;
            notes?: string;
        }>
    ) =>
        http<FocusSession>(`/sessions/${encodeURIComponent(id)}`, { method: "PATCH", body }),

    remove: (id: string) =>
        http<{ ok: true }>(`/sessions/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

/** Chat */
export const chatApi = {
    send: (body: { message: string }) =>
        http<{ reply: string }>("/chat", { method: "POST", body }),
};
