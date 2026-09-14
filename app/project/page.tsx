"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProject } from "@/lib/project-store";
import type { HowlsyProject } from "@/types/project";

export default function ProjectPage() {
  const router = useRouter();

  const [project, setProject] = useState<HowlsyProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedProject = getProject();

    setProject(storedProject);
    setIsLoading(false);
  }, []);

  function handleStartGuidedMode() {
    router.push("/guided");
  }

  function handleStartOver() {
    router.push("/");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading project...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Howlsy
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            No project found.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Start a new project so Howlsy can build a plan for you.
          </p>

          <button
            type="button"
            onClick={handleStartOver}
            className="mt-8 rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Start a new project
          </button>
        </section>
      </main>
    );
  }

  const estimatedCost =
    project.estimatedCostMin !== undefined &&
    project.estimatedCostMax !== undefined
      ? `$${project.estimatedCostMin}–$${project.estimatedCostMax}`
      : "To be calculated";

  const difficultyLabel =
    project.difficulty === "beginner"
      ? "Beginner friendly"
      : project.difficulty === "intermediate"
        ? "Intermediate"
        : "Advanced";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Howlsy Project
          </p>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            {project.title}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            {project.description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Difficulty</p>
            <p className="mt-2 text-xl font-semibold">{difficultyLabel}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Estimated time</p>
            <p className="mt-2 text-xl font-semibold">
              {project.estimatedDuration}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Estimated cost</p>
            <p className="mt-2 text-xl font-semibold">{estimatedCost}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">What Howlsy knows</h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-400">Context</p>
                <p className="mt-2 leading-7 text-slate-200">
                  {project.context || "No additional context provided."}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400">
                  Experience level
                </p>
                <p className="mt-2 leading-7 text-slate-200">
                  {project.experience || "Not provided."}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400">
                  Constraints
                </p>
                <p className="mt-2 leading-7 text-slate-200">
                  {project.constraints || "No constraints provided."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Safety
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              {project.safety.summary}
            </h2>

            <div className="mt-5">
              <p className="text-sm font-medium text-slate-400">
                Potential hazards
              </p>

              <ul className="mt-3 space-y-2 text-slate-300">
                {project.safety.hazards.map((hazard) => (
                  <li key={hazard}>• {hazard}</li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-slate-400">
                Protective equipment
              </p>

              <ul className="mt-3 space-y-2 text-slate-300">
                {project.safety.protectiveEquipment.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            {project.safety.professionalHelpRecommended && (
              <div className="mt-5 rounded-xl border border-amber-800 bg-amber-950/40 p-4">
                <p className="font-semibold text-amber-300">
                  Professional help recommended
                </p>

                {project.safety.professionalHelpReason && (
                  <p className="mt-2 leading-7 text-slate-300">
                    {project.safety.professionalHelpReason}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Tools</h2>

            <ul className="mt-5 space-y-3">
              {project.tools.map((tool) => (
                <li
                  key={tool.name}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-300">{tool.name}</span>

                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {tool.required ? "Required" : "Optional"}
                    </span>
                  </div>

                  {tool.notes && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {tool.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Materials</h2>

            <ul className="mt-5 space-y-3">
              {project.materials.map((material) => (
                <li
                  key={material.name}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-300">{material.name}</span>

                    {material.quantity && (
                      <span className="text-sm text-slate-500">
                        {material.quantity}
                      </span>
                    )}
                  </div>

                  {material.estimatedCost !== undefined && (
                    <p className="mt-2 text-sm text-slate-500">
                      Estimated cost: ${material.estimatedCost}
                    </p>
                  )}

                  {material.notes && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {material.notes}
                    </p>
                  )}
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
            {project.steps.map((step) => (
              <div
                key={step.id}
                className="flex gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-950">
                  {step.order}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{step.title}</h3>

                  <p className="mt-2 leading-7 text-slate-300">
                    {step.instructions}
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-sm font-medium text-slate-400">
                      Completion check
                    </p>

                    <p className="mt-2 leading-6 text-slate-300">
                      {step.completionCheck}
                    </p>
                  </div>

                  {step.warning && (
                    <div className="mt-4 rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">
                      <p className="text-sm font-semibold text-amber-400">
                        Warning
                      </p>

                      <p className="mt-2 leading-6 text-slate-300">
                        {step.warning}
                      </p>
                    </div>
                  )}
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