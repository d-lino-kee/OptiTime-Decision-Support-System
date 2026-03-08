"use client";

import { useState } from "react";


const KEY = "optitime_userId";

function readUserId(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(KEY) ?? "";
}

export function UserIdBar() {
  const [userId, setUserId] = useState<string>(() => readUserId());

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium">Dev User</div>

      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
        <input
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="Paste a userId (Mongo _id) from Swagger"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <button
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          onClick={() => localStorage.setItem(KEY, userId)}
        >
          Save
        </button>

        <button
          className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          onClick={() => {
            localStorage.removeItem(KEY);
            setUserId("");
          }}
        >
          Clear
        </button>
      </div>

      <p className="mt-2 text-xs text-zinc-500">Temporary until auth is implemented.</p>
    </div>
  );
}

export function getSavedUserId(): string {
  return readUserId();
}