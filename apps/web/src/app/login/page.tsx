"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        if (!displayName.trim()) {
          setError("Display name is required.");
          return;
        }
        await signUp(email, password, displayName.trim());
      }
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fuchsia-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 shadow-2xl shadow-indigo-500/10 backdrop-blur md:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white md:flex">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-6 -bottom-10 h-40 w-40 rounded-full bg-fuchsia-400/30 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight">OptiTime</div>
                <div className="text-xs text-white/80">AI Decision Support</div>
              </div>
            </div>

            <p className="mt-8 text-lg font-medium leading-snug">
              Plan focused work, log reflections, and let the AI surface patterns in how you spend your day.
            </p>
          </div>

          <ul className="relative mt-10 flex flex-col gap-3 text-sm text-white/90">
            {[
              "Tasks with priority, difficulty, and estimated time",
              "Focus sessions with interruption tracking",
              "Reflections, automatically tagged with sentiment",
              "An AI coach that grounds answers in your own data",
            ].map((feature) => (
              <Feature key={feature}>{feature}</Feature>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">Welcome</div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
            {mode === "login" ? "Sign in to OptiTime" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            {mode === "login" ? "Pick up where you left off." : "It takes about ten seconds."}
          </p>

          <div className="mt-6 flex rounded-2xl border border-zinc-200 bg-white p-1 text-sm">
            <button
              type="button"
              className={`flex-1 rounded-xl py-2 font-medium transition ${
                mode === "login" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className={`flex-1 rounded-xl py-2 font-medium transition ${
                mode === "signup" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-50"
              }`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <form className="mt-5 flex flex-col gap-3" onSubmit={submit}>
            {mode === "signup" && (
              <input
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:shadow-lg disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/40">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      {children}
    </li>
  );
}
