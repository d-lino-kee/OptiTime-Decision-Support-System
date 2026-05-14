"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function TopBar() {
    const [now, setNow] = useState<Date>(() => new Date());
    const { user } = useAuth();

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const hour = now.getHours();
    const greeting =
        hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    const dateLabel = now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    const timeLabel = now.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
    });

    return (
        <header className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="absolute -bottom-12 right-24 h-28 w-28 rounded-full bg-fuchsia-200/40 blur-3xl" />

            <div className="relative flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">{dateLabel}</div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {greeting}
                        {user?.displayName ? (
                            <>
                                ,{" "}
                                <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    {user.displayName.split(" ")[0]}
                                </span>
                            </>
                        ) : null}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Let&apos;s plan a strong, focused day.
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/60 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200">
                    <Clock3 className="h-4 w-4 text-indigo-500" />
                    {timeLabel}
                </div>
            </div>
        </header>
    );
}
