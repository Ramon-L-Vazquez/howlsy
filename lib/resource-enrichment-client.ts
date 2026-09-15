import {
  enrichProjectResources,
  type ResourceEnrichmentCandidate,
  type ResourceEnrichmentContext,
  type ResourceEnrichmentOutcome,
  type ResourceEnrichmentProvider,
} from "@/lib/resource-enrichment";

import { saveProject } from "@/lib/project-store";

import type {
  HowlsyProject,
  ProjectResourceRequest,
} from "@/types/project";

type UnknownRecord = Record<string, unknown>;

function isRecord(
  value: unknown
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isCandidate(
  value: unknown
): value is ResourceEnrichmentCandidate {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.kind === "generated" ||
      value.kind === "retrieved") &&
    typeof value.type === "string" &&
    typeof value.title === "string" &&
    typeof value.origin === "string"
  );
}

function isOutcome(
  value: unknown
): value is ResourceEnrichmentOutcome {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.status === "not_found" ||
    value.status === "failed"
  ) {
    return true;
  }

  if (value.status !== "found") {
    return false;
  }

  return (
    Array.isArray(value.resources) &&
    value.resources.every(isCandidate)
  );
}

/**
 * Calls Howlsy's server-side web retrieval provider.
 *
 * This returns candidate data only.
 * Project mutation remains owned by the Resource Enrichment Engine.
 */
export const webSourceEnrichmentProvider:
  ResourceEnrichmentProvider =
  async (
    request: Readonly<ProjectResourceRequest>,
    context: Readonly<ResourceEnrichmentContext>
  ) => {
    const response = await fetch(
      "/api/resources/enrich",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          request,
          context,
        }),
      }
    );

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      throw new Error(
        "Howlsy resource retrieval returned an unreadable response."
      );
    }

    if (!response.ok) {
      const message =
        isRecord(payload) &&
        typeof payload.error === "string"
          ? payload.error
          : "Howlsy resource retrieval failed.";

      throw new Error(message);
    }

    if (
      !isRecord(payload) ||
      !isOutcome(payload.outcome)
    ) {
      throw new Error(
        "Howlsy resource retrieval returned an invalid result."
      );
    }

    return payload.outcome;
  };

/**
 * Enriches only source requests using the current web provider.
 *
 * Visual requests remain planned for the future visual-generation
 * provider instead of being incorrectly marked failed.
 */
export async function enrichProjectWithWebSources(
  project: HowlsyProject
): Promise<HowlsyProject> {
  return enrichProjectResources(
    project,
    webSourceEnrichmentProvider,
    {
      shouldEnrich: (request) =>
        request.resourceType === "source",

      onProjectUpdate: (
        updatedProject
      ) => {
        saveProject(updatedProject);
      },
    }
  );
}