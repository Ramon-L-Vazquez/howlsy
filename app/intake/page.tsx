"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function IntakePage() {
  const searchParams = useSearchParams();
  const initialGoal = searchParams.get("goal") ?? "";

  const [details, setDetails] = useState("");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Howlsy
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Let&apos;s understand what you&apos;re trying to do.
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Howlsy will ask a few questions before building your project plan.
        </p>

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">Your goal</p>

          <p className="mt-2 text-xl font-semibold text-white">
            {initialGoal || "No goal provided"}
          </p>
        </div>

        <div className="mt-8">
          <label
            htmlFor="details"
            className="mb-3 block text-sm font-medium text-slate-300"
          >
            Tell Howlsy a little more about it.
          </label>

          <textarea
            id="details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            className="min-h-40 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Add measurements, symptoms, location, constraints, or anything else Howlsy should know..."
          />
        </div>

        <button
          type="button"
          disabled={!details.trim()}
          className="mt-4 rounded-2xl bg-cyan-400 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </section>
    </main>
  );
}