import type {
  HowlsyProject,
  ProjectResourceRequest,
  ProjectStep,
} from "@/types/project";

/**
 * Builds a compact search query without allowing empty planning fields
 * to introduce meaningless whitespace into the future retrieval request.
 */
function buildSearchQuery(
  parts: Array<string | undefined>
): string | undefined {
  const query = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" ");

  return query.length > 0 ? query : undefined;
}

/**
 * Converts planned visual instructions into application-owned resource
 * requests.
 *
 * The AI planner is allowed to describe the visual that would help.
 * This function owns the actual request state.
 *
 * Nothing created here has been generated, retrieved, or verified yet.
 */
function createVisualResourceRequests(
  step: ProjectStep
): ProjectResourceRequest[] {
  return step.visualInstructions.map(
    (visual, index) => ({
      id: `${step.id}-request-visual-${index + 1}`,

      purpose: "show",

      resourceType: visual.resourceType,

      title: visual.title,

      description: visual.description,

      required: visual.required,

      requestedDetails:
        visual.requestedDetails &&
        visual.requestedDetails.length > 0
          ? visual.requestedDetails
          : undefined,

      retrievalStatus: "planned",

      resolvedResourceIds: [],

      resolvedProductReferenceIds: [],

      resolvedProductOfferIds: [],
    })
  );
}

/**
 * Creates verification requests for measurements that the planning
 * model could not independently verify.
 *
 * These requests remain optional because some measurements depend on
 * the user's real-world object and cannot be verified from an external
 * source alone.
 */
function createMeasurementVerificationRequests(
  project: HowlsyProject,
  step: ProjectStep
): ProjectResourceRequest[] {
  const requests: ProjectResourceRequest[] = [];

  step.measurements.forEach((measurement, index) => {
    if (measurement.verified) {
      return;
    }

    const displayValue = [
      measurement.value,
      measurement.unit,
    ]
      .filter(Boolean)
      .join(" ");

    const requestedDetails = [
      `Planned value: ${displayValue}`,
      measurement.tolerance
        ? `Tolerance: ${measurement.tolerance}`
        : undefined,
      measurement.notes
        ? `Planning notes: ${measurement.notes}`
        : undefined,
      measurement.source
        ? `Suggested source: ${measurement.source}`
        : undefined,
    ].filter(
      (detail): detail is string => Boolean(detail)
    );

    requests.push({
      id: `${step.id}-request-measurement-${index + 1}`,

      purpose: "verify",

      resourceType: "source",

      title: `Verify ${measurement.label}`,

      description:
        `Find an authoritative source that can confirm or correct ` +
        `the planned measurement "${measurement.label}" for this step.`,

      required: false,

      searchQuery: buildSearchQuery([
        project.title,
        step.title,
        measurement.label,
        displayValue,
        measurement.source,
      ]),

      requestedDetails,

      retrievalStatus: "planned",

      resolvedResourceIds: [],

      resolvedProductReferenceIds: [],

      resolvedProductOfferIds: [],
    });
  });

  return requests;
}

/**
 * Creates verification requests for technical specifications that have
 * not yet been backed by a verified source.
 */
function createSpecificationVerificationRequests(
  project: HowlsyProject,
  step: ProjectStep
): ProjectResourceRequest[] {
  const requests: ProjectResourceRequest[] = [];

  step.specifications.forEach(
    (specification, index) => {
      if (specification.verified) {
        return;
      }

      const requestedDetails = [
        `Planned specification: ${specification.value}`,
        specification.notes
          ? `Planning notes: ${specification.notes}`
          : undefined,
        specification.source
          ? `Suggested source: ${specification.source}`
          : undefined,
      ].filter(
        (detail): detail is string =>
          Boolean(detail)
      );

      requests.push({
        id: `${step.id}-request-specification-${
          index + 1
        }`,

        purpose: "verify",

        resourceType: "source",

        title: `Verify ${specification.name}`,

        description:
          `Find an authoritative source that can confirm or correct ` +
          `the planned specification "${specification.name}" for this step.`,

        required: false,

        searchQuery: buildSearchQuery([
          project.title,
          step.title,
          specification.name,
          specification.value,
          specification.source,
        ]),

        requestedDetails,

        retrievalStatus: "planned",

        resolvedResourceIds: [],

        resolvedProductReferenceIds: [],

        resolvedProductOfferIds: [],
      });
    }
  );

  return requests;
}

/**
 * Determines every currently known resource need for a project step.
 *
 * This is deliberately deterministic. It translates existing structured
 * planning data into application state rather than asking the AI model
 * to fabricate retrieval state.
 */
function createStepResourceRequests(
  project: HowlsyProject,
  step: ProjectStep
): ProjectResourceRequest[] {
  return [
    ...createVisualResourceRequests(step),

    ...createMeasurementVerificationRequests(
      project,
      step
    ),

    ...createSpecificationVerificationRequests(
      project,
      step
    ),
  ];
}

/**
 * Compiles structured project planning requirements into the Resource
 * Engine request queue.
 *
 * Existing request records always win. This makes the operation
 * idempotent and prevents a second planning pass from resetting
 * searching/found/failed state or losing resolved resource IDs.
 */
export function planProjectResources(
  project: HowlsyProject
): HowlsyProject {
  let changed = false;

  const steps = project.steps.map((step) => {
    const plannedRequests =
      createStepResourceRequests(project, step);

    const existingRequestIds = new Set(
      step.resourceRequests.map(
        (request) => request.id
      )
    );

    const missingRequests =
      plannedRequests.filter(
        (request) =>
          !existingRequestIds.has(request.id)
      );

    if (missingRequests.length === 0) {
      return step;
    }

    changed = true;

    return {
      ...step,

      resourceRequests: [
        ...step.resourceRequests,
        ...missingRequests,
      ],
    };
  });

  if (!changed) {
    return project;
  }

  return {
    ...project,
    steps,
  };
}