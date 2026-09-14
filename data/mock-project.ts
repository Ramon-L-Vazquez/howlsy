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

  context: "This project is being used while Howlsy is under development.",

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
      notes: "Exact tools will depend on the generated project.",
    },
    {
      name: "Tape measure",
      required: false,
    },
  ],

  materials: [
    {
      name: "Project-specific materials",
      quantity: "As needed",
      estimatedCost: 25,
    },
    {
      name: "Consumable supplies",
      quantity: "As needed",
      estimatedCost: 10,
    },
  ],

  steps: [
    {
      id: "step-1",
      order: 1,
      title: "Review the project",
      instructions:
        "Read through the entire project plan before beginning any work.",
      completionCheck:
        "Confirm that you understand the goal and the steps required.",
    },
    {
      id: "step-2",
      order: 2,
      title: "Gather tools and materials",
      instructions:
        "Collect everything required for the project before beginning.",
      completionCheck:
        "Confirm that the required tools and materials are available.",
    },
    {
      id: "step-3",
      order: 3,
      title: "Begin the work",
      instructions:
        "Follow the project instructions carefully and complete the work one step at a time.",
      completionCheck:
        "Confirm that the work was completed as expected.",
      warning:
        "Stop if you encounter a condition that is unsafe or different from the project plan.",
    },
  ],

  createdAt: "2026-09-14T00:00:00.000Z",

  updatedAt: "2026-09-14T00:00:00.000Z",
};