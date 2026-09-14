"use client";

import { HowlsyLogo } from "@/components/brand/howlsy-logo";
import { HowlsyMark } from "@/components/brand/howlsy-mark";
import { getProject } from "@/lib/project-store";
import type { HowlsyProject } from "@/types/project";
import { useRouter } from "next/navigation";
import {
  KeyboardEvent,
  useEffect,
  useState,
} from "react";

const exampleTasks = [
  {
    label: "Build something",
    prompt: "I want to build a workbench",
    icon: "▱",
  },
  {
    label: "Fix something",
    prompt: "I need help figuring out why my car won't start",
    icon: "◇",
  },
  {
    label: "Install something",
    prompt: "I want to install a kitchen sink",
    icon: "＋",
  },
  {
    label: "Start something",
    prompt: "I want to start a small business",
    icon: "↗",
  },
  {
    label: "Learn something",
    prompt: "I want to learn a new skill",
    icon: "○",
  },
];

const projectStatusLabels: Record<
  HowlsyProject["status"],
  string
> = {
  draft: "Draft",
  ready: "Ready",
  in_progress: "In progress",
  completed: "Completed",
};

/*
 * Progress is derived from persisted completed step IDs instead of
 * storing a separate percentage. This keeps the percentage consistent
 * with the project's actual execution state.
 */
function getProjectProgress(project: HowlsyProject) {
  const totalSteps = project.steps.length;

  if (totalSteps === 0) {
    return {
      completedSteps: 0,
      totalSteps: 0,
      percentage: 0,
    };
  }

  const validStepIds = new Set(
    project.steps.map((step) => step.id)
  );

  const completedSteps = new Set(
    project.progress.completedStepIds.filter((stepId) =>
      validStepIds.has(stepId)
    )
  ).size;

  return {
    completedSteps,
    totalSteps,
    percentage: Math.round(
      (completedSteps / totalSteps) * 100
    ),
  };
}

/*
 * The saved current step gives the workspace a useful resume target.
 * If no current step has been persisted yet, the first incomplete step
 * becomes the next actionable step.
 */
function getResumeStep(project: HowlsyProject) {
  if (project.status === "completed") {
    return null;
  }

  const persistedCurrentStep = project.steps.find(
    (step) => step.id === project.progress.currentStepId
  );

  if (persistedCurrentStep) {
    return persistedCurrentStep;
  }

  const completedStepIds = new Set(
    project.progress.completedStepIds
  );

  return (
    project.steps.find(
      (step) => !completedStepIds.has(step.id)
    ) ?? project.steps[0] ?? null
  );
}

function getProjectActionLabel(project: HowlsyProject) {
  if (project.status === "completed") {
    return "Review project";
  }

  if (
    project.status === "in_progress" ||
    project.progress.completedStepIds.length > 0 ||
    project.progress.startedAt
  ) {
    return "Continue project";
  }

  return "Start project";
}

export default function Home() {
  const router = useRouter();

  const [goal, setGoal] = useState("");
  const [savedProject, setSavedProject] =
    useState<HowlsyProject | null>(null);

  /*
   * Project persistence currently lives in browser localStorage.
   * Reading it after mount keeps browser-only storage access out of
   * the server-rendering path.
   */
  useEffect(() => {
    setSavedProject(getProject());
  }, []);

  function handleStart() {
    const trimmedGoal = goal.trim();

    if (!trimmedGoal) {
      return;
    }

    router.push(
      `/intake?goal=${encodeURIComponent(trimmedGoal)}`
    );
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleStart();
    }
  }

  function handleResumeProject() {
    if (!savedProject) {
      return;
    }

    if (savedProject.status === "completed") {
      router.push("/project");
      return;
    }

    router.push("/guided");
  }

  const progress = savedProject
    ? getProjectProgress(savedProject)
    : null;

  const resumeStep = savedProject
    ? getResumeStep(savedProject)
    : null;

  const projectActionLabel = savedProject
    ? getProjectActionLabel(savedProject)
    : null;

  return (
    <main className="howlsy-background min-h-screen text-[var(--foreground)]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <HowlsyLogo markClassName="h-10 w-10" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              document
                .getElementById("workspace")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }}
            className="howlsy-interactive hidden rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] sm:block"
          >
            My projects
          </button>

          <button
            type="button"
            aria-label="Open account menu"
            className="howlsy-interactive flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--foreground-muted)]"
          >
            RV
          </button>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:px-10 lg:pt-28">
        <div className="flex max-w-3xl flex-col items-center text-center">
          <div className="relative mb-7">
            <div
              aria-hidden="true"
              className="absolute inset-2 rounded-full bg-[var(--accent-glow)] blur-2xl"
            />

            <HowlsyMark className="relative h-24 w-24 sm:h-28 sm:w-28" />
          </div>

          <p className="mb-4 text-sm font-semibold tracking-[0.18em] text-[var(--accent)]">
            DON&apos;T KNOW HOW? EASY.
          </p>

          <h1 className="text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            What do you want to do?
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--foreground-muted)] sm:text-lg">
            Tell Howlsy what you want to build, fix, install,
            learn, or accomplish. We&apos;ll figure out what you
            need and guide you through it step by step.
          </p>
        </div>

        <div className="mt-10 w-full max-w-3xl">
          <div className="howlsy-surface overflow-hidden rounded-[var(--radius-large)] shadow-2xl shadow-black/20">
            <label
              htmlFor="howlsy-goal"
              className="sr-only"
            >
              What do you want to do?
            </label>

            <textarea
              id="howlsy-goal"
              value={goal}
              onChange={(event) =>
                setGoal(event.target.value)
              }
              onKeyDown={handleKeyDown}
              className="min-h-36 w-full resize-none bg-transparent px-5 pb-4 pt-5 text-base leading-7 text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)] sm:min-h-40 sm:px-6 sm:pt-6 sm:text-lg"
              placeholder="I want to..."
              autoFocus
            />

            <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] px-4 py-3 sm:px-5">
              <p className="hidden text-xs text-[var(--foreground-subtle)] sm:block">
                Enter to continue · Shift + Enter for a new line
              </p>

              <button
                type="button"
                onClick={handleStart}
                disabled={!goal.trim()}
                className="ml-auto flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-bright)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Start project

                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full max-w-3xl">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
            Or start with an idea
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {exampleTasks.map((task) => (
              <button
                key={task.label}
                type="button"
                onClick={() =>
                  setGoal(task.prompt)
                }
                className="howlsy-interactive group flex min-h-24 flex-col items-start justify-between rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--surface)] p-4 text-left"
              >
                <span
                  aria-hidden="true"
                  className="text-xl text-[var(--accent)]"
                >
                  {task.icon}
                </span>

                <span className="mt-3 text-sm font-medium text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]">
                  {task.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <section
          id="workspace"
          className="mt-16 w-full max-w-5xl scroll-mt-8 border-t border-[var(--border)] pt-8"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Your workspace
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                {savedProject
                  ? savedProject.status === "completed"
                    ? "Your completed project"
                    : "Continue where you left off"
                  : "Projects live here"}
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-[var(--foreground-muted)]">
              {savedProject
                ? savedProject.status === "completed"
                  ? "Your completed Howlsy project is saved on this device and ready to review."
                  : "Your current Howlsy project is saved on this device and ready when you are."
                : "Once you start building with Howlsy, your active project will appear here so you can pick up where you left off."}
            </p>
          </div>

          {savedProject && progress ? (
            <article className="howlsy-surface mt-6 overflow-hidden rounded-[var(--radius-large)]">
              <div className="flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 gap-4">
                  <div className="hidden shrink-0 sm:block">
                    <HowlsyMark className="h-14 w-14" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[var(--border)] bg-[var(--surface-interactive)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                        {
                          projectStatusLabels[
                            savedProject.status
                          ]
                        }
                      </span>

                      <span className="text-xs text-[var(--foreground-subtle)]">
                        {savedProject.category}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                      {savedProject.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)]">
                      {savedProject.description}
                    </p>

                    <div className="mt-5">
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span className="font-medium text-[var(--foreground-muted)]">
                          {savedProject.status === "completed"
                            ? "Project complete"
                            : "Project progress"}
                        </span>

                        <span className="font-semibold text-[var(--foreground)]">
                          {progress.percentage}%
                        </span>
                      </div>

                      <div
                        className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-interactive)]"
                        role="progressbar"
                        aria-label="Project progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress.percentage}
                      >
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
                          style={{
                            width: `${progress.percentage}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--foreground-subtle)]">
                        <span>
                          {progress.completedSteps} of{" "}
                          {progress.totalSteps} steps completed
                        </span>

                        {resumeStep ? (
                          <span className="max-w-full truncate sm:max-w-[55%]">
                            Next:{" "}
                            <span className="text-[var(--foreground-muted)]">
                              {resumeStep.title}
                            </span>
                          </span>
                        ) : savedProject.status ===
                          "completed" ? (
                          <span className="text-[var(--foreground-muted)]">
                            All steps completed
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--foreground-subtle)]">
                      <span>
                        Difficulty:{" "}
                        <strong className="font-medium text-[var(--foreground-muted)]">
                          {savedProject.difficulty}
                        </strong>
                      </span>

                      <span>
                        Time:{" "}
                        <strong className="font-medium text-[var(--foreground-muted)]">
                          {savedProject.estimatedDuration}
                        </strong>
                      </span>

                      <span>
                        Steps:{" "}
                        <strong className="font-medium text-[var(--foreground-muted)]">
                          {savedProject.steps.length}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResumeProject}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-bright)]"
                >
                  {projectActionLabel}

                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <div className="border-t border-[var(--border)] bg-[var(--surface-raised)]/40 px-6 py-4 sm:px-7">
                <p className="truncate text-xs text-[var(--foreground-subtle)]">
                  Goal:{" "}
                  <span className="text-[var(--foreground-muted)]">
                    {savedProject.goal}
                  </span>
                </p>
              </div>
            </article>
          ) : (
            <div className="mt-6 rounded-[var(--radius-large)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)]/50 px-6 py-10 text-center">
              <HowlsyMark className="mx-auto h-12 w-12 opacity-70" />

              <h3 className="mt-4 font-semibold">
                Your first project starts above.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--foreground-muted)]">
                Describe what you want to accomplish and
                Howlsy will turn it into a guided project
                you can work through.
              </p>
            </div>
          )}
        </section>
      </section>

      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-[var(--foreground-subtle)] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>Howlsy</span>
          <span>Don&apos;t know how? Easy.</span>
        </div>
      </footer>
    </main>
  );
}