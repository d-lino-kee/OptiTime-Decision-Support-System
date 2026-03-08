import { TopBar } from "@/components/TopBar";

export default function Page() {
  return (
    <>
      <TopBar />
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-zinc-500">Today</div>
          <div className="mt-1 text-2xl font-semibold">Your Plan</div>
          <p className="mt-2 text-sm text-zinc-600">
            This dashboard will show recommended time blocks once the scheduling endpoint is added.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-zinc-500">Mood Trend</div>
          <div className="mt-1 text-2xl font-semibold">Sentiment</div>
          <p className="mt-2 text-sm text-zinc-600">
            Reflections will power a weekly sentiment view (FastAPI service).
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-zinc-500">Focus</div>
          <div className="mt-1 text-2xl font-semibold">Sessions</div>
          <p className="mt-2 text-sm text-zinc-600">
            Track deep work sessions and interruptions.
          </p>
        </div>
      </section>
    </>
  );
}