"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function TopBar() {
    const [time, setTime] = useState<string>("");
    const { user } = useAuth();

    useEffect(() => {
        const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <header className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div>
            <div className="text-sm text-zinc-500">Welcome back{user?.displayName ? `, ${user.displayName}` : ""}</div>
            <div className="text-base font-semibold">Let&apos;s plan a strong day.</div>
        </div>
        <div className="text-sm text-zinc-500">{time}</div>
        </header>
    );
}
