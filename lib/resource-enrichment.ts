import type {
  HowlsyProject,
  ProjectResource,
  ProjectResourceOrigin,
  ProjectResourceRequest,
  ProjectResourceRetrievalStatus,
  ProjectResourceType,
  ProjectStep,
} from "@/types/project";

/**
 * Describes where an enrichment result came from.
 *
 * "generated" means Howlsy created the resource.
 * "retrieved" means an external resource was actually found.
 */
export type ResourceEnrichmentCandidateKind =
  | "generated"
  | "retrieved";

/**
 * Provider output before it is allowed into project state.
 *
 * Providers return candidate data only.
 * They do not create IDs, mutate requests, or determine request state.
 */
export type ResourceEnrichmentCandidate = {
  kind: ResourceEnrichmentCandidateKind;

  type: ProjectResourceType;

  title: string;
  description?: string;

  url?: string;
  thumbnailUrl?: string;

  altText?: string;
  transcript?: string;
  captionsAvailable?: boolean;

  origin: ProjectResourceOrigin;

  sourceName?: string;
  sourceUrl?: string;

  /**
   * Applies only to retrieved resources.
   *
   * This verifies the resource itself, not a project measurement,
   * specification, compatibility claim, or other project fact.
   */
  verified?: boolean;

  interactive?: boolean;
  downloadable?: boolean;

  notes?: string;
};

/**
 * A provider must explicitly report whether fulfillment succeeded,
 * returned no usable result, or failed.
 */
export type ResourceEnrichmentOutcome =
  | {
      status: "found";
      resources: ResourceEnrichmentCandidate[];
    }
  | {
      status: "not_found";
    }
  | {
      status: "failed";
    };

/**
 * Provider context contains only the planning information required
 * to fulfill a request.
 *
 * It deliberately does not expose the mutable project object.
 */
export type ResourceEnrichmentContext = {
  project: {
    id: string;
    title: string;
    goal: string;
    context: string;
    experience: string;
    constraints: string;
  };

  step: {
    id: string;
    order: number;
    title: string;
    summary?: string;
    instructions: string;

    measurements: ProjectStep["measurements"];
    specifications: ProjectStep["specifications"];
  };
};

/**
 * Provider contract.
 *
 * Future implementations may use:
 *
 * - web search
 * - manufacturer documentation
 * - Howlsy visual generation
 * - video search
 * - product retrieval
 * - connected services
 *
 * without changing the enrichment state machine.
 */
export type ResourceEnrichmentProvider = (
  request: Readonly<ProjectResourceRequest>,
  context: Readonly<ResourceEnrichmentContext>
) => Promise<ResourceEnrichmentOutcome>;

export type EnrichProjectResourcesOptions = {
  /**
   * Failed/not-found requests are not automatically retried.
   *
   * A caller may explicitly enable retrying selected states.
   */
  retryStatuses?: Array<
    Extract<
      ProjectResourceRetrievalStatus,
      "not_found" | "failed"
    >
  >;

  /**
   * Lets a specialized provider process only the requests it supports.
   *
   * Requests rejected by this predicate remain in their current state.
   * They are not marked failed or not_found.
   */
  shouldEnrich?: (
    request: Readonly<ProjectResourceRequest>,
    context: Readonly<ResourceEnrichmentContext>
  ) => boolean | Promise<boolean>;

  /**
   * Optional hook for persisting or displaying intermediate state.
   *
   * For example, a client-side implementation can save the project
   * immediately after a request enters "searching".
   */
  onProjectUpdate?: (
    project: HowlsyProject
  ) => void | Promise<void>;
};

type ResourceRequestTarget = {
  stepId: string;
  requestId: string;
};

/**
 * Returns a defensive copy so a provider cannot mutate the
 * application-owned request arrays by reference.
 */
function copyRequest(
  request: ProjectResourceRequest
): ProjectResourceRequest {
  return {
    ...request,

    requestedDetails: request.requestedDetails
      ? [...request.requestedDetails]
      : undefined,

    resolvedResourceIds: [
      ...request.resolvedResourceIds,
    ],

    resolvedProductReferenceIds: [
      ...request.resolvedProductReferenceIds,
    ],

    resolvedProductOfferIds: [
      ...request.resolvedProductOfferIds,
    ],
  };
}

function buildContext(
  project: HowlsyProject,
  step: ProjectStep
): ResourceEnrichmentContext {
  return {
    project: {
      id: project.id,
      title: project.title,
      goal: project.goal,
      context: project.context,
      experience: project.experience,
      constraints: project.constraints,
    },

    step: {
      id: step.id,
      order: step.order,
      title: step.title,
      summary: step.summary,
      instructions: step.instructions,

      measurements: step.measurements.map(
        (measurement) => ({
          ...measurement,
        })
      ),

      specifications: step.specifications.map(
        (specification) => ({
          ...specification,
        })
      ),
    },
  };
}

/**
 * Returns the current live version of a request.
 *
 * This matters because the project changes after each enrichment result.
 */
function getRequest(
  project: HowlsyProject,
  target: ResourceRequestTarget
):
  | {
      step: ProjectStep;
      request: ProjectResourceRequest;
    }
  | undefined {
  const step = project.steps.find(
    (candidate) => candidate.id === target.stepId
  );

  if (!step) {
    return undefined;
  }

  const request = step.resourceRequests.find(
    (candidate) =>
      candidate.id === target.requestId
  );

  if (!request) {
    return undefined;
  }

  return {
    step,
    request,
  };
}

function updateRequestStatus(
  project: HowlsyProject,
  target: ResourceRequestTarget,
  retrievalStatus: ProjectResourceRetrievalStatus
): HowlsyProject {
  let changed = false;

  const steps = project.steps.map((step) => {
    if (step.id !== target.stepId) {
      return step;
    }

    const resourceRequests =
      step.resourceRequests.map((request) => {
        if (request.id !== target.requestId) {
          return request;
        }

        if (
          request.retrievalStatus ===
          retrievalStatus
        ) {
          return request;
        }

        changed = true;

        return {
          ...request,
          retrievalStatus,
        };
      });

    if (!changed) {
      return step;
    }

    return {
      ...step,
      resourceRequests,
    };
  });

  if (!changed) {
    return project;
  }

  return {
    ...project,
    steps,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Enforces provenance rules before a provider result becomes
 * application-owned state.
 */
function validateCandidate(
  request: ProjectResourceRequest,
  candidate: ResourceEnrichmentCandidate
): string | undefined {
  if (!candidate.title.trim()) {
    return "Resource title cannot be empty.";
  }

  if (candidate.type !== request.resourceType) {
    return (
      `Expected resource type "${request.resourceType}" ` +
      `but provider returned "${candidate.type}".`
    );
  }

  if (
    candidate.kind === "generated" &&
    candidate.origin !== "howlsy_generated"
  ) {
    return (
      "Generated resources must use " +
      'origin "howlsy_generated".'
    );
  }

  if (
    candidate.kind === "retrieved" &&
    candidate.origin === "howlsy_generated"
  ) {
    return (
      "Retrieved resources cannot use " +
      'origin "howlsy_generated".'
    );
  }

  if (
    candidate.kind === "retrieved" &&
    !candidate.url &&
    !candidate.sourceUrl
  ) {
    return (
      "Retrieved resources must include a resource URL " +
      "or source URL."
    );
  }

  return undefined;
}

function createResourceId(
  request: ProjectResourceRequest,
  existingResources: ProjectResource[],
  offset: number
): string {
  const existingIds = new Set(
    existingResources.map(
      (resource) => resource.id
    )
  );

  let index =
    request.resolvedResourceIds.length +
    offset +
    1;

  let id = `${request.id}-resource-${index}`;

  while (existingIds.has(id)) {
    index += 1;
    id = `${request.id}-resource-${index}`;
  }

  return id;
}

function createProjectResource(
  candidate: ResourceEnrichmentCandidate,
  id: string
): ProjectResource {
  return {
    id,

    type: candidate.type,

    title: candidate.title.trim(),

    description:
      candidate.description?.trim() ||
      undefined,

    url: candidate.url?.trim() || undefined,

    thumbnailUrl:
      candidate.thumbnailUrl?.trim() ||
      undefined,

    altText:
      candidate.altText?.trim() || undefined,

    transcript:
      candidate.transcript?.trim() ||
      undefined,

    captionsAvailable:
      candidate.captionsAvailable,

    origin: candidate.origin,

    sourceName:
      candidate.sourceName?.trim() ||
      undefined,

    sourceUrl:
      candidate.sourceUrl?.trim() ||
      undefined,

    verificationStatus:
      candidate.kind === "generated"
        ? "generated"
        : candidate.verified
          ? "verified"
          : "retrieved",

    retrievalStatus: "found",

    interactive: candidate.interactive,

    downloadable: candidate.downloadable,

    notes:
      candidate.notes?.trim() || undefined,
  };
}

/**
 * Applies a successful provider result atomically.
 *
 * Resources are created first and their IDs are then attached to the
 * request that caused them to exist.
 */
function applyFoundOutcome(
  project: HowlsyProject,
  target: ResourceRequestTarget,
  candidates: ResourceEnrichmentCandidate[]
): HowlsyProject {
  const live = getRequest(project, target);

  if (!live) {
    return project;
  }

  const { step, request } = live;

  if (candidates.length === 0) {
    return updateRequestStatus(
      project,
      target,
      "not_found"
    );
  }

  for (const candidate of candidates) {
    const validationError =
      validateCandidate(request, candidate);

    if (validationError) {
      console.error(
        `Howlsy rejected enrichment result for ${request.id}:`,
        validationError
      );

      return updateRequestStatus(
        project,
        target,
        "failed"
      );
    }
  }

  const newResources = candidates.map(
    (candidate, index) =>
      createProjectResource(
        candidate,
        createResourceId(
          request,
          step.resources,
          index
        )
      )
  );

  const resolvedResourceIds =
    newResources.map(
      (resource) => resource.id
    );

  const steps = project.steps.map(
    (candidateStep) => {
      if (candidateStep.id !== target.stepId) {
        return candidateStep;
      }

      return {
        ...candidateStep,

        resources: [
          ...candidateStep.resources,
          ...newResources,
        ],

        resourceRequests:
          candidateStep.resourceRequests.map(
            (candidateRequest) => {
              if (
                candidateRequest.id !==
                target.requestId
              ) {
                return candidateRequest;
              }

              return {
                ...candidateRequest,

                retrievalStatus:
                  "found" as const,

                resolvedResourceIds: [
                  ...candidateRequest
                    .resolvedResourceIds,
                  ...resolvedResourceIds,
                ],
              };
            }
          ),
      };
    }
  );

  return {
    ...project,
    steps,
    updatedAt: new Date().toISOString(),
  };
}

async function notifyProjectUpdate(
  project: HowlsyProject,
  options: EnrichProjectResourcesOptions
): Promise<void> {
  if (!options.onProjectUpdate) {
    return;
  }

  await options.onProjectUpdate(project);
}

/**
 * Executes the Resource Enrichment Engine queue.
 *
 * Requests are processed sequentially on purpose:
 *
 * - avoids uncontrolled provider concurrency
 * - makes intermediate state deterministic
 * - simplifies persistence
 * - prevents duplicate resolution of the same request
 *
 * This function never fabricates a result when a provider fails.
 */
export async function enrichProjectResources(
  project: HowlsyProject,
  provider: ResourceEnrichmentProvider,
  options: EnrichProjectResourcesOptions = {}
): Promise<HowlsyProject> {
  let currentProject = project;

  const allowedStatuses =
    new Set<ProjectResourceRetrievalStatus>([
      "planned",
      ...(options.retryStatuses ?? []),
    ]);

  /*
   * Capture request identity rather than request objects.
   *
   * The live request is re-read from currentProject before each
   * provider call so previously applied updates are never overwritten.
   */
  const targets: ResourceRequestTarget[] =
    project.steps.flatMap((step) =>
      step.resourceRequests.map((request) => ({
        stepId: step.id,
        requestId: request.id,
      }))
    );

  for (const target of targets) {
    const live = getRequest(
      currentProject,
      target
    );

    if (!live) {
      continue;
    }

      if (
      !allowedStatuses.has(
        live.request.retrievalStatus
      )
    ) {
      continue;
    }

    const enrichmentContext = buildContext(
      currentProject,
      live.step
    );

    if (
      options.shouldEnrich &&
      !(await options.shouldEnrich(
        copyRequest(live.request),
        enrichmentContext
      ))
    ) {
      continue;
    }

    currentProject = updateRequestStatus(
      currentProject,
      target,
      "searching"
    );

    await notifyProjectUpdate(
      currentProject,
      options
    );

    const searchingLive = getRequest(
      currentProject,
      target
    );

    if (!searchingLive) {
      continue;
    }

    try {
      const outcome = await provider(
        copyRequest(searchingLive.request),
        buildContext(
          currentProject,
          searchingLive.step
        )
      );

      if (outcome.status === "found") {
        currentProject = applyFoundOutcome(
          currentProject,
          target,
          outcome.resources
        );
      } else {
        currentProject = updateRequestStatus(
          currentProject,
          target,
          outcome.status
        );
      }
    } catch (error) {
      console.error(
        `Howlsy resource enrichment failed for ${target.requestId}:`,
        error
      );

      currentProject = updateRequestStatus(
        currentProject,
        target,
        "failed"
      );
    }

    await notifyProjectUpdate(
      currentProject,
      options
    );
  }

  return currentProject;
}