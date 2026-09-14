"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const exampleTasks = [
  "Build a wall",
  "Fix my car",
  "Install a sink",
  "Start a business",
  "Learn a skill",
];

export default function Home() {
  const router = useRouter();
  const [goal, setGoal] = useState("");

  function handleStart() {
    const trimmedGoal = goal.trim();

    if (!trimmedGoal) {
      return;
    }

    const encodedGoal = encodeURIComponent(trimmedGoal);

    router.push(`/intake?goal=${encodedGoal}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Howlsy
        </p>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          What do you want to do?
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Tell Howlsy what you want to build, fix, learn, or accomplish.
        </p>

        <div className="mt-10 w-full max-w-2xl">
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            className="min-h-36 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="I want to..."
          />

          <button
            type="button"
            onClick={handleStart}
            disabled={!goal.trim()}
            className="mt-4 w-full rounded-2xl bg-cyan-400 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Get started
          </button>
        </div>

        <div className="mt-8 flex max-w-2xl flex-wrap justify-center gap-3">
          {exampleTasks.map((task) => (
            <button
              key={task}
              type="button"
              onClick={() => setGoal(task)}
              className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-white"
            >
              {task}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}