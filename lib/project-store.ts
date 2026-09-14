import type { HowlsyProject } from "@/types/project";

const PROJECT_STORAGE_KEY = "howlsy-current-project";

/**
 * Performs lightweight runtime validation for persisted project data.
 *
 * TypeScript type assertions do not validate values loaded from
 * localStorage, so persisted data must be checked before the
 * application treats it as a HowlsyProject.
 */
function isHowlsyProject(value: unknown): value is HowlsyProject {
  if (!value || typeof value !== "object") {
    return false;
  }

  const project = value as Partial<HowlsyProject>;

  return (
    typeof project.id === "string" &&
    typeof project.title === "string" &&
    typeof project.description === "string" &&
    typeof project.category === "string" &&
    typeof project.status === "string" &&
    typeof project.difficulty === "string" &&
    typeof project.estimatedDuration === "string" &&
    typeof project.goal === "string" &&
    typeof project.context === "string" &&
    typeof project.experience === "string" &&
    typeof project.constraints === "string" &&
    !!project.safety &&
    typeof project.safety === "object" &&
    typeof project.safety.summary === "string" &&
    Array.isArray(project.safety.hazards) &&
    Array.isArray(project.safety.protectiveEquipment) &&
    typeof project.safety.professionalHelpRecommended === "boolean" &&
    Array.isArray(project.tools) &&
    Array.isArray(project.materials) &&
    Array.isArray(project.steps) &&
    typeof project.createdAt === "string" &&
    typeof project.updatedAt === "string"
  );
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
 * instead of forcing the browser storage to be cleared manually.
 */
function getNestedProject(value: unknown): HowlsyProject | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as {
    project?: unknown;
  };

  if (isHowlsyProject(candidate.project)) {
    return candidate.project;
  }

  return null;
}

/**
 * Saves the current project in the browser.
 *
 * This is a temporary persistence layer used during development.
 * Supabase will eventually replace localStorage as the permanent
 * project store.
 */
export function saveProject(project: HowlsyProject): void {
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
 * Valid current projects are returned normally. Projects accidentally
 * stored inside the old API response envelope are automatically
 * migrated to the correct storage shape.
 *
 * Invalid or unreadable data returns null instead of allowing malformed
 * state to reach the project UI.
 */
export function getProject(): HowlsyProject | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedProject = window.localStorage.getItem(
    PROJECT_STORAGE_KEY
  );

  if (!storedProject) {
    return null;
  }

  try {
    const parsedProject: unknown =
      JSON.parse(storedProject);

    if (isHowlsyProject(parsedProject)) {
      return parsedProject;
    }

    const nestedProject = getNestedProject(parsedProject);

    if (nestedProject) {
      /*
       * Repair the legacy malformed storage shape immediately so future
       * reads use the correct HowlsyProject structure.
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

  window.localStorage.removeItem(PROJECT_STORAGE_KEY);
}