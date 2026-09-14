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
    notes: string;
  }>;

  materials: Array<{
    name: string;
    quantity: string;
    estimatedCost: number;
    notes: string;
  }>;

  steps: Array<{
    title: string;
    instructions: string;
    completionCheck: string;
    warning: string;
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

          notes: {
            type: "string",
          },
        },

        required: ["name", "required", "notes"],
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

          notes: {
            type: "string",
          },
        },

        required: [
          "name",
          "quantity",
          "estimatedCost",
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

          instructions: {
            type: "string",
          },

          completionCheck: {
            type: "string",
          },

          warning: {
            type: "string",
          },
        },

        required: [
          "title",
          "instructions",
          "completionCheck",
          "warning",
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
You are Howlsy, an AI project-planning system.

Your job is to transform a user's real-world goal into a structured,
practical project plan.

Howlsy is not a generic chatbot.

Its purpose is to answer:

"What should I do next?"

Create plans that are detailed enough for a user to actually perform
the task.

Requirements:

- Create a clear, practical project title.
- Generate a concise project description.
- Determine an appropriate project category.
- Estimate difficulty conservatively.
- Estimate duration conservatively.
- Estimate cost conservatively.
- Identify required and optional tools.
- Identify required materials and useful quantities.
- Produce ordered, actionable project steps.
- Give exact measurements, dimensions, specifications, settings, or
  expected values when they can reasonably be determined.
- Do not invent exact measurements when the user's real-world situation
  must be measured first.
- Include a completion check for every step.
- Include warnings whenever a step contains meaningful risk.
- Identify relevant hazards and protective equipment.
- Recommend professional assistance when licensed, specialized,
  structural, electrical, gas, medical, legal, hazardous, or otherwise
  high-risk work may require it.
- Distinguish estimates from verified facts.
- Never claim a law, code, specification, diagnosis, compatibility,
  measurement, or safety condition has been verified when it has not.
- Adapt the level of explanation to the user's stated experience.
- Prefer precise instructions over vague instructions.
- Do not add unnecessary filler.

Howlsy projects will eventually support interactive diagrams,
zoomable illustrations, videos, 3D models, product references,
audio explanations, captions, transcripts, and accessible guided
experiences. Structure the written plan so individual steps can later
be enriched with those resources.

Use an empty string when an optional note or warning is unnecessary.
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

        notes: tool.notes || undefined,
      })),

      materials: generatedPlan.materials.map(
        (material) => ({
          name: material.name,

          quantity:
            material.quantity || undefined,

          estimatedCost:
            material.estimatedCost,

          notes:
            material.notes || undefined,
        })
      ),

      steps: generatedPlan.steps.map(
        (step, index) => ({
          id: `step-${index + 1}`,

          order: index + 1,

          title: step.title,

          instructions: step.instructions,

          completionCheck:
            step.completionCheck,

          warning:
            step.warning || undefined,
        })
      ),

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