import type { HowlsyProject } from "../types/project";

export const mockProject: HowlsyProject = {
  id: "mock-project-001",

  title: "Example Howlsy Project",

  description:
    "A temporary project used to develop and test Howlsy's structured project experience.",

  category: "general",

  status: "ready",

  difficulty: "beginner",

  estimatedDuration: "1–2 hours",

  estimatedCostMin: 25,

  estimatedCostMax: 75,

  goal: "Complete an example project",

  context:
    "This project is being used while Howlsy is under development.",

  experience: "Beginner",

  constraints: "Keep the project simple and inexpensive.",

  safety: {
    summary:
      "Review the work area and understand any potential hazards before beginning.",

    hazards: [
      "Improper tool use",
      "Unexpected conditions in the work area",
    ],

    protectiveEquipment: [
      "Safety glasses",
      "Appropriate work gloves",
    ],

    professionalHelpRecommended: false,
  },

  tools: [
    {
      name: "Basic hand tools",

      required: true,

      quantity: "1 set",

      notes:
        "Exact tools will depend on the generated project.",

      safetyNotes:
        "Inspect tools before use and do not use damaged equipment.",
    },

    {
      name: "Tape measure",

      required: false,

      quantity: "1",

      notes:
        "Useful when the project requires dimensions or layout checks.",
    },
  ],

  materials: [
    {
      name: "Project-specific materials",

      quantity: "As needed",

      estimatedCost: 25,

      specifications:
        "Specifications will depend on the generated project.",

      notes:
        "Confirm required dimensions and compatibility before purchasing.",
    },

    {
      name: "Consumable supplies",

      quantity: "As needed",

      estimatedCost: 10,

      notes:
        "Examples may include fasteners, tape, marking supplies, or protective coverings.",
    },
  ],

  steps: [
    {
      id: "step-1",

      order: 1,

      title: "Review the project",

      summary:
        "Understand the full plan, expected result, risks, and required resources before beginning.",

      instructions:
        "Read through the entire project plan before beginning any work. Review the goal, tools, materials, safety information, measurements, visual instructions, and completion checks so you understand the full sequence before starting.",

      completionCheck:
        "Confirm that you understand the goal, the sequence of work, and any conditions that would require you to stop or seek additional information.",

      estimatedDuration: "5–10 minutes",

      measurements: [],

      specifications: [],

      visualInstructions: [
        {
          title: "Project overview illustration",

          description:
            "Show a simple overview of the project workflow from preparation through completion so the user can understand the overall sequence before beginning.",

          resourceType: "illustration",

          required: false,

          requestedDetails: [
            "Preparation stage",
            "Work stage",
            "Verification stage",
            "Completion stage",
          ],
        },
      ],

      resources: [],

      products: [],

      troubleshooting: [
        {
          id: "step-1-branch-1",

          condition:
            "The project instructions contain a term, dimension, or action you do not understand.",

          explanation:
            "Beginning work without understanding a critical instruction can lead to mistakes or unsafe conditions.",

          nextAction:
            "Do not begin that portion of the project. Review the related explanation, visual instruction, or reference information first.",

          expectedResult:
            "You should understand what the instruction requires before continuing.",
        },
      ],

      accessibility: {
        visualDescription:
          "A project overview showing preparation, execution, verification, and completion as a simple ordered sequence.",

        audioExplanation:
          "Before beginning, review the full project so you understand what you will do, what you will need, and what conditions would require you to stop.",

        transcript:
          "Review the complete project plan before beginning. Confirm that you understand the goal, required resources, safety information, sequence of steps, and completion checks.",
      },
    },

    {
      id: "step-2",

      order: 2,

      title: "Gather tools and materials",

      summary:
        "Prepare the work area and confirm that all required tools and materials are available before starting.",

      instructions:
        "Collect everything required for the project before beginning. Inspect required tools for damage, confirm that materials match the project requirements, and place frequently used items where they can be reached safely during the work.",

      completionCheck:
        "Confirm that all required tools and materials are present, usable, and appropriate for the project.",

      estimatedDuration: "10–20 minutes",

      measurements: [
        {
          label: "Work area clearance",

          value: "Measure as required for the specific project",

          notes:
            "The exact clearance depends on the project and surrounding environment.",

          verified: false,
        },
      ],

      specifications: [
        {
          name: "Material compatibility",

          value:
            "Materials must match the requirements of the specific project.",

          notes:
            "Do not assume compatibility when dimensions, model numbers, ratings, or material types matter.",

          verified: false,
        },
      ],

      visualInstructions: [
        {
          title: "Tool and material staging layout",

          description:
            "Show an organized work area with tools and materials separated into required, optional, and safety-related groups.",

          resourceType: "diagram",

          required: false,

          requestedDetails: [
            "Required tools",
            "Optional tools",
            "Materials",
            "Protective equipment",
            "Clear working area",
          ],
        },
      ],

      resources: [],

      products: [],

      troubleshooting: [
        {
          id: "step-2-branch-1",

          condition:
            "A required tool or material is missing.",

          explanation:
            "Substituting an incompatible tool or material may damage the project or create an unsafe condition.",

          nextAction:
            "Stop preparation and obtain the correct item or confirm that a safe compatible alternative exists before beginning the work.",

          expectedResult:
            "All required resources should be available before the project begins.",
        },

        {
          id: "step-2-branch-2",

          condition:
            "A tool is damaged or does not operate correctly.",

          explanation:
            "Damaged tools may produce inaccurate work or create injury risk.",

          nextAction:
            "Remove the damaged tool from service and replace or repair it before continuing.",

          warning:
            "Do not use visibly damaged or malfunctioning tools.",
        },
      ],

      accessibility: {
        visualDescription:
          "An organized work area with required tools, materials, and safety equipment grouped separately and positioned within easy reach.",

        audioExplanation:
          "Gather and inspect everything before starting. Make sure required tools are working and materials match the project requirements.",

        transcript:
          "Collect the required tools, materials, and protective equipment. Inspect tools for damage and verify that project materials are appropriate before beginning.",
      },
    },

    {
      id: "step-3",

      order: 3,

      title: "Begin the work",

      summary:
        "Complete the project one controlled step at a time and verify each result before moving forward.",

      instructions:
        "Follow the project instructions carefully and complete the work one step at a time. Compare the actual result with the expected result after each action. If measurements, fitment, behavior, or surrounding conditions differ from the project plan, stop and investigate the difference before proceeding.",

      completionCheck:
        "Confirm that the work matches the expected project result and that no unresolved warnings, incorrect measurements, loose components, unexpected behavior, or unsafe conditions remain.",

      warning:
        "Stop if you encounter a condition that is unsafe or meaningfully different from the project plan.",

      estimatedDuration: "Project dependent",

      measurements: [
        {
          label: "Final project measurements",

          value:
            "Compare actual dimensions with the project-specific requirements",

          notes:
            "Exact measurements must come from the generated project or verified real-world measurements.",

          verified: false,
        },
      ],

      specifications: [
        {
          name: "Completion condition",

          value:
            "The finished work must meet the project-specific completion checks.",

          notes:
            "Do not mark the project complete while an unresolved discrepancy remains.",

          verified: false,
        },
      ],

      visualInstructions: [
        {
          title: "Step execution illustration",

          description:
            "Show the user's current action, important components, orientation, and expected finished condition.",

          resourceType: "illustration",

          required: true,

          requestedDetails: [
            "Current work area",
            "Action direction",
            "Important components",
            "Expected finished condition",
          ],
        },

        {
          title: "Final verification diagram",

          description:
            "Show the important locations or conditions the user should inspect before considering the work complete.",

          resourceType: "diagram",

          required: false,

          requestedDetails: [
            "Inspection points",
            "Measurement locations",
            "Fasteners or connections",
            "Expected final condition",
          ],
        },
      ],

      resources: [],

      products: [],

      troubleshooting: [
        {
          id: "step-3-branch-1",

          condition:
            "The actual result does not match the expected result.",

          explanation:
            "A mismatch may indicate an incorrect measurement, installation error, incompatible component, or unexpected project condition.",

          nextAction:
            "Stop and identify the difference before continuing. Recheck measurements, orientation, compatibility, and the previous completed step.",

          expectedResult:
            "The cause of the mismatch should be understood before additional work is performed.",
        },

        {
          id: "step-3-branch-2",

          condition:
            "An unsafe or unexpected condition appears.",

          explanation:
            "The original project plan may no longer match the real-world condition.",

          nextAction:
            "Stop the work, make the area safe, and reassess the project before continuing.",

          warning:
            "Do not continue simply because the next written step is available.",
        },
      ],

      accessibility: {
        visualDescription:
          "A close instructional view showing the active work area, important components, direction of action, and inspection points used to verify completion.",

        audioExplanation:
          "Complete one action at a time and check the result before continuing. Stop if the actual condition differs from what the project expects.",

        transcript:
          "Follow each project instruction in order. Verify the expected result after each action. If a measurement, fit, behavior, or safety condition differs from the plan, stop and investigate before continuing.",
      },
    },
  ],

  sources: [],

  progress: {
    completedStepIds: [],
  },

  createdAt: "2026-09-14T00:00:00.000Z",

  updatedAt: "2026-09-14T00:00:00.000Z",
};