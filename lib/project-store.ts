import type {
  HowlsyProject,
  ProjectDifficulty,
  ProjectProductReference,
  ProjectProgress,
  ProjectResource,
  ProjectResourceType,
  ProjectResourceVerificationStatus,
  ProjectSource,
  ProjectStatus,
  ProjectStep,
  ProjectVisualInstruction,
} from "@/types/project";

const PROJECT_STORAGE_KEY = "howlsy-current-project";

type UnknownRecord = Record<string, unknown>;

type ProjectSourceType =
  ProjectSource["sourceType"];

type ProjectVisualResourceType =
  ProjectVisualInstruction["resourceType"];

function isRecord(value: unknown): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => typeof item === "string"
    )
  );
}

function isProjectStatus(
  value: unknown
): value is ProjectStatus {
  return (
    value === "draft" ||
    value === "ready" ||
    value === "in_progress" ||
    value === "completed"
  );
}

function isProjectDifficulty(
  value: unknown
): value is ProjectDifficulty {
  return (
    value === "beginner" ||
    value === "intermediate" ||
    value === "advanced"
  );
}

function isProjectVisualResourceType(
  value: unknown
): value is ProjectVisualResourceType {
  return (
    value === "illustration" ||
    value === "diagram" ||
    value === "blueprint" ||
    value === "annotated_image" ||
    value === "three_d"
  );
}

function isProjectResourceType(
  value: unknown
): value is ProjectResourceType {
  return (
    value === "image" ||
    value === "illustration" ||
    value === "diagram" ||
    value === "blueprint" ||
    value === "video" ||
    value === "audio" ||
    value === "document" ||
    value === "product" ||
    value === "part" ||
    value === "source" ||
    value === "interactive" ||
    value === "three_d"
  );
}

function isProjectResourceVerificationStatus(
  value: unknown
): value is ProjectResourceVerificationStatus {
  return (
    value === "generated" ||
    value === "estimated" ||
    value === "unverified" ||
    value === "verified"
  );
}

function isProjectSourceType(
  value: unknown
): value is ProjectSourceType {
  return (
    value === "manufacturer" ||
    value === "code" ||
    value === "government" ||
    value === "manual" ||
    value === "technical_document" ||
    value === "reference" ||
    value === "video" ||
    value === "other"
  );
}

function optionalString(
  value: unknown
): string | undefined {
  return typeof value === "string" &&
    value.length > 0
    ? value
    : undefined;
}

function optionalNumber(
  value: unknown
): number | undefined {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : undefined;
}

function normalizeProductReference(
  value: unknown
): ProjectProductReference | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.purpose !== "string" ||
    typeof value.verifiedCompatibility !==
      "boolean"
  ) {
    return undefined;
  }

  return {
    id: value.id,

    name: value.name,

    brand: optionalString(value.brand),

    model: optionalString(value.model),

    partNumber: optionalString(
      value.partNumber
    ),

    purpose: value.purpose,

    quantity: optionalString(
      value.quantity
    ),

    estimatedPrice: optionalNumber(
      value.estimatedPrice
    ),

    productUrl: optionalString(
      value.productUrl
    ),

    imageUrl: optionalString(
      value.imageUrl
    ),

    compatibilityNotes: optionalString(
      value.compatibilityNotes
    ),

    verifiedCompatibility:
      value.verifiedCompatibility,

    sourceName: optionalString(
      value.sourceName
    ),

    sourceUrl: optionalString(
      value.sourceUrl
    ),
  };
}

function normalizeResource(
  value: unknown
): ProjectResource | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    !isProjectResourceType(value.type) ||
    !isProjectResourceVerificationStatus(
      value.verificationStatus
    )
  ) {
    return null;
  }

  return {
    id: value.id,

    type: value.type,

    title: value.title,

    description: optionalString(
      value.description
    ),

    url: optionalString(value.url),

    thumbnailUrl: optionalString(
      value.thumbnailUrl
    ),

    altText: optionalString(
      value.altText
    ),

    transcript: optionalString(
      value.transcript
    ),

    captionsAvailable:
      typeof value.captionsAvailable ===
      "boolean"
        ? value.captionsAvailable
        : undefined,

    sourceName: optionalString(
      value.sourceName
    ),

    sourceUrl: optionalString(
      value.sourceUrl
    ),

    verificationStatus:
      value.verificationStatus,

    interactive:
      typeof value.interactive === "boolean"
        ? value.interactive
        : undefined,

    downloadable:
      typeof value.downloadable === "boolean"
        ? value.downloadable
        : undefined,

    notes: optionalString(value.notes),
  };
}

function normalizeVisualInstruction(
  value: unknown
): ProjectVisualInstruction | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.title !== "string" ||
    typeof value.description !== "string" ||
    typeof value.required !== "boolean" ||
    !isProjectVisualResourceType(
      value.resourceType
    )
  ) {
    return null;
  }

  return {
    title: value.title,

    description: value.description,

    resourceType: value.resourceType,

    required: value.required,

    requestedDetails: isStringArray(
      value.requestedDetails
    )
      ? value.requestedDetails
      : [],
  };
}

function normalizeSource(
  value: unknown
): ProjectSource | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.verified !== "boolean" ||
    !isProjectSourceType(value.sourceType)
  ) {
    return null;
  }

  return {
    id: value.id,

    title: value.title,

    publisher: optionalString(
      value.publisher
    ),

    url: optionalString(value.url),

    sourceType: value.sourceType,

    verified: value.verified,

    notes: optionalString(value.notes),
  };
}

/**
 * Migrates and validates one project step.
 *
 * Earlier Howlsy projects only contained the basic instructional
 * fields. Rich project fields are added with safe empty defaults when
 * loading legacy browser data.
 */
function normalizeProjectStep(
  value: unknown,
  index: number
): ProjectStep | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.title !== "string" ||
    typeof value.instructions !== "string" ||
    typeof value.completionCheck !== "string"
  ) {
    return null;
  }

  const id =
    typeof value.id === "string" &&
    value.id.length > 0
      ? value.id
      : `step-${index + 1}`;

  const order =
    typeof value.order === "number" &&
    Number.isFinite(value.order)
      ? value.order
      : index + 1;

  const measurements: ProjectStep["measurements"] =
    [];

  if (Array.isArray(value.measurements)) {
    for (const measurement of value.measurements) {
      if (!isRecord(measurement)) {
        return null;
      }

      if (
        typeof measurement.label !== "string" ||
        typeof measurement.value !== "string" ||
        typeof measurement.verified !== "boolean"
      ) {
        return null;
      }

      measurements.push({
        label: measurement.label,

        value: measurement.value,

        unit: optionalString(
          measurement.unit
        ),

        tolerance: optionalString(
          measurement.tolerance
        ),

        notes: optionalString(
          measurement.notes
        ),

        source: optionalString(
          measurement.source
        ),

        verified: measurement.verified,
      });
    }
  }

  const specifications: ProjectStep["specifications"] =
    [];

  if (Array.isArray(value.specifications)) {
    for (const specification of value.specifications) {
      if (!isRecord(specification)) {
        return null;
      }

      if (
        typeof specification.name !== "string" ||
        typeof specification.value !== "string" ||
        typeof specification.verified !==
          "boolean"
      ) {
        return null;
      }

      specifications.push({
        name: specification.name,

        value: specification.value,

        notes: optionalString(
          specification.notes
        ),

        source: optionalString(
          specification.source
        ),

        verified: specification.verified,
      });
    }
  }

  const visualInstructions: ProjectVisualInstruction[] =
    [];

  if (Array.isArray(value.visualInstructions)) {
    for (const visual of value.visualInstructions) {
      const normalizedVisual =
        normalizeVisualInstruction(visual);

      if (!normalizedVisual) {
        return null;
      }

      visualInstructions.push(
        normalizedVisual
      );
    }
  }

  const resources: ProjectResource[] = [];

  if (Array.isArray(value.resources)) {
    for (const resource of value.resources) {
      const normalizedResource =
        normalizeResource(resource);

      if (!normalizedResource) {
        return null;
      }

      resources.push(normalizedResource);
    }
  }

  const products: ProjectProductReference[] =
    [];

  if (Array.isArray(value.products)) {
    for (const product of value.products) {
      const normalizedProduct =
        normalizeProductReference(product);

      if (!normalizedProduct) {
        return null;
      }

      products.push(normalizedProduct);
    }
  }

  const troubleshooting: ProjectStep["troubleshooting"] =
    [];

  if (Array.isArray(value.troubleshooting)) {
    for (
      let branchIndex = 0;
      branchIndex <
      value.troubleshooting.length;
      branchIndex += 1
    ) {
      const branch =
        value.troubleshooting[branchIndex];

      if (!isRecord(branch)) {
        return null;
      }

      if (
        typeof branch.condition !== "string" ||
        typeof branch.explanation !== "string" ||
        typeof branch.nextAction !== "string"
      ) {
        return null;
      }

      troubleshooting.push({
        id:
          typeof branch.id === "string" &&
          branch.id.length > 0
            ? branch.id
            : `${id}-branch-${
                branchIndex + 1
              }`,

        condition: branch.condition,

        explanation: branch.explanation,

        nextAction: branch.nextAction,

        expectedResult: optionalString(
          branch.expectedResult
        ),

        warning: optionalString(
          branch.warning
        ),
      });
    }
  }

  const accessibility: ProjectStep["accessibility"] =
    isRecord(value.accessibility)
      ? {
          visualDescription: optionalString(
            value.accessibility
              .visualDescription
          ),

          audioExplanation: optionalString(
            value.accessibility
              .audioExplanation
          ),

          transcript: optionalString(
            value.accessibility.transcript
          ),
        }
      : {};

  return {
    id,

    order,

    title: value.title,

    summary: optionalString(value.summary),

    instructions: value.instructions,

    completionCheck:
      value.completionCheck,

    warning: optionalString(value.warning),

    estimatedDuration: optionalString(
      value.estimatedDuration
    ),

    measurements,

    specifications,

    visualInstructions,

    resources,

    products,

    troubleshooting,

    accessibility,
  };
}

/**
 * Migrates project progress into the current persistence contract.
 *
 * Progress is application-owned state. It is not generated by the AI
 * planning endpoint.
 *
 * Legacy projects do not contain a progress object, so they begin with
 * no completed steps. Persisted step identifiers are also checked
 * against the project's current normalized steps so stale or malformed
 * identifiers cannot leak into the guided experience.
 */
function normalizeProjectProgress(
  value: unknown,
  steps: ProjectStep[]
): ProjectProgress {
  const validStepIds = new Set(
    steps.map((step) => step.id)
  );

  if (!isRecord(value)) {
    return {
      completedStepIds: [],
    };
  }

  const completedStepIds = Array.isArray(
    value.completedStepIds
  )
    ? Array.from(
        new Set(
          value.completedStepIds.filter(
            (stepId): stepId is string =>
              typeof stepId === "string" &&
              validStepIds.has(stepId)
          )
        )
      )
    : [];

  const currentStepId =
    typeof value.currentStepId === "string" &&
    validStepIds.has(value.currentStepId)
      ? value.currentStepId
      : undefined;

  return {
    completedStepIds,

    currentStepId,

    startedAt: optionalString(
      value.startedAt
    ),

    completedAt: optionalString(
      value.completedAt
    ),
  };
}

/**
 * Converts persisted browser data into the current HowlsyProject
 * contract.
 *
 * This is both a runtime validation boundary and a migration layer.
 * Data loaded from localStorage must never be trusted solely because a
 * TypeScript assertion says it is a HowlsyProject.
 */
function normalizeProject(
  value: unknown
): HowlsyProject | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.description !== "string" ||
    typeof value.category !== "string" ||
    !isProjectStatus(value.status) ||
    !isProjectDifficulty(value.difficulty) ||
    typeof value.estimatedDuration !== "string" ||
    typeof value.goal !== "string" ||
    typeof value.context !== "string" ||
    typeof value.experience !== "string" ||
    typeof value.constraints !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  if (!isRecord(value.safety)) {
    return null;
  }

  if (
    typeof value.safety.summary !== "string" ||
    !isStringArray(
      value.safety.hazards
    ) ||
    !isStringArray(
      value.safety.protectiveEquipment
    ) ||
    typeof value.safety
      .professionalHelpRecommended !==
      "boolean"
  ) {
    return null;
  }

  if (
    !Array.isArray(value.tools) ||
    !Array.isArray(value.materials) ||
    !Array.isArray(value.steps)
  ) {
    return null;
  }

  const tools: HowlsyProject["tools"] = [];

  for (const tool of value.tools) {
    if (!isRecord(tool)) {
      return null;
    }

    if (
      typeof tool.name !== "string" ||
      typeof tool.required !== "boolean"
    ) {
      return null;
    }

    tools.push({
      name: tool.name,

      required: tool.required,

      quantity: optionalString(
        tool.quantity
      ),

      notes: optionalString(tool.notes),

      safetyNotes: optionalString(
        tool.safetyNotes
      ),

      productReference:
        normalizeProductReference(
          tool.productReference
        ),
    });
  }

  const materials: HowlsyProject["materials"] =
    [];

  for (const material of value.materials) {
    if (!isRecord(material)) {
      return null;
    }

    if (
      typeof material.name !== "string"
    ) {
      return null;
    }

    materials.push({
      name: material.name,

      quantity: optionalString(
        material.quantity
      ),

      estimatedCost: optionalNumber(
        material.estimatedCost
      ),

      dimensions: optionalString(
        material.dimensions
      ),

      specifications: optionalString(
        material.specifications
      ),

      notes: optionalString(
        material.notes
      ),

      productReference:
        normalizeProductReference(
          material.productReference
        ),
    });
  }

  const steps: ProjectStep[] = [];

  for (
    let index = 0;
    index < value.steps.length;
    index += 1
  ) {
    const normalizedStep =
      normalizeProjectStep(
        value.steps[index],
        index
      );

    if (!normalizedStep) {
      return null;
    }

    steps.push(normalizedStep);
  }

  const sources: ProjectSource[] = [];

  if (Array.isArray(value.sources)) {
    for (const source of value.sources) {
      const normalizedSource =
        normalizeSource(source);

      if (!normalizedSource) {
        return null;
      }

      sources.push(normalizedSource);
    }
  }

  const progress = normalizeProjectProgress(
    value.progress,
    steps
  );

  return {
    id: value.id,

    title: value.title,

    description: value.description,

    category: value.category,

    status: value.status,

    difficulty: value.difficulty,

    estimatedDuration:
      value.estimatedDuration,

    estimatedCostMin: optionalNumber(
      value.estimatedCostMin
    ),

    estimatedCostMax: optionalNumber(
      value.estimatedCostMax
    ),

    goal: value.goal,

    context: value.context,

    experience: value.experience,

    constraints: value.constraints,

    safety: {
      summary: value.safety.summary,

      hazards: value.safety.hazards,

      protectiveEquipment:
        value.safety.protectiveEquipment,

      professionalHelpRecommended:
        value.safety
          .professionalHelpRecommended,

      professionalHelpReason:
        optionalString(
          value.safety
            .professionalHelpReason
        ),
    },

    tools,

    materials,

    steps,

    sources,

    progress,

    createdAt: value.createdAt,

    updatedAt: value.updatedAt,
  };
}

/**
 * Detects the accidentally persisted API response envelope created by
 * an earlier version of the intake flow:
 *
 * {
 *   project: HowlsyProject
 * }
 *
 * Supporting this shape lets Howlsy repair existing development data
 * instead of forcing browser storage to be cleared manually.
 */
function getNestedProject(
  value: unknown
): HowlsyProject | null {
  if (!isRecord(value)) {
    return null;
  }

  return normalizeProject(
    value.project
  );
}

/**
 * Saves the current project in the browser.
 *
 * This is a temporary persistence layer used during development.
 * Supabase will eventually replace localStorage as the permanent
 * project store.
 */
export function saveProject(
  project: HowlsyProject
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PROJECT_STORAGE_KEY,
    JSON.stringify(project)
  );
}

/**
 * Retrieves the current project from browser storage.
 *
 * Persisted browser data is treated as untrusted runtime data.
 *
 * Current projects are validated and normalized before being returned.
 * Older project contracts are migrated forward by supplying safe
 * defaults for rich project fields and progress state that did not
 * previously exist.
 *
 * Projects accidentally stored inside the old API response envelope
 * are also repaired.
 *
 * Invalid or unreadable data returns null instead of allowing malformed
 * state to reach the project UI.
 */
export function getProject():
  | HowlsyProject
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedProject =
    window.localStorage.getItem(
      PROJECT_STORAGE_KEY
    );

  if (!storedProject) {
    return null;
  }

  try {
    const parsedProject: unknown =
      JSON.parse(storedProject);

    const normalizedProject =
      normalizeProject(parsedProject);

    if (normalizedProject) {
      /*
       * Persist the normalized current shape immediately.
       *
       * Legacy projects therefore migrate once instead of requiring
       * compatibility handling every time they are read.
       */
      saveProject(normalizedProject);

      return normalizedProject;
    }

    const nestedProject =
      getNestedProject(parsedProject);

    if (nestedProject) {
      /*
       * Repair the historical API response-envelope bug and save the
       * corrected project shape back to browser storage.
       */
      saveProject(nestedProject);

      return nestedProject;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Removes the temporary project from browser storage.
 */
export function clearProject(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    PROJECT_STORAGE_KEY
  );
}