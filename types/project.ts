export type ProjectDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type ProjectStatus =
  | "draft"
  | "ready"
  | "in_progress"
  | "completed";

/*
 * Resources represent information or media that can help a user
 * understand and execute a project step.
 */
export type ProjectResourceType =
  | "image"
  | "illustration"
  | "diagram"
  | "blueprint"
  | "annotated_image"
  | "video"
  | "audio"
  | "document"
  | "product"
  | "part"
  | "source"
  | "interactive"
  | "three_d";

/*
 * Resource origin is deliberately separate from verification.
 *
 * A manufacturer resource may still need verification, while a
 * Howlsy-generated diagram should never be presented as though it
 * came from an external authoritative source.
 */
export type ProjectResourceOrigin =
  | "howlsy_generated"
  | "user_provided"
  | "manufacturer"
  | "government"
  | "professional_organization"
  | "retailer"
  | "publisher"
  | "creator"
  | "community"
  | "other";

export type ProjectResourceVerificationStatus =
  | "requested"
  | "generated"
  | "estimated"
  | "retrieved"
  | "unverified"
  | "verified";

/*
 * Retrieval status records whether Howlsy has actually fulfilled a
 * resource request. Planning a resource and retrieving it are
 * different operations.
 */
export type ProjectResourceRetrievalStatus =
  | "planned"
  | "searching"
  | "found"
  | "not_found"
  | "failed";

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

  /*
   * URLs are optional because a planned or generated resource may not
   * have a retrievable external location yet.
   */
  url?: string;
  thumbnailUrl?: string;

  altText?: string;
  transcript?: string;
  captionsAvailable?: boolean;

  origin?: ProjectResourceOrigin;

  sourceName?: string;
  sourceUrl?: string;

  verificationStatus: ProjectResourceVerificationStatus;
  retrievalStatus?: ProjectResourceRetrievalStatus;

  interactive?: boolean;
  downloadable?: boolean;

  notes?: string;
};

/*
 * Visual instructions describe media Howlsy determines would improve
 * a project step. They do not claim that the visual already exists.
 */
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

/*
 * Product references describe what the project requires.
 *
 * They are intentionally separate from retailer offers. A compatible
 * product and a store listing for that product are different records.
 */
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

/*
 * Product offers represent actual retailer or supplier listings found
 * during enrichment.
 *
 * Price and inventory are time-sensitive facts and therefore include
 * retrieval metadata instead of becoming permanent properties of the
 * product itself.
 */
export type ProjectProductOfferAvailability =
  | "in_stock"
  | "limited_stock"
  | "out_of_stock"
  | "available_online"
  | "preorder"
  | "unknown";

export type ProjectFulfillmentType =
  | "pickup"
  | "delivery"
  | "shipping";

export type ProjectProductOffer = {
  id: string;

  productReferenceId: string;

  retailerName: string;
  retailerLocationName?: string;

  title: string;
  url: string;

  price?: number;
  currency?: string;

  availability: ProjectProductOfferAvailability;
  fulfillment: ProjectFulfillmentType[];

  distanceMiles?: number;

  pickupEstimate?: string;
  deliveryEstimate?: string;
  shippingEstimate?: string;

  storeAddress?: string;

  imageUrl?: string;

  retrievedAt: string;

  /*
   * Compatibility must be verified independently from the fact that a
   * retailer happened to return the product in search results.
   */
  verifiedCompatibility: boolean;
  compatibilityNotes?: string;

  sourceName?: string;
  sourceUrl?: string;
};

/*
 * A resource request tells the future enrichment engine what it should
 * find or generate for a particular step.
 *
 * This is the bridge between AI project planning and external
 * retrieval/generation systems.
 */
export type ProjectResourceRequestPurpose =
  | "show"
  | "verify"
  | "learn"
  | "find";

export type ProjectResourceRequest = {
  id: string;

  purpose: ProjectResourceRequestPurpose;
  resourceType: ProjectResourceType;

  title: string;
  description: string;

  required: boolean;

  searchQuery?: string;
  requestedDetails?: string[];

  retrievalStatus: ProjectResourceRetrievalStatus;

  resolvedResourceIds: string[];
  resolvedProductReferenceIds: string[];
  resolvedProductOfferIds: string[];
};

/*
 * Actions represent real-world operations Howlsy may eventually help
 * perform after the user has reviewed the relevant information.
 *
 * Creating an action does not mean Howlsy has permission to execute it.
 */
export type ProjectActionType =
  | "open_product"
  | "open_source"
  | "open_video"
  | "get_directions"
  | "prepare_purchase"
  | "purchase"
  | "schedule_service"
  | "open_application"
  | "other";

export type ProjectActionStatus =
  | "available"
  | "awaiting_authorization"
  | "authorized"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "failed";

export type ProjectAction = {
  id: string;

  type: ProjectActionType;
  title: string;
  description?: string;

  status: ProjectActionStatus;

  /*
   * Actions that can create an external side effect must require
   * explicit authorization before execution.
   */
  requiresAuthorization: boolean;
  authorizedAt?: string;

  resourceId?: string;
  productReferenceId?: string;
  productOfferId?: string;

  externalUrl?: string;

  createdAt: string;
  completedAt?: string;

  resultSummary?: string;
  errorMessage?: string;
};

export type ProjectTroubleshootingBranch = {
  id: string;
  condition: string;
  explanation: string;
  nextAction: string;
  expectedResult?: string;
  warning?: string;
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

  /*
   * resourceRequests describe what still needs to be found or
   * generated. resources contains fulfilled or attached resources.
   */
  resourceRequests: ProjectResourceRequest[];
  resources: ProjectResource[];

  products: ProjectProductReference[];
  productOffers: ProjectProductOffer[];

  actions: ProjectAction[];

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

export type ProjectProgress = {
  completedStepIds: string[];

  currentStepId?: string;

  startedAt?: string;
  completedAt?: string;
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

  progress: ProjectProgress;

  createdAt: string;
  updatedAt: string;
};