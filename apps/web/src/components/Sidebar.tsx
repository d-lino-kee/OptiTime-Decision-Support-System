"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ListChecks, MessageCircle, NotebookPen, Timer } from "lucide-react";

const nav = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks", icon: ListChecks },
    { href: "/notes", label: "Notes", icon: NotebookPen },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/timers", label: "Timers", icon: Timer },  
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex md:w-72 md:flex-col md:gap-3 md:p-4">
      <div className="rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 text-white shadow-lg">
        <div className="text-lg font-semibold">OptiTime</div>
        <div className="mt-1 text-sm text-zinc-300">Decision Support • AI Coach</div>
      </div>

      <nav className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
        Tip: set your API base URL in <code className="font-mono">.env.local</code>
      </div>
    </aside>
    )
}