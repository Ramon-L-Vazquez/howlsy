export type ProjectDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type ProjectStatus =
  | "draft"
  | "ready"
  | "in_progress"
  | "completed";

export type ProjectStep = {
  id: string;
  order: number;
  title: string;
  instructions: string;
  completionCheck: string;
  warning?: string;
};

export type ProjectTool = {
  name: string;
  required: boolean;
  notes?: string;
};

export type ProjectMaterial = {
  name: string;
  quantity?: string;
  estimatedCost?: number;
  notes?: string;
};

export type ProjectSafety = {
  summary: string;
  hazards: string[];
  protectiveEquipment: string[];
  professionalHelpRecommended: boolean;
  professionalHelpReason?: string;
};

export type HowlsyProject = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  difficulty: ProjectDifficulty;

  estimatedDuration: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;

  goal: string;
  context: string;
  experience: string;
  constraints: string;

  safety: ProjectSafety;
  tools: ProjectTool[];
  materials: ProjectMaterial[];
  steps: ProjectStep[];

  createdAt: string;
  updatedAt: string;
};