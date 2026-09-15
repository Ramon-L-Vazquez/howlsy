"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getProject } from "@/lib/project-store";
import type {
  HowlsyProject,
  ProjectResourceType,
  ProjectVisualInstruction,
} from "@/types/project";

function formatResourceType(
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

function formatResourceLabel(type: ProjectResourceType) {
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProjectPage() {
  const router = useRouter();

  const [project, setProject] = useState<HowlsyProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    const storedProject = getProject();

    setProject(storedProject);
    setIsLoading(false);
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
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
        <div className="text-center">
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400"
            aria-hidden="true"
          />

          <p className="mt-4 text-slate-400">Loading project...</p>
        </div>
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
            className="mt-8 rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950"
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
      ? `${formatMoney(project.estimatedCostMin)}–${formatMoney(
          project.estimatedCostMax
        )}`
      : project.estimatedCostMin !== undefined
        ? `From ${formatMoney(project.estimatedCostMin)}`
        : project.estimatedCostMax !== undefined
          ? `Up to ${formatMoney(project.estimatedCostMax)}`
          : "To be calculated";

  const difficultyLabel =
    project.difficulty === "beginner"
      ? "Beginner friendly"
      : project.difficulty === "intermediate"
        ? "Intermediate"
        : "Advanced";

  const totalVisuals = project.steps.reduce(
    (total, step) => total + step.visualInstructions.length,
    0
  );

  const totalTroubleshootingBranches = project.steps.reduce(
    (total, step) => total + step.troubleshooting.length,
    0
  );

  const totalMeasurements = project.steps.reduce(
    (total, step) => total + step.measurements.length,
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Howlsy Project
            </p>

            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
              {project.category}
            </span>
          </div>

          <h1 className="mt-4 max-w-5xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {project.title}
          </h1>

          <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
            {project.description}
          </p>
        </header>

        <section
          aria-label="Project overview"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
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

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Project steps</p>
            <p className="mt-2 text-xl font-semibold">
              {project.steps.length}
            </p>
          </div>
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-950 bg-cyan-950/20 p-4">
            <p className="text-2xl font-bold text-cyan-300">
              {totalMeasurements}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Measurements in this plan
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-950 bg-cyan-950/20 p-4">
            <p className="text-2xl font-bold text-cyan-300">{totalVisuals}</p>
            <p className="mt-1 text-sm text-slate-400">
              Planned visual resources
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-950 bg-cyan-950/20 p-4">
            <p className="text-2xl font-bold text-cyan-300">
              {totalTroubleshootingBranches}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Troubleshooting branches
            </p>
          </div>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Project context
            </p>

            <h2 className="mt-2 text-xl font-semibold">What Howlsy knows</h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-400">Goal</p>
                <p className="mt-2 leading-7 text-slate-200">{project.goal}</p>
              </div>

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
          </section>

          <section className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Safety
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              {project.safety.summary}
            </h2>

            {project.safety.hazards.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-medium text-slate-400">
                  Potential hazards
                </p>

                <ul className="mt-3 space-y-2 text-slate-300">
                  {project.safety.hazards.map((hazard) => (
                    <li key={hazard} className="flex gap-3">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
                        aria-hidden="true"
                      />
                      <span>{hazard}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.safety.protectiveEquipment.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-medium text-slate-400">
                  Protective equipment
                </p>

                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.safety.protectiveEquipment.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-amber-900/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-100"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
          </section>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  Equipment
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Tools</h2>
              </div>

              <p className="text-sm text-slate-500">
                {project.tools.length} total
              </p>
            </div>

            <ul className="mt-5 space-y-3">
              {project.tools.map((tool) => (
                <li
                  key={tool.name}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-200">{tool.name}</p>

                      {tool.quantity && (
                        <p className="mt-1 text-sm text-slate-500">
                          Quantity: {tool.quantity}
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                        tool.required
                          ? "bg-cyan-950 text-cyan-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {tool.required ? "Required" : "Optional"}
                    </span>
                  </div>

                  {tool.notes && (
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {tool.notes}
                    </p>
                  )}

                  {tool.safetyNotes && (
                    <div className="mt-3 rounded-lg border border-amber-900/50 bg-amber-950/20 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Safety note
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {tool.safetyNotes}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  Supplies
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Materials</h2>
              </div>

              <p className="text-sm text-slate-500">
                {project.materials.length} total
              </p>
            </div>

            <ul className="mt-5 space-y-3">
              {project.materials.map((material) => (
                <li
                  key={material.name}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-200">
                        {material.name}
                      </p>

                      {material.quantity && (
                        <p className="mt-1 text-sm text-slate-500">
                          Quantity: {material.quantity}
                        </p>
                      )}
                    </div>

                    {material.estimatedCost !== undefined && (
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                        {formatMoney(material.estimatedCost)}
                      </span>
                    )}
                  </div>

                  {material.dimensions && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Dimensions
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        {material.dimensions}
                      </p>
                    </div>
                  )}

                  {material.specifications && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Specifications
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {material.specifications}
                      </p>
                    </div>
                  )}

                  {material.notes && (
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {material.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-12">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Project plan
            </p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Your complete roadmap
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-slate-400">
              Review the complete plan here, then enter guided mode when
              you&apos;re ready for Howlsy to walk you through it one step at a
              time.
            </p>
          </div>

          <div className="space-y-6">
            {project.steps.map((step) => (
              <article
                key={step.id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
              >
                <div className="border-b border-slate-800 p-6 sm:p-8">
                  <div className="flex gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-950">
                      {step.order}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold sm:text-2xl">
                          {step.title}
                        </h3>

                        {step.estimatedDuration && (
                          <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-400">
                            {step.estimatedDuration}
                          </span>
                        )}
                      </div>

                      {step.summary && (
                        <p className="mt-3 leading-7 text-slate-400">
                          {step.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <section>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                      Instructions
                    </p>

                    <p className="mt-3 whitespace-pre-line leading-8 text-slate-200">
                      {step.instructions}
                    </p>
                  </section>

                  {step.measurements.length > 0 && (
                    <section className="mt-8">
                      <h4 className="text-lg font-semibold">
                        Measurements
                      </h4>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {step.measurements.map((measurement, index) => (
                          <div
                            key={`${step.id}-measurement-${index}`}
                            className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <p className="font-medium text-slate-200">
                                {measurement.label}
                              </p>

                              <span
                                className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ${
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

                            <p className="mt-2 text-lg font-semibold text-cyan-300">
                              {measurement.value}
                              {measurement.unit
                                ? ` ${measurement.unit}`
                                : ""}
                            </p>

                            {measurement.tolerance && (
                              <p className="mt-2 text-sm text-slate-400">
                                Tolerance: {measurement.tolerance}
                              </p>
                            )}

                            {measurement.notes && (
                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                {measurement.notes}
                              </p>
                            )}

                            {measurement.source && (
                              <p className="mt-3 text-xs text-slate-500">
                                Source: {measurement.source}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {step.specifications.length > 0 && (
                    <section className="mt-8">
                      <h4 className="text-lg font-semibold">
                        Specifications
                      </h4>

                      <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
                        {step.specifications.map((specification, index) => (
                          <div
                            key={`${step.id}-specification-${index}`}
                            className="border-b border-slate-800 bg-slate-950 p-4 last:border-b-0"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <p className="text-sm text-slate-500">
                                  {specification.name}
                                </p>
                                <p className="mt-1 font-medium text-slate-200">
                                  {specification.value}
                                </p>
                              </div>

                              <span
                                className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ${
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
                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                {specification.notes}
                              </p>
                            )}

                            {specification.source && (
                              <p className="mt-3 text-xs text-slate-500">
                                Source: {specification.source}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {step.visualInstructions.length > 0 && (
                    <section className="mt-8">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-semibold">
                            Visual guidance
                          </h4>
                          <p className="mt-1 text-sm text-slate-500">
                            Planned visual resources for this step
                          </p>
                        </div>

                        <span className="rounded-full border border-cyan-900 bg-cyan-950/30 px-3 py-1 text-xs font-medium text-cyan-300">
                          Enrichment pending
                        </span>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {step.visualInstructions.map((visual, index) => (
                          <div
                            key={`${step.id}-visual-${index}`}
                            className="rounded-2xl border border-dashed border-cyan-900 bg-cyan-950/10 p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                                  {formatResourceType(visual.resourceType)}
                                </p>

                                <h5 className="mt-2 font-semibold text-slate-100">
                                  {visual.title}
                                </h5>
                              </div>

                              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs text-slate-400">
                                {visual.required ? "Required" : "Helpful"}
                              </span>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-400">
                              {visual.description}
                            </p>

                            {visual.requestedDetails &&
                              visual.requestedDetails.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Should show
                                  </p>

                                  <ul className="mt-2 space-y-2 text-sm text-slate-300">
                                    {visual.requestedDetails.map((detail) => (
                                      <li
                                        key={detail}
                                        className="flex gap-2"
                                      >
                                        <span
                                          className="text-cyan-400"
                                          aria-hidden="true"
                                        >
                                          +
                                        </span>
                                        <span>{detail}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {step.resources.length > 0 && (
                    <section className="mt-8">
                      <h4 className="text-lg font-semibold">
                        Step resources
                      </h4>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {step.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                                {formatResourceLabel(resource.type)}
                              </span>

                              <span className="text-xs uppercase tracking-wider text-slate-500">
                                {resource.verificationStatus}
                              </span>
                            </div>

                            <p className="mt-3 font-medium text-slate-200">
                              {resource.title}
                            </p>

                            {resource.description && (
                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                {resource.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {step.products.length > 0 && (
                    <section className="mt-8">
                      <h4 className="text-lg font-semibold">
                        Products and parts
                      </h4>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {step.products.map((product) => (
                          <div
                            key={product.id}
                            className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-slate-200">
                                  {product.name}
                                </p>

                                {(product.brand || product.model) && (
                                  <p className="mt-1 text-sm text-slate-500">
                                    {[product.brand, product.model]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </p>
                                )}
                              </div>

                              <span
                                className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                                  product.verifiedCompatibility
                                    ? "bg-emerald-950 text-emerald-300"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {product.verifiedCompatibility
                                  ? "Compatibility verified"
                                  : "Unverified"}
                              </span>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-400">
                              {product.purpose}
                            </p>

                            {product.partNumber && (
                              <p className="mt-3 text-sm text-slate-300">
                                Part number: {product.partNumber}
                              </p>
                            )}

                            {product.compatibilityNotes && (
                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                {product.compatibilityNotes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {step.troubleshooting.length > 0 && (
                    <section className="mt-8">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                          If something doesn&apos;t match
                        </p>
                        <h4 className="mt-2 text-lg font-semibold">
                          Troubleshooting
                        </h4>
                      </div>

                      <div className="mt-4 space-y-3">
                        {step.troubleshooting.map((branch) => (
                          <details
                            key={branch.id}
                            className="group rounded-xl border border-violet-950 bg-violet-950/10"
                          >
                            <summary className="cursor-pointer list-none p-4 font-medium text-slate-200">
                              <div className="flex items-center justify-between gap-4">
                                <span>{branch.condition}</span>
                                <span
                                  className="text-violet-400 transition group-open:rotate-45"
                                  aria-hidden="true"
                                >
                                  +
                                </span>
                              </div>
                            </summary>

                            <div className="border-t border-violet-950 px-4 pb-4 pt-4">
                              <p className="leading-7 text-slate-400">
                                {branch.explanation}
                              </p>

                              <div className="mt-4 rounded-lg bg-slate-950 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                                  Next action
                                </p>
                                <p className="mt-2 leading-7 text-slate-200">
                                  {branch.nextAction}
                                </p>
                              </div>

                              {branch.expectedResult && (
                                <div className="mt-4">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Expected result
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-slate-300">
                                    {branch.expectedResult}
                                  </p>
                                </div>
                              )}

                              {branch.warning && (
                                <div className="mt-4 rounded-lg border border-amber-900/60 bg-amber-950/20 p-4">
                                  <p className="text-sm font-semibold text-amber-400">
                                    Warning
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-slate-300">
                                    {branch.warning}
                                  </p>
                                </div>
                              )}
                            </div>
                          </details>
                        ))}
                      </div>
                    </section>
                  )}

                  {(step.accessibility.visualDescription ||
                    step.accessibility.audioExplanation ||
                    step.accessibility.transcript) && (
                    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Accessible guidance
                      </p>

                      {step.accessibility.visualDescription && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-slate-300">
                            Visual description
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {step.accessibility.visualDescription}
                          </p>
                        </div>
                      )}

                      {step.accessibility.audioExplanation && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-slate-300">
                            Audio explanation
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {step.accessibility.audioExplanation}
                          </p>
                        </div>
                      )}

                      {step.accessibility.transcript && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-medium text-cyan-300">
                            Read transcript
                          </summary>
                          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-400">
                            {step.accessibility.transcript}
                          </p>
                        </details>
                      )}
                    </section>
                  )}

                  <section className="mt-8 rounded-xl border border-emerald-950 bg-emerald-950/20 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                      Completion check
                    </p>

                    <p className="mt-3 leading-7 text-slate-200">
                      {step.completionCheck}
                    </p>
                  </section>

                  {step.warning && (
                    <section className="mt-4 rounded-xl border border-amber-900/60 bg-amber-950/20 p-5">
                      <p className="text-sm font-semibold text-amber-400">
                        Warning
                      </p>

                      <p className="mt-2 leading-7 text-slate-300">
                        {step.warning}
                      </p>
                    </section>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {project.sources.length > 0 && (
          <section className="mt-12 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Sources
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              References used for this project
            </h2>

            <div className="mt-5 space-y-3">
              {project.sources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-200">
                        {source.title}
                      </p>

                      {source.publisher && (
                        <p className="mt-1 text-sm text-slate-500">
                          {source.publisher}
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                        source.verified
                          ? "bg-emerald-950 text-emerald-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {source.verified ? "Verified" : "Unverified"}
                    </span>
                  </div>

                  {source.notes && (
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {source.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="sticky bottom-4 z-20 mt-10">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur">
            <button
              type="button"
              onClick={handleStartGuidedMode}
              className="w-full rounded-xl bg-cyan-400 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Start guided mode
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}