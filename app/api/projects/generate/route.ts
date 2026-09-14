import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { openai } from "@/lib/openai";
import type { HowlsyProject } from "@/types/project";

type GenerateProjectRequest = {
  goal: string;
  context: string;
  experience: string;
  constraints: string;
};

type GeneratedProjectPlan = {
  title: string;
  description: string;
  category: string;
  difficulty: HowlsyProject["difficulty"];
  estimatedDuration: string;
  estimatedCostMin: number;
  estimatedCostMax: number;

  safety: {
    summary: string;
    hazards: string[];
    protectiveEquipment: string[];
    professionalHelpRecommended: boolean;
    professionalHelpReason: string;
  };

  tools: Array<{
    name: string;
    required: boolean;
    quantity: string;
    notes: string;
    safetyNotes: string;
  }>;

  materials: Array<{
    name: string;
    quantity: string;
    estimatedCost: number;
    dimensions: string;
    specifications: string;
    notes: string;
  }>;

  steps: Array<{
    title: string;
    summary: string;
    instructions: string;
    completionCheck: string;
    warning: string;
    estimatedDuration: string;

    measurements: Array<{
      label: string;
      value: string;
      unit: string;
      tolerance: string;
      notes: string;
      source: string;
      verified: boolean;
    }>;

    specifications: Array<{
      name: string;
      value: string;
      notes: string;
      source: string;
      verified: boolean;
    }>;

    visualInstructions: Array<{
      title: string;
      description: string;
      resourceType:
        | "illustration"
        | "diagram"
        | "blueprint"
        | "annotated_image"
        | "three_d";
      required: boolean;
      requestedDetails: string[];
    }>;

    troubleshooting: Array<{
      condition: string;
      explanation: string;
      nextAction: string;
      expectedResult: string;
      warning: string;
    }>;

    accessibility: {
      visualDescription: string;
      audioExplanation: string;
      transcript: string;
    };
  }>;

  sources: Array<{
    title: string;
    publisher: string;
    url: string;
    sourceType:
      | "manufacturer"
      | "code"
      | "government"
      | "manual"
      | "technical_document"
      | "reference"
      | "video"
      | "other";
    verified: boolean;
    notes: string;
  }>;
};

const howlsyProjectPlanSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    title: {
      type: "string",
    },

    description: {
      type: "string",
    },

    category: {
      type: "string",
    },

    difficulty: {
      type: "string",
      enum: ["beginner", "intermediate", "advanced"],
    },

    estimatedDuration: {
      type: "string",
    },

    estimatedCostMin: {
      type: "number",
    },

    estimatedCostMax: {
      type: "number",
    },

    safety: {
      type: "object",
      additionalProperties: false,

      properties: {
        summary: {
          type: "string",
        },

        hazards: {
          type: "array",
          items: {
            type: "string",
          },
        },

        protectiveEquipment: {
          type: "array",
          items: {
            type: "string",
          },
        },

        professionalHelpRecommended: {
          type: "boolean",
        },

        professionalHelpReason: {
          type: "string",
        },
      },

      required: [
        "summary",
        "hazards",
        "protectiveEquipment",
        "professionalHelpRecommended",
        "professionalHelpReason",
      ],
    },

    tools: {
      type: "array",

      items: {
        type: "object",
        additionalProperties: false,

        properties: {
          name: {
            type: "string",
          },

          required: {
            type: "boolean",
          },

          quantity: {
            type: "string",
          },

          notes: {
            type: "string",
          },

          safetyNotes: {
            type: "string",
          },
        },

        required: [
          "name",
          "required",
          "quantity",
          "notes",
          "safetyNotes",
        ],
      },
    },

    materials: {
      type: "array",

      items: {
        type: "object",
        additionalProperties: false,

        properties: {
          name: {
            type: "string",
          },

          quantity: {
            type: "string",
          },

          estimatedCost: {
            type: "number",
          },

          dimensions: {
            type: "string",
          },

          specifications: {
            type: "string",
          },

          notes: {
            type: "string",
          },
        },

        required: [
          "name",
          "quantity",
          "estimatedCost",
          "dimensions",
          "specifications",
          "notes",
        ],
      },
    },

    steps: {
      type: "array",

      items: {
        type: "object",
        additionalProperties: false,

        properties: {
          title: {
            type: "string",
          },

          summary: {
            type: "string",
          },

          instructions: {
            type: "string",
          },

          completionCheck: {
            type: "string",
          },

          warning: {
            type: "string",
          },

          estimatedDuration: {
            type: "string",
          },

          measurements: {
            type: "array",

            items: {
              type: "object",
              additionalProperties: false,

              properties: {
                label: {
                  type: "string",
                },

                value: {
                  type: "string",
                },

                unit: {
                  type: "string",
                },

                tolerance: {
                  type: "string",
                },

                notes: {
                  type: "string",
                },

                source: {
                  type: "string",
                },

                verified: {
                  type: "boolean",
                },
              },

              required: [
                "label",
                "value",
                "unit",
                "tolerance",
                "notes",
                "source",
                "verified",
              ],
            },
          },

          specifications: {
            type: "array",

            items: {
              type: "object",
              additionalProperties: false,

              properties: {
                name: {
                  type: "string",
                },

                value: {
                  type: "string",
                },

                notes: {
                  type: "string",
                },

                source: {
                  type: "string",
                },

                verified: {
                  type: "boolean",
                },
              },

              required: [
                "name",
                "value",
                "notes",
                "source",
                "verified",
              ],
            },
          },

          visualInstructions: {
            type: "array",

            items: {
              type: "object",
              additionalProperties: false,

              properties: {
                title: {
                  type: "string",
                },

                description: {
                  type: "string",
                },

                resourceType: {
                  type: "string",
                  enum: [
                    "illustration",
                    "diagram",
                    "blueprint",
                    "annotated_image",
                    "three_d",
                  ],
                },

                required: {
                  type: "boolean",
                },

                requestedDetails: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },

              required: [
                "title",
                "description",
                "resourceType",
                "required",
                "requestedDetails",
              ],
            },
          },

          troubleshooting: {
            type: "array",

            items: {
              type: "object",
              additionalProperties: false,

              properties: {
                condition: {
                  type: "string",
                },

                explanation: {
                  type: "string",
                },

                nextAction: {
                  type: "string",
                },

                expectedResult: {
                  type: "string",
                },

                warning: {
                  type: "string",
                },
              },

              required: [
                "condition",
                "explanation",
                "nextAction",
                "expectedResult",
                "warning",
              ],
            },
          },

          accessibility: {
            type: "object",
            additionalProperties: false,

            properties: {
              visualDescription: {
                type: "string",
              },

              audioExplanation: {
                type: "string",
              },

              transcript: {
                type: "string",
              },
            },

            required: [
              "visualDescription",
              "audioExplanation",
              "transcript",
            ],
          },
        },

        required: [
          "title",
          "summary",
          "instructions",
          "completionCheck",
          "warning",
          "estimatedDuration",
          "measurements",
          "specifications",
          "visualInstructions",
          "troubleshooting",
          "accessibility",
        ],
      },
    },

    sources: {
      type: "array",

      items: {
        type: "object",
        additionalProperties: false,

        properties: {
          title: {
            type: "string",
          },

          publisher: {
            type: "string",
          },

          url: {
            type: "string",
          },

          sourceType: {
            type: "string",
            enum: [
              "manufacturer",
              "code",
              "government",
              "manual",
              "technical_document",
              "reference",
              "video",
              "other",
            ],
          },

          verified: {
            type: "boolean",
          },

          notes: {
            type: "string",
          },
        },

        required: [
          "title",
          "publisher",
          "url",
          "sourceType",
          "verified",
          "notes",
        ],
      },
    },
  },

  required: [
    "title",
    "description",
    "category",
    "difficulty",
    "estimatedDuration",
    "estimatedCostMin",
    "estimatedCostMax",
    "safety",
    "tools",
    "materials",
    "steps",
    "sources",
  ],
};

function isGenerateProjectRequest(
  value: unknown
): value is GenerateProjectRequest {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const request = value as Record<string, unknown>;

  return (
    typeof request.goal === "string" &&
    typeof request.context === "string" &&
    typeof request.experience === "string" &&
    typeof request.constraints === "string"
  );
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isGenerateProjectRequest(body)) {
      return NextResponse.json(
        {
          error: "Invalid project intake.",
        },
        {
          status: 400,
        }
      );
    }

    const goal = body.goal.trim();
    const context = body.context.trim();
    const experience = body.experience.trim();
    const constraints = body.constraints.trim();

    if (!goal) {
      return NextResponse.json(
        {
          error: "A project goal is required.",
        },
        {
          status: 400,
        }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5.6-terra",

      store: false,

      input: [
        {
          role: "system",

          content: `
You are Howlsy, an AI guided-action and project-planning system.

Your job is to transform a user's real-world goal into a structured,
practical, highly detailed project plan.

Howlsy is not a generic chatbot and must not produce generic,
cookie-cutter instructions.

Its purpose is to answer:

"What should I do next, exactly?"

The project must be detailed enough for the user to understand what to
do, what they need, what they should see, what they should measure,
what result they should expect, and what to do when the result differs
from expectations.

CORE PROJECT REQUIREMENTS

- Create a clear, practical project title.
- Generate a concise project description.
- Determine an appropriate project category.
- Estimate difficulty conservatively.
- Estimate duration conservatively.
- Estimate cost conservatively.
- Identify required and optional tools.
- Include useful tool quantities when relevant.
- Identify required materials and useful quantities.
- Include material dimensions and specifications when reasonably known.
- Produce ordered, actionable project steps.
- Adapt detail to the user's stated experience.
- Prefer precise instructions over vague instructions.
- Do not add unnecessary filler.

STEP DETAIL REQUIREMENTS

Every step must explain the work in enough detail that the user can
understand exactly what action to perform.

For each step:

- Give a concise summary.
- Give detailed instructions.
- Estimate step duration when reasonably possible.
- Include a clear completion check.
- Include warnings whenever meaningful risk exists.
- Identify measurements that matter to the step.
- Identify technical specifications that matter to the step.
- Identify useful troubleshooting branches for likely failure states.
- Explain what the user should observe or verify before continuing.

MEASUREMENTS AND SPECIFICATIONS

- Give exact measurements, dimensions, specifications, settings,
  clearances, torque values, electrical values, pressures, temperatures,
  tolerances, or expected readings when they can reasonably be determined.
- Never invent an exact measurement when the user's real-world object or
  situation must first be measured.
- If the user must measure something, state what must be measured.
- Mark AI planning information as unverified unless it is genuinely
  supported by a verified source supplied to the system.
- Do not claim that a measurement or specification has been verified
  merely because it is commonly used.

VISUAL INSTRUCTION PLANNING

Howlsy is designed to become a visual interactive manual, not merely a
text instruction generator.

For every step, determine whether the user would benefit from:

- an instructional illustration
- an exploded or assembly diagram
- a wiring, plumbing, routing, or system diagram
- a dimensioned blueprint
- an annotated user photograph
- a three-dimensional interactive model

When a visual would materially improve understanding, add a
visualInstructions entry.

Describe exactly what the visual should show.

For a blueprint or dimensioned drawing, requestedDetails should identify
the views, dimensions, labels, materials, orientation, scale information,
or other details that should appear.

For an annotated image, explain what components, locations, fasteners,
connections, defects, measurements, or actions should be highlighted.

Do not pretend that a visual has already been generated.

The visualInstructions array is a specification for Howlsy's later visual
generation and enrichment systems.

RESOURCE AND PRODUCT INTEGRITY

This planning endpoint does not independently browse the web, retrieve
manufacturer catalogs, verify product inventory, or generate media.

Therefore:

- Do not invent product URLs.
- Do not invent video URLs.
- Do not invent document URLs.
- Do not invent manufacturer URLs.
- Do not invent citations.
- Do not claim compatibility has been verified unless verified source
  information was actually supplied.
- Do not claim a source was retrieved when it was not.
- Leave project sources empty unless actual source information was
  supplied in the intake.
- Actual images, diagrams, videos, products, parts, documents, and
  authoritative sources will be attached by later Howlsy enrichment
  systems.

SAFETY

- Identify relevant hazards and protective equipment.
- Recommend professional assistance when licensed, specialized,
  structural, electrical, gas, medical, legal, hazardous, or otherwise
  high-risk work may require it.
- Never claim a law, code, specification, diagnosis, compatibility,
  measurement, or safety condition has been verified when it has not.
- Distinguish estimates from verified facts.
- Never let visual detail or step detail imply that dangerous work is
  safe merely because instructions are available.

TROUBLESHOOTING

When useful, create branches such as:

"If you observe X..."
"Check Y..."
"If the reading is Z..."
"Do not continue if..."
"The expected result is..."

Troubleshooting should help the user decide what to do next instead of
forcing them to restart the project or guess.

ACCESSIBILITY

Howlsy should remain usable when visual or audio resources are later
added.

For each step:

- Provide a useful visual description when visual instruction is planned.
- Provide an audio-friendly explanation of the action.
- Provide transcript-ready instructional text.
- Do not rely on color alone to communicate meaning.

RICH PROJECT PRINCIPLE

A Howlsy project should eventually be capable of becoming:

goal
  ↓
detailed plan
  ↓
step-by-step manual
  ↓
measurements + specifications
  ↓
illustrations + diagrams + blueprints
  ↓
videos + interactive resources
  ↓
products + compatible parts
  ↓
verified references
  ↓
adaptive troubleshooting
  ↓
accessible guided execution

This endpoint creates the structured planning layer that those later
systems will enrich.

Use an empty string when an optional string value is unnecessary.
Use an empty array when a collection has no applicable entries.
          `.trim(),
        },

        {
          role: "user",

          content: `
Create a Howlsy project plan from this intake.

Goal:
${goal}

Context:
${context || "No additional context provided."}

Experience:
${experience || "Not provided."}

Constraints:
${constraints || "No constraints provided."}
          `.trim(),
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name: "howlsy_project_plan",
          strict: true,
          schema: howlsyProjectPlanSchema,
        },
      },
    });

    if (!response.output_text) {
      return NextResponse.json(
        {
          error: "Howlsy did not return a project plan.",
        },
        {
          status: 502,
        }
      );
    }

    const generatedPlan = JSON.parse(
      response.output_text
    ) as GeneratedProjectPlan;

    const timestamp = new Date().toISOString();

    const project: HowlsyProject = {
      id: randomUUID(),

      title: generatedPlan.title,

      description: generatedPlan.description,

      category: generatedPlan.category,

      status: "ready",

      difficulty: generatedPlan.difficulty,

      estimatedDuration:
        generatedPlan.estimatedDuration,

      estimatedCostMin:
        generatedPlan.estimatedCostMin,

      estimatedCostMax:
        generatedPlan.estimatedCostMax,

      goal,

      context,

      experience,

      constraints,

      safety: {
        summary: generatedPlan.safety.summary,

        hazards: generatedPlan.safety.hazards,

        protectiveEquipment:
          generatedPlan.safety.protectiveEquipment,

        professionalHelpRecommended:
          generatedPlan.safety.professionalHelpRecommended,

        professionalHelpReason:
          generatedPlan.safety.professionalHelpReason ||
          undefined,
      },

      tools: generatedPlan.tools.map((tool) => ({
        name: tool.name,

        required: tool.required,

        quantity: tool.quantity || undefined,

        notes: tool.notes || undefined,

        safetyNotes:
          tool.safetyNotes || undefined,
      })),

      materials: generatedPlan.materials.map(
        (material) => ({
          name: material.name,

          quantity:
            material.quantity || undefined,

          estimatedCost:
            material.estimatedCost,

          dimensions:
            material.dimensions || undefined,

          specifications:
            material.specifications || undefined,

          notes:
            material.notes || undefined,
        })
      ),

      steps: generatedPlan.steps.map(
        (step, index) => ({
          id: `step-${index + 1}`,

          order: index + 1,

          title: step.title,

          summary:
            step.summary || undefined,

          instructions: step.instructions,

          completionCheck:
            step.completionCheck,

          warning:
            step.warning || undefined,

          estimatedDuration:
            step.estimatedDuration || undefined,

          measurements: step.measurements.map(
            (measurement) => ({
              label: measurement.label,

              value: measurement.value,

              unit:
                measurement.unit || undefined,

              tolerance:
                measurement.tolerance || undefined,

              notes:
                measurement.notes || undefined,

              source:
                measurement.source || undefined,

              verified: measurement.verified,
            })
          ),

          specifications: step.specifications.map(
            (specification) => ({
              name: specification.name,

              value: specification.value,

              notes:
                specification.notes || undefined,

              source:
                specification.source || undefined,

              verified: specification.verified,
            })
          ),

          visualInstructions:
            step.visualInstructions.map((visual) => ({
              title: visual.title,

              description: visual.description,

              resourceType: visual.resourceType,

              required: visual.required,

              requestedDetails:
                visual.requestedDetails,
            })),

          /*
           * Actual rich resources are attached by later enrichment
           * systems. The planning model describes what should exist
           * without pretending that media has already been generated
           * or retrieved.
           */
          resources: [],

          /*
           * Product and part references require a separate retrieval
           * and compatibility-verification layer. The planning model
           * must not invent purchasable items or URLs.
           */
          products: [],

          troubleshooting:
            step.troubleshooting.map(
              (branch, branchIndex) => ({
                id: `step-${index + 1}-branch-${
                  branchIndex + 1
                }`,

                condition: branch.condition,

                explanation: branch.explanation,

                nextAction: branch.nextAction,

                expectedResult:
                  branch.expectedResult || undefined,

                warning:
                  branch.warning || undefined,
              })
            ),

          accessibility: {
            visualDescription:
              step.accessibility.visualDescription ||
              undefined,

            audioExplanation:
              step.accessibility.audioExplanation ||
              undefined,

            transcript:
              step.accessibility.transcript ||
              undefined,
          },
        })
      ),

      /*
       * The planning endpoint has no retrieval system yet, so it must
       * not fabricate citations. Real sources will be populated by a
       * dedicated retrieval and verification layer.
       */
      sources: generatedPlan.sources.map(
        (source) => ({
          id: randomUUID(),

          title: source.title,

          publisher:
            source.publisher || undefined,

          url:
            source.url || undefined,

          sourceType: source.sourceType,

          verified: source.verified,

          notes:
            source.notes || undefined,
        })
      ),

      /*
       * Progress belongs to Howlsy's application state rather than the
       * AI-generated planning response. A newly generated project is
       * ready to begin but has not completed or entered any step yet.
       */
      progress: {
        completedStepIds: [],
      },

      createdAt: timestamp,

      updatedAt: timestamp,
    };

    return NextResponse.json({
      project,
    });
  } catch (error) {
    console.error(
      "Howlsy project generation failed:",
      error
    );

    if (error instanceof OpenAI.RateLimitError) {
      return NextResponse.json(
        {
          error:
            "Howlsy AI is temporarily unavailable because the OpenAI API rate limit or credit limit was reached.",
        },
        {
          status: 429,
        }
      );
    }

    if (error instanceof OpenAI.AuthenticationError) {
      return NextResponse.json(
        {
          error:
            "Howlsy could not authenticate with the AI service.",
        },
        {
          status: 502,
        }
      );
    }

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error:
            "Howlsy could not generate the project because the AI service returned an error.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to generate the project.",
      },
      {
        status: 500,
      }
    );
  }
}