import { NextResponse } from "next/server";
import OpenAI from "openai";

import { openai } from "@/lib/openai";
import type {
  ResourceEnrichmentCandidate,
  ResourceEnrichmentContext,
  ResourceEnrichmentOutcome,
} from "@/lib/resource-enrichment";
import type {
  ProjectResourceOrigin,
  ProjectResourceRequest,
} from "@/types/project";

type EnrichmentApiRequest = {
  request: ProjectResourceRequest;
  context: ResourceEnrichmentContext;
};

type UnknownRecord = Record<string, unknown>;

type UrlCitation = {
  url: string;
  title: string;
};

function isRecord(
  value: unknown
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isStringArray(
  value: unknown
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => typeof item === "string"
    )
  );
}

function isResourceRequest(
  value: unknown
): value is ProjectResourceRequest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.purpose === "string" &&
    typeof value.resourceType === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.required === "boolean" &&
    typeof value.retrievalStatus === "string" &&
    isStringArray(value.resolvedResourceIds) &&
    isStringArray(
      value.resolvedProductReferenceIds
    ) &&
    isStringArray(
      value.resolvedProductOfferIds
    )
  );
}

function isContext(
  value: unknown
): value is ResourceEnrichmentContext {
  if (!isRecord(value)) {
    return false;
  }

  if (
    !isRecord(value.project) ||
    !isRecord(value.step)
  ) {
    return false;
  }

  return (
    typeof value.project.id === "string" &&
    typeof value.project.title === "string" &&
    typeof value.project.goal === "string" &&
    typeof value.project.context === "string" &&
    typeof value.project.experience ===
      "string" &&
    typeof value.project.constraints ===
      "string" &&
    typeof value.step.id === "string" &&
    typeof value.step.order === "number" &&
    typeof value.step.title === "string" &&
    typeof value.step.instructions ===
      "string" &&
    Array.isArray(value.step.measurements) &&
    Array.isArray(value.step.specifications)
  );
}

function isEnrichmentApiRequest(
  value: unknown
): value is EnrichmentApiRequest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isResourceRequest(value.request) &&
    isContext(value.context)
  );
}

/**
 * Maps a retrieved web source to the safest origin
 * Howlsy can infer without pretending to know more
 * about the publisher than the URL proves.
 */
function inferOrigin(
  url: string
): ProjectResourceOrigin {
  try {
    const hostname =
      new URL(url).hostname.toLowerCase();

    if (
      hostname.endsWith(".gov") ||
      hostname.includes(".gov.")
    ) {
      return "government";
    }

    return "publisher";
  } catch {
    return "other";
  }
}

/**
 * Walks the Responses API output and extracts actual
 * URL citation annotations returned by web search.
 *
 * We intentionally do not accept URLs from ordinary
 * generated response text.
 */
function collectUrlCitations(
  value: unknown,
  citations: UrlCitation[] = []
): UrlCitation[] {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectUrlCitations(
        item,
        citations
      );
    }

    return citations;
  }

  if (!isRecord(value)) {
    return citations;
  }

  if (
    value.type === "url_citation" &&
    typeof value.url === "string"
  ) {
    citations.push({
      url: value.url,

      title:
        typeof value.title === "string" &&
        value.title.trim().length > 0
          ? value.title.trim()
          : value.url,
    });
  }

  for (const nestedValue of Object.values(
    value
  )) {
    collectUrlCitations(
      nestedValue,
      citations
    );
  }

  return citations;
}

function uniqueCitations(
  citations: UrlCitation[]
): UrlCitation[] {
  const seen = new Set<string>();

  return citations.filter((citation) => {
    const normalized =
      citation.url.trim();

    if (
      !normalized ||
      seen.has(normalized)
    ) {
      return false;
    }

    seen.add(normalized);

    return true;
  });
}

function createSearchPrompt(
  request: ProjectResourceRequest,
  context: ResourceEnrichmentContext
): string {
  const requestedDetails =
    request.requestedDetails?.length
      ? request.requestedDetails
          .map((detail) => `- ${detail}`)
          .join("\n")
      : "- No additional details.";

  return `
Find reliable web sources that fulfill this Howlsy resource request.

PROJECT
Title: ${context.project.title}
Goal: ${context.project.goal}
Context: ${context.project.context || "Not provided."}
Experience: ${context.project.experience || "Not provided."}
Constraints: ${context.project.constraints || "None provided."}

PROJECT STEP
Step ${context.step.order}: ${context.step.title}
Instructions: ${context.step.instructions}

RESOURCE REQUEST
Purpose: ${request.purpose}
Title: ${request.title}
Description: ${request.description}

Search query:
${request.searchQuery || request.title}

Requested details:
${requestedDetails}

SEARCH REQUIREMENTS

- Search the live web.
- Prefer authoritative primary sources when available.
- Prefer manufacturer, government, standards, technical documentation,
  professional organization, or other reputable sources over forums.
- Do not invent URLs.
- Do not cite a source unless it actually supports the requested subject.
- Return a concise explanation of what the sources cover.
- The application will independently extract citation URLs from the
  web-search response, so use cited web sources in the response.
  `.trim();
}

function createCandidates(
  citations: UrlCitation[]
): ResourceEnrichmentCandidate[] {
  return citations
    .slice(0, 5)
    .map((citation) => ({
      kind: "retrieved",

      type: "source",

      title: citation.title,

      description:
        "Web source retrieved for this Howlsy resource request.",

      url: citation.url,

      origin: inferOrigin(
        citation.url
      ),

      sourceName: citation.title,

      sourceUrl: citation.url,

      /*
       * Retrieval proves that the resource exists.
       *
       * Claim-level verification happens in a separate
       * verification stage.
       */
      verified: false,
    }));
}

export async function POST(
  request: Request
) {
  try {
    const body: unknown =
      await request.json();

    if (!isEnrichmentApiRequest(body)) {
      return NextResponse.json(
        {
          error:
            "Invalid resource enrichment request.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.request.resourceType !==
      "source"
    ) {
      return NextResponse.json(
        {
          error:
            `Resource type "${body.request.resourceType}" ` +
            "is not supported by the web source provider.",
        },
        {
          status: 422,
        }
      );
    }

    const response =
      await openai.responses.create({
        model: "gpt-5.6-terra",

        store: false,

        tools: [
          {
            type: "web_search",
          },
        ],

        tool_choice: "required",

        input: createSearchPrompt(
          body.request,
          body.context
        ),
      });

    const citations =
      uniqueCitations(
        collectUrlCitations(
          response.output
        )
      );

    const outcome: ResourceEnrichmentOutcome =
      citations.length > 0
        ? {
            status: "found",
            resources:
              createCandidates(citations),
          }
        : {
            status: "not_found",
          };

    return NextResponse.json({
      outcome,
    });
  } catch (error) {
    console.error(
      "Howlsy resource enrichment API failed:",
      error
    );

    if (
      error instanceof
      OpenAI.RateLimitError
    ) {
      return NextResponse.json(
        {
          error:
            "Resource retrieval is temporarily unavailable because the OpenAI API rate or credit limit was reached.",
        },
        {
          status: 429,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Howlsy could not enrich this resource request.",
      },
      {
        status: 500,
      }
    );
  }
}