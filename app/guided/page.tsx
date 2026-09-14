"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getProject,
  saveProject,
} from "@/lib/project-store";
import type {
  HowlsyProject,
  ProjectResourceType,
  ProjectVisualInstruction,
} from "@/types/project";

function formatVisualType(
  type: ProjectVisualInstruction["resourceType"]
) {
  switch (type) {
    case "three_d":
      return "3D model";
    case "annotated_image":
      return "Annotated image";
    case "blueprint":
      return "Blueprint";
    case "diagram":
      return "Diagram";
    case "illustration":
      return "Illustration";
  }
}

function formatResourceType(
  type: ProjectResourceType
) {
  switch (type) {
    case "three_d":
      return "3D";
    case "interactive":
      return "Interactive";
    case "illustration":
      return "Illustration";
    case "blueprint":
      return "Blueprint";
    case "diagram":
      return "Diagram";
    case "document":
      return "Document";
    case "product":
      return "Product";
    case "part":
      return "Part";
    case "source":
      return "Source";
    case "image":
      return "Image";
    case "video":
      return "Video";
    case "audio":
      return "Audio";
  }
}

export default function GuidedPage() {
  const router = useRouter();

  const [project, setProject] =
    useState<HowlsyProject | null>(null);

  const [currentStep, setCurrentStep] =
    useState(0);

  const [
    completedStepIds,
    setCompletedStepIds,
  ] = useState<Set<string>>(
    new Set()
  );

  const [isComplete, setIsComplete] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const storedProject = getProject();

    if (!storedProject) {
      setProject(null);
      setIsLoading(false);
      return;
    }

    const storedCompletedStepIds =
      new Set(
        storedProject.progress
          .completedStepIds
      );

    const storedCurrentStepIndex =
      storedProject.progress.currentStepId
        ? storedProject.steps.findIndex(
            (step) =>
              step.id ===
              storedProject.progress
                .currentStepId
          )
        : -1;

    const firstIncompleteStepIndex =
      storedProject.steps.findIndex(
        (step) =>
          !storedCompletedStepIds.has(
            step.id
          )
      );

    const initialStepIndex =
      storedCurrentStepIndex >= 0
        ? storedCurrentStepIndex
        : firstIncompleteStepIndex >= 0
          ? firstIncompleteStepIndex
          : 0;

    const allStepsComplete =
      storedProject.steps.length > 0 &&
      storedProject.steps.every(
        (step) =>
          storedCompletedStepIds.has(
            step.id
          )
      );

    setProject(storedProject);

    setCompletedStepIds(
      storedCompletedStepIds
    );

    setCurrentStep(
      initialStepIndex
    );

    setIsComplete(
      storedProject.status ===
        "completed" &&
        allStepsComplete
    );

    setIsLoading(false);
  }, []);

  function persistCurrentStep(
    index: number
  ) {
    if (!project) {
      return;
    }

    const targetStep =
      project.steps[index];

    if (!targetStep) {
      return;
    }

    const timestamp =
      new Date().toISOString();

    const nextProject: HowlsyProject = {
      ...project,

      status:
        project.status === "completed"
          ? "completed"
          : "in_progress",

      progress: {
        ...project.progress,

        currentStepId:
          targetStep.id,

        startedAt:
          project.progress.startedAt ??
          (project.status ===
          "completed"
            ? undefined
            : timestamp),
      },

      updatedAt: timestamp,
    };

    saveProject(nextProject);
    setProject(nextProject);
  }

  function handleBack() {
    if (currentStep === 0) {
      return;
    }

    const nextStepIndex =
      currentStep - 1;

    setCurrentStep(
      nextStepIndex
    );

    persistCurrentStep(
      nextStepIndex
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleSelectStep(
    index: number
  ) {
    setCurrentStep(index);

    persistCurrentStep(index);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleCompleteStep() {
    if (!project) {
      return;
    }

    const step =
      project.steps[currentStep];

    if (!step) {
      return;
    }

    const timestamp =
      new Date().toISOString();

    const nextCompletedStepIds =
      new Set(
        completedStepIds
      );

    nextCompletedStepIds.add(
      step.id
    );

    const orderedCompletedStepIds =
      project.steps
        .filter(
          (projectStep) =>
            nextCompletedStepIds.has(
              projectStep.id
            )
        )
        .map(
          (projectStep) =>
            projectStep.id
        );

    const isProjectComplete =
      project.steps.length > 0 &&
      project.steps.every(
        (projectStep) =>
          nextCompletedStepIds.has(
            projectStep.id
          )
      );

    if (isProjectComplete) {
      const completedProject:
        HowlsyProject = {
        ...project,

        status: "completed",

        progress: {
          completedStepIds:
            orderedCompletedStepIds,

          currentStepId:
            step.id,

          startedAt:
            project.progress
              .startedAt ??
            timestamp,

          completedAt:
            project.progress
              .completedAt ??
            timestamp,
        },

        updatedAt: timestamp,
      };

      saveProject(
        completedProject
      );

      setProject(
        completedProject
      );

      setCompletedStepIds(
        nextCompletedStepIds
      );

      setIsComplete(true);

      return;
    }

    const nextStepIndex =
      currentStep <
      project.steps.length - 1
        ? currentStep + 1
        : project.steps.findIndex(
            (projectStep) =>
              !nextCompletedStepIds.has(
                projectStep.id
              )
          );

    const safeNextStepIndex =
      nextStepIndex >= 0
        ? nextStepIndex
        : currentStep;

    const nextStep =
      project.steps[
        safeNextStepIndex
      ];

    const inProgressProject:
      HowlsyProject = {
      ...project,

      status: "in_progress",

      progress: {
        completedStepIds:
          orderedCompletedStepIds,

        currentStepId:
          nextStep.id,

        startedAt:
          project.progress
            .startedAt ??
          timestamp,
      },

      updatedAt: timestamp,
    };

    saveProject(
      inProgressProject
    );

    setProject(
      inProgressProject
    );

    setCompletedStepIds(
      nextCompletedStepIds
    );

    setCurrentStep(
      safeNextStepIndex
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleStartOver() {
    router.push("/");
  }

  function handleViewProject() {
    router.push("/project");
  }

  function handleRestartGuidedMode() {
    if (!project) {
      return;
    }

    const timestamp =
      new Date().toISOString();

    const restartedProject:
      HowlsyProject = {
      ...project,

      status: "ready",

      progress: {
        completedStepIds: [],
      },

      updatedAt: timestamp,
    };

    saveProject(
      restartedProject
    );

    setProject(
      restartedProject
    );

    setCompletedStepIds(
      new Set()
    );

    setCurrentStep(0);

    setIsComplete(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400"
            aria-hidden="true"
          />

          <p className="mt-4 text-slate-400">
            Loading guided
            project...
          </p>
        </div>
      </main>
    );
  }

  if (
    !project ||
    project.steps.length === 0
  ) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Howlsy
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            No guided project found.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Start a project before
            entering guided mode.
          </p>

          <button
            type="button"
            onClick={
              handleStartOver
            }
            className="mt-8 rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Start a new project
          </button>
        </section>
      </main>
    );
  }

  const step =
    project.steps[
      currentStep
    ];

  const completedCount =
    completedStepIds.size;

  const progress =
    (completedCount /
      project.steps.length) *
    100;

  const currentStepComplete =
    completedStepIds.has(
      step.id
    );

  const remainingStepCount =
    project.steps.length -
    completedCount;

  const completingCurrentWouldFinish =
    !currentStepComplete &&
    remainingStepCount === 1;

  if (isComplete) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Howlsy Guided Mode
          </p>

          <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-3xl font-bold text-slate-950">
            ✓
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            {
              project.steps
                .length
            }{" "}
            of{" "}
            {
              project.steps
                .length
            }{" "}
            steps completed
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Project complete.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            You&apos;ve worked
            through every guided
            step for:
          </p>

          <p className="mt-4 text-2xl font-semibold text-white">
            {project.title}
          </p>

          <div className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(
                  0
                );

                setIsComplete(
                  false
                );
              }}
              className="rounded-2xl border border-slate-700 px-6 py-4 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Review completed
              steps
            </button>

            <button
              type="button"
              onClick={
                handleViewProject
              }
              className="rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
              View full project
            </button>
          </div>

          <button
            type="button"
            onClick={
              handleRestartGuidedMode
            }
            className="mt-4 text-sm font-medium text-slate-500 transition hover:text-slate-300"
          >
            Restart guided mode
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <header>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Howlsy Guided Mode
              </p>

              <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">
                {project.title}
              </h1>
            </div>

            <button
              type="button"
              onClick={
                handleViewProject
              }
              className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
            >
              View full project
            </button>
          </div>
        </header>

        <section
          aria-label="Project progress"
          className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-300">
              {completedCount} of{" "}
              {project.steps.length}{" "}
              steps completed
            </span>

            <span className="font-semibold text-cyan-300">
              {Math.round(
                progress
              )}
              %
            </span>
          </div>

          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-label="Project completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(
              progress
            )}
          >
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {project.steps.map(
              (
                projectStep,
                index
              ) => {
                const isActive =
                  index ===
                  currentStep;

                const isFinished =
                  completedStepIds.has(
                    projectStep.id
                  );

                return (
                  <button
                    key={
                      projectStep.id
                    }
                    type="button"
                    onClick={() =>
                      handleSelectStep(
                        index
                      )
                    }
                    aria-current={
                      isActive
                        ? "step"
                        : undefined
                    }
                    className={`flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full border px-3 text-sm font-semibold transition ${
                      isActive
                        ? "border-cyan-400 bg-cyan-400 text-slate-950"
                        : isFinished
                          ? "border-emerald-800 bg-emerald-950 text-emerald-300"
                          : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500"
                    }`}
                    title={`Step ${projectStep.order}: ${projectStep.title}`}
                  >
                    {isFinished &&
                    !isActive
                      ? "✓"
                      : projectStep.order}
                  </button>
                );
              }
            )}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-lg font-bold text-slate-950">
                    {step.order}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                      Current step
                    </p>

                    <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                      {
                        step.title
                      }
                    </h2>
                  </div>
                </div>

                {step.estimatedDuration && (
                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-400">
                    {
                      step.estimatedDuration
                    }
                  </span>
                )}
              </div>

              {step.summary && (
                <p className="mt-5 max-w-3xl leading-7 text-slate-400">
                  {
                    step.summary
                  }
                </p>
              )}
            </div>

            <div className="p-6 sm:p-8">
              {step.warning && (
                <section className="mb-8 rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                    Warning
                  </p>

                  <p className="mt-3 leading-7 text-slate-200">
                    {
                      step.warning
                    }
                  </p>
                </section>
              )}

              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  What to do
                </p>

                <p className="mt-4 whitespace-pre-line text-lg leading-8 text-slate-200">
                  {
                    step.instructions
                  }
                </p>
              </section>

              {step.measurements.length >
                0 && (
                <section className="mt-10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                      Measure carefully
                    </p>

                    <h3 className="mt-2 text-xl font-semibold">
                      Measurements
                    </h3>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {step.measurements.map(
                      (
                        measurement,
                        index
                      ) => (
                        <div
                          key={`${step.id}-measurement-${index}`}
                          className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium text-slate-200">
                              {
                                measurement.label
                              }
                            </p>

                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                                measurement.verified
                                  ? "bg-emerald-950 text-emerald-300"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {measurement.verified
                                ? "Verified"
                                : "Unverified"}
                            </span>
                          </div>

                          <p className="mt-3 text-2xl font-bold text-cyan-300">
                            {
                              measurement.value
                            }
                            {measurement.unit
                              ? ` ${measurement.unit}`
                              : ""}
                          </p>

                          {measurement.tolerance && (
                            <p className="mt-2 text-sm text-slate-400">
                              Tolerance:{" "}
                              {
                                measurement.tolerance
                              }
                            </p>
                          )}

                          {measurement.notes && (
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                              {
                                measurement.notes
                              }
                            </p>
                          )}

                          {measurement.source && (
                            <p className="mt-3 text-xs text-slate-500">
                              Source:{" "}
                              {
                                measurement.source
                              }
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

              {step.specifications.length >
                0 && (
                <section className="mt-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    Exact requirements
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Specifications
                  </h3>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
                    {step.specifications.map(
                      (
                        specification,
                        index
                      ) => (
                        <div
                          key={`${step.id}-specification-${index}`}
                          className="border-b border-slate-800 bg-slate-950 p-5 last:border-b-0"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-slate-500">
                                {
                                  specification.name
                                }
                              </p>

                              <p className="mt-1 font-semibold text-slate-200">
                                {
                                  specification.value
                                }
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                                specification.verified
                                  ? "bg-emerald-950 text-emerald-300"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {specification.verified
                                ? "Verified"
                                : "Unverified"}
                            </span>
                          </div>

                          {specification.notes && (
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                              {
                                specification.notes
                              }
                            </p>
                          )}

                          {specification.source && (
                            <p className="mt-3 text-xs text-slate-500">
                              Source:{" "}
                              {
                                specification.source
                              }
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

              {step.visualInstructions
                .length > 0 && (
                <section className="mt-10">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                        Visual guidance
                      </p>

                      <h3 className="mt-2 text-xl font-semibold">
                        Visuals for
                        this step
                      </h3>
                    </div>

                    <span className="rounded-full border border-cyan-900 bg-cyan-950/30 px-3 py-1 text-xs font-medium text-cyan-300">
                      Enrichment pending
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {step.visualInstructions.map(
                      (
                        visual,
                        index
                      ) => (
                        <div
                          key={`${step.id}-visual-${index}`}
                          className="rounded-2xl border border-dashed border-cyan-900 bg-cyan-950/10 p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                                {formatVisualType(
                                  visual.resourceType
                                )}
                              </p>

                              <h4 className="mt-2 font-semibold text-slate-100">
                                {
                                  visual.title
                                }
                              </h4>
                            </div>

                            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs text-slate-400">
                              {visual.required
                                ? "Required"
                                : "Helpful"}
                            </span>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            {
                              visual.description
                            }
                          </p>

                          {visual.requestedDetails &&
                            visual.requestedDetails
                              .length >
                              0 && (
                              <div className="mt-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                  Should
                                  show
                                </p>

                                <ul className="mt-2 space-y-2">
                                  {visual.requestedDetails.map(
                                    (
                                      detail
                                    ) => (
                                      <li
                                        key={
                                          detail
                                        }
                                        className="flex gap-2 text-sm text-slate-300"
                                      >
                                        <span
                                          className="text-cyan-400"
                                          aria-hidden="true"
                                        >
                                          +
                                        </span>

                                        <span>
                                          {
                                            detail
                                          }
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

              {step.resources.length >
                0 && (
                <section className="mt-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    Resources
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Helpful resources
                  </h3>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {step.resources.map(
                      (resource) => (
                        <div
                          key={
                            resource.id
                          }
                          className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                              {formatResourceType(
                                resource.type
                              )}
                            </span>

                            <span className="text-xs uppercase tracking-wider text-slate-500">
                              {
                                resource.verificationStatus
                              }
                            </span>
                          </div>

                          <p className="mt-3 font-semibold text-slate-200">
                            {
                              resource.title
                            }
                          </p>

                          {resource.description && (
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {
                                resource.description
                              }
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

              {step.products.length >
                0 && (
                <section className="mt-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    Products and parts
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Items for this
                    step
                  </h3>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {step.products.map(
                      (product) => (
                        <div
                          key={
                            product.id
                          }
                          className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-200">
                                {
                                  product.name
                                }
                              </p>

                              {(product.brand ||
                                product.model) && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {[
                                    product.brand,
                                    product.model,
                                  ]
                                    .filter(
                                      Boolean
                                    )
                                    .join(
                                      " · "
                                    )}
                                </p>
                              )}
                            </div>

                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                                product.verifiedCompatibility
                                  ? "bg-emerald-950 text-emerald-300"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {product.verifiedCompatibility
                                ? "Verified"
                                : "Unverified"}
                            </span>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            {
                              product.purpose
                            }
                          </p>

                          {product.partNumber && (
                            <p className="mt-3 text-sm text-slate-300">
                              Part
                              number:{" "}
                              {
                                product.partNumber
                              }
                            </p>
                          )}

                          {product.compatibilityNotes && (
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {
                                product.compatibilityNotes
                              }
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

              {step.troubleshooting
                .length > 0 && (
                <section className="mt-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                    Something look
                    different?
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Troubleshooting
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Open the condition
                    that matches what
                    you&apos;re seeing
                    before moving
                    forward.
                  </p>

                  <div className="mt-4 space-y-3">
                    {step.troubleshooting.map(
                      (branch) => (
                        <details
                          key={
                            branch.id
                          }
                          className="group rounded-2xl border border-violet-950 bg-violet-950/10"
                        >
                          <summary className="cursor-pointer list-none p-5 font-medium text-slate-200">
                            <div className="flex items-center justify-between gap-4">
                              <span>
                                {
                                  branch.condition
                                }
                              </span>

                              <span
                                className="text-xl text-violet-400 transition group-open:rotate-45"
                                aria-hidden="true"
                              >
                                +
                              </span>
                            </div>
                          </summary>

                          <div className="border-t border-violet-950 p-5">
                            <p className="leading-7 text-slate-400">
                              {
                                branch.explanation
                              }
                            </p>

                            <div className="mt-4 rounded-xl bg-slate-950 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                                Do
                                this
                                next
                              </p>

                              <p className="mt-2 leading-7 text-slate-200">
                                {
                                  branch.nextAction
                                }
                              </p>
                            </div>

                            {branch.expectedResult && (
                              <div className="mt-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                  Expected
                                  result
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                  {
                                    branch.expectedResult
                                  }
                                </p>
                              </div>
                            )}

                            {branch.warning && (
                              <div className="mt-4 rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">
                                <p className="text-sm font-semibold text-amber-400">
                                  Warning
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                  {
                                    branch.warning
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </details>
                      )
                    )}
                  </div>
                </section>
              )}

              {(step.accessibility
                .visualDescription ||
                step.accessibility
                  .audioExplanation ||
                step.accessibility
                  .transcript) && (
                <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Accessible guidance
                  </p>

                  {step.accessibility
                    .visualDescription && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-slate-300">
                        Visual
                        description
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {
                          step.accessibility
                            .visualDescription
                        }
                      </p>
                    </div>
                  )}

                  {step.accessibility
                    .audioExplanation && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-slate-300">
                        Audio
                        explanation
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {
                          step.accessibility
                            .audioExplanation
                        }
                      </p>
                    </div>
                  )}

                  {step.accessibility
                    .transcript && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-semibold text-cyan-300">
                        Read transcript
                      </summary>

                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-400">
                        {
                          step.accessibility
                            .transcript
                        }
                      </p>
                    </details>
                  )}
                </section>
              )}

              <section className="mt-10 rounded-2xl border border-emerald-950 bg-emerald-950/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  Before continuing
                </p>

                <h3 className="mt-2 font-semibold text-slate-100">
                  Check your work
                </h3>

                <p className="mt-3 leading-7 text-slate-200">
                  {
                    step.completionCheck
                  }
                </p>
              </section>

              {currentStepComplete && (
                <div className="mt-5 rounded-2xl border border-emerald-900 bg-emerald-950/30 p-4">
                  <p className="flex items-center gap-2 font-semibold text-emerald-300">
                    <span aria-hidden="true">
                      ✓
                    </span>

                    This step has been
                    marked complete.
                  </p>
                </div>
              )}
            </div>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                Safety reminder
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {
                  project.safety
                    .summary
                }
              </p>

              {project.safety
                .protectiveEquipment
                .length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Protective
                    equipment
                  </p>

                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {project.safety.protectiveEquipment.map(
                      (item) => (
                        <li
                          key={
                            item
                          }
                          className="flex gap-2"
                        >
                          <span
                            className="text-amber-400"
                            aria-hidden="true"
                          >
                            •
                          </span>

                          <span>
                            {
                              item
                            }
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {project.safety
                .professionalHelpRecommended && (
                <div className="mt-4 rounded-xl border border-amber-800 bg-amber-950/40 p-4">
                  <p className="text-sm font-semibold text-amber-300">
                    Professional help
                    recommended
                  </p>

                  {project.safety
                    .professionalHelpReason && (
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {
                        project.safety
                          .professionalHelpReason
                      }
                    </p>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Project context
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Experience
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {project.experience ||
                      "Not provided."}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Constraints
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {project.constraints ||
                      "No constraints provided."}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <div className="sticky bottom-4 z-20 mt-8">
          <div className="flex gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur">
            <button
              type="button"
              onClick={handleBack}
              disabled={
                currentStep === 0
              }
              className="rounded-xl border border-slate-700 px-5 py-4 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Back
            </button>

            <button
              type="button"
              onClick={
                handleCompleteStep
              }
              className="flex-1 rounded-xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {currentStepComplete
                ? completedCount ===
                  project.steps.length
                  ? "Return to completion"
                  : currentStep ===
                      project.steps.length -
                        1
                    ? "Continue to next incomplete step"
                    : "Continue to next step"
                : completingCurrentWouldFinish
                  ? "Complete final remaining step"
                  : currentStep ===
                      project.steps.length -
                        1
                    ? "Mark step complete"
                    : "Mark complete & continue"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}