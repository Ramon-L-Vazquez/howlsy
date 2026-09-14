"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createProjectFromIntake } from "@/lib/create-project";

function GuidedContent() {
  const searchParams = useSearchParams();

  const project = createProjectFromIntake({
    goal: searchParams.get("goal") ?? "",
    context: searchParams.get("context") ?? "",
    experience: searchParams.get("experience") ?? "",
    constraints: searchParams.get("constraints") ?? "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const step = project.steps[currentStep];
  const progress = ((currentStep + 1) / project.steps.length) * 100;

  function handleCompleteStep() {
    const isLastStep = currentStep === project.steps.length - 1;

    if (isLastStep) {
      setIsComplete(true);
      return;
    }

    setCurrentStep((previousStep) => previousStep + 1);
  }

  function handleBack() {
    if (currentStep === 0) {
      return;
    }

    setCurrentStep((previousStep) => previousStep - 1);
  }

  if (isComplete) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Howlsy
          </p>

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400 text-2xl font-bold text-slate-950">
            ✓
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Project complete.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            You&apos;ve completed every guided step for:
          </p>

          <p className="mt-4 text-2xl font-semibold text-white">
            {project.title}
          </p>

          <button
            type="button"
            onClick={() => {
              setCurrentStep(0);
              setIsComplete(false);
            }}
            className="mt-10 rounded-2xl border border-slate-700 px-6 py-4 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Review steps
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Howlsy Guided Mode
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              Step {currentStep + 1} of {project.steps.length}
            </span>

            <span>{Math.round(progress)}% complete</span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Current step
            </p>

            <span className="text-sm text-slate-500">
              {step.order} / {project.steps.length}
            </span>
          </div>

          <h2 className="mt-3 text-3xl font-bold">{step.title}</h2>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            {step.instructions}
          </p>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm font-medium text-slate-400">
              Before continuing
            </p>

            <p className="mt-2 leading-7 text-slate-200">
              {step.completionCheck}
            </p>
          </div>

          {step.warning && (
            <div className="mt-5 rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                Warning
              </p>

              <p className="mt-2 leading-7 text-slate-300">{step.warning}</p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Project context
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-slate-500">Details</p>
              <p className="mt-1 text-slate-300">
                {project.context || "No additional details provided."}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Experience</p>
              <p className="mt-1 text-slate-300">
                {project.experience || "Not provided."}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Constraints</p>
              <p className="mt-1 text-slate-300">
                {project.constraints || "No constraints provided."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-900/60 bg-amber-950/20 p-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Safety reminder
          </p>

          <p className="mt-3 leading-7 text-slate-300">
            {project.safety.summary}
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="rounded-2xl border border-slate-700 px-6 py-4 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleCompleteStep}
            className="flex-1 rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {currentStep === project.steps.length - 1
              ? "Complete project"
              : "Complete step"}
          </button>
        </div>
      </section>
    </main>
  );
}

function GuidedLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <p className="text-slate-400">Loading project...</p>
    </main>
  );
}

export default function GuidedPage() {
  return (
    <Suspense fallback={<GuidedLoading />}>
      <GuidedContent />
    </Suspense>
  );
}