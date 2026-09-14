import type { HowlsyProject } from "@/types/project";

const PROJECT_STORAGE_KEY = "howlsy-current-project";

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
 * Returns null when running on the server, when no project has
 * been saved, or when the stored project cannot be parsed.
 */
export function getProject(): HowlsyProject | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedProject = window.localStorage.getItem(PROJECT_STORAGE_KEY);

  if (!storedProject) {
    return null;
  }

  try {
    return JSON.parse(storedProject) as HowlsyProject;
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