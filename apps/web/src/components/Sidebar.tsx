"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ListChecks, MessageCircle, NotebookPen, Timer, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const nav = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, accent: "text-indigo-500" },
    { href: "/tasks", label: "Tasks", icon: ListChecks, accent: "text-emerald-500" },
    { href: "/reflections", label: "Reflections", icon: NotebookPen, accent: "text-violet-500" },
    { href: "/sessions", label: "Sessions", icon: Timer, accent: "text-amber-500" },
    { href: "/chat", label: "Chat", icon: MessageCircle, accent: "text-sky-500" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const initials = (user?.displayName ?? user?.email ?? "?")
        .split(/[\s@.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");

    return (
        <aside className="hidden md:flex md:w-72 md:flex-col md:gap-4 md:p-4">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-indigo-500/20 ring-1 ring-white/10">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-6 -bottom-10 h-32 w-32 rounded-full bg-fuchsia-400/30 blur-2xl" />

                <div className="relative flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/20">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">OptiTime</div>
                        <div className="text-xs text-white/80">AI Decision Support</div>
                    </div>
                </div>

                <p className="relative mt-5 text-sm leading-relaxed text-white/85">
                    Plan focused work, log reflections, and let the AI surface patterns in how you spend your day.
                </p>

                <div className="relative mt-5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/70">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px] shadow-emerald-300" />
                    All systems online
                </div>
            </div>

            <nav className="rounded-2xl border border-zinc-200 bg-white/80 p-2 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
                {nav.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                                active
                                    ? "bg-linear-to-r from-zinc-900 to-zinc-800 text-white shadow-sm"
                                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900",
                            )}
                        >
                            {active && (
                                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-linear-to-b from-indigo-400 to-fuchsia-400" />
                            )}
                            <Icon
                                className={cn(
                                    "h-4 w-4 transition",
                                    active ? "text-white" : `${item.accent} group-hover:scale-110`,
                                )}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white shadow-sm">
                        {initials || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{user?.displayName}</div>
                        <div className="truncate text-xs text-zinc-500">{user?.email}</div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={signOut}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
