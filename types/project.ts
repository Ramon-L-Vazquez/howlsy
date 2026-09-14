export type ProjectDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type ProjectStatus =
  | "draft"
  | "ready"
  | "in_progress"
  | "completed";

export type ProjectResourceType =
  | "image"
  | "illustration"
  | "diagram"
  | "blueprint"
  | "video"
  | "audio"
  | "document"
  | "product"
  | "part"
  | "source"
  | "interactive"
  | "three_d";

export type ProjectResourceVerificationStatus =
  | "generated"
  | "estimated"
  | "unverified"
  | "verified";

export type ProjectMeasurement = {
  label: string;
  value: string;
  unit?: string;
  tolerance?: string;
  notes?: string;
  source?: string;
  verified: boolean;
};

export type ProjectSpecification = {
  name: string;
  value: string;
  notes?: string;
  source?: string;
  verified: boolean;
};

export type ProjectResource = {
  id: string;
  type: ProjectResourceType;

  title: string;
  description?: string;

  url?: string;
  thumbnailUrl?: string;

  altText?: string;
  transcript?: string;
  captionsAvailable?: boolean;

  sourceName?: string;
  sourceUrl?: string;

  verificationStatus: ProjectResourceVerificationStatus;

  interactive?: boolean;
  downloadable?: boolean;

  notes?: string;
};

export type ProjectProductReference = {
  id: string;

  name: string;
  brand?: string;
  model?: string;
  partNumber?: string;

  purpose: string;

  quantity?: string;
  estimatedPrice?: number;

  productUrl?: string;
  imageUrl?: string;

  compatibilityNotes?: string;

  verifiedCompatibility: boolean;

  sourceName?: string;
  sourceUrl?: string;
};

export type ProjectTroubleshootingBranch = {
  id: string;

  condition: string;
  explanation: string;

  nextAction: string;

  expectedResult?: string;

  warning?: string;
};

export type ProjectVisualInstruction = {
  title: string;

  description: string;

  resourceType:
    | "illustration"
    | "diagram"
    | "blueprint"
    | "annotated_image"
    | "three_d";

  required: boolean;

  requestedDetails?: string[];
};

export type ProjectStep = {
  id: string;
  order: number;

  title: string;

  summary?: string;

  instructions: string;

  completionCheck: string;

  warning?: string;

  estimatedDuration?: string;

  measurements: ProjectMeasurement[];

  specifications: ProjectSpecification[];

  visualInstructions: ProjectVisualInstruction[];

  resources: ProjectResource[];

  products: ProjectProductReference[];

  troubleshooting: ProjectTroubleshootingBranch[];

  accessibility: {
    visualDescription?: string;
    audioExplanation?: string;
    transcript?: string;
  };
};

export type ProjectTool = {
  name: string;
  required: boolean;

  quantity?: string;

  notes?: string;

  safetyNotes?: string;

  productReference?: ProjectProductReference;
};

export type ProjectMaterial = {
  name: string;

  quantity?: string;

  estimatedCost?: number;

  dimensions?: string;

  specifications?: string;

  notes?: string;

  productReference?: ProjectProductReference;
};

export type ProjectSafety = {
  summary: string;

  hazards: string[];

  protectiveEquipment: string[];

  professionalHelpRecommended: boolean;

  professionalHelpReason?: string;
};

export type ProjectSource = {
  id: string;

  title: string;

  publisher?: string;

  url?: string;

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

  notes?: string;
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

  sources: ProjectSource[];

  createdAt: string;

  updatedAt: string;
};