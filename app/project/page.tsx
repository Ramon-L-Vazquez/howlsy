"use client";

import { useRouter, useSearchParams } from "next/navigation";

const projectSteps = [
  {
    title: "Review the goal and constraints",
    description:
      "Confirm exactly what you want to accomplish and identify anything that could affect the plan.",
  },
  {
    title: "Gather the required tools and materials",
    description:
      "Prepare everything needed before beginning so the project can move forward without unnecessary stops.",
  },
  {
    title: "Complete the project step by step",
    description:
      "Follow Howlsy one step at a time and verify each stage before moving to the next.",
  },
];

const tools = ["Basic hand tools", "Measuring tools", "Safety equipment"];

const materials = [
  "Project-specific materials",
  "Replacement parts if needed",
  "Consumable supplies",
];

export default function ProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goal = searchParams.get("goal") ?? "Untitled project";
  const context = searchParams.get("context") ?? "";
  const experience = searchParams.get("experience") ?? "";
  const constraints = searchParams.get("constraints") ?? "";

  function handleStartGuidedMode() {
    const params = new URLSearchParams({
      goal,
      context,
      experience,
      constraints,
    });

    router.push(`/guided?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Howlsy Project
          </p>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            {goal}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Here&apos;s your initial project plan based on the information you
            provided.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Difficulty</p>
            <p className="mt-2 text-xl font-semibold">Beginner friendly</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Estimated time</p>
            <p className="mt-2 text-xl font-semibold">Varies by project</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Estimated cost</p>
            <p className="mt-2 text-xl font-semibold">To be calculated</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">What Howlsy knows</h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-400">Context</p>
                <p className="mt-2 leading-7 text-slate-200">
                  {context || "No additional context provided."}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400">
                  Experience level
                </p>
                <p className="mt-2 leading-7 text-slate-200">
                  {experience || "Not provided."}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400">
                  Constraints
                </p>
                <p className="mt-2 leading-7 text-slate-200">
                  {constraints || "No constraints provided."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Safety
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              Verify hazards before starting.
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              This is placeholder project guidance. Howlsy will eventually
              evaluate the specific task for hazards, uncertainty, required
              protective equipment, and situations where professional help may
              be appropriate.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Tools</h2>

            <ul className="mt-5 space-y-3">
              {tools.map((tool) => (
                <li
                  key={tool}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Materials</h2>

            <ul className="mt-5 space-y-3">
              {materials.map((material) => (
                <li
                  key={material}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300"
                >
                  {material}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Project plan
            </p>

            <h2 className="mt-2 text-3xl font-bold">What to do next</h2>
          </div>

          <div className="space-y-4">
            {projectSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-950">
                  {index + 1}
                </div>

                <div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>

                  <p className="mt-2 leading-7 text-slate-300">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartGuidedMode}
          className="mt-10 w-full rounded-2xl bg-cyan-400 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Start guided mode
        </button>
      </section>
    </main>
  );
}