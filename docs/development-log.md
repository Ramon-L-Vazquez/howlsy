# Howlsy Development Log

This document tracks meaningful implementation decisions, bugs, production issues, fixes, and lessons encountered while building Howlsy.

The purpose of this log is to preserve the reasoning behind important technical changes rather than only documenting the final working implementation.

---

## 2026-09-14 — Production Build Failure with `useSearchParams`

### Problem

The Howlsy application worked correctly during local development using:

```bash
npm run dev
```

The development server successfully loaded the application and the primary workflow operated correctly:

```text
Home
→ Intake
→ Project Plan
→ Guided Mode
→ Project Completion
```

However, when testing the application as a production build using:

```bash
npm run build
```

Next.js failed during prerendering.

The first failure occurred on the `/guided` route with the following error:

```text
useSearchParams() should be wrapped in a suspense boundary at page "/guided".
```

After correcting `/guided`, the production build exposed the same issue on:

```text
/intake
```

After correcting `/intake`, the build exposed the same issue on:

```text
/project
```

This demonstrated that all three pages using `useSearchParams()` required the same architectural correction.

---

### Cause

At this stage of development, Howlsy passed temporary project information between pages using URL search parameters.

For example:

```text
/intake?goal=Build+a+wall
```

The application read those values using the Next.js `useSearchParams()` hook.

The affected routes were:

```text
/intake
/project
/guided
```

Although these pages operated correctly through the development server, the production build applied stricter prerendering requirements.

Components using `useSearchParams()` needed to be rendered within a React `Suspense` boundary.

This issue was therefore not visible during the initial development-server testing.

---

### Initial Architecture

The affected pages originally followed a structure similar to:

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function ExamplePage() {
  const searchParams = useSearchParams();

  const goal = searchParams.get("goal") ?? "";

  return <main>{goal}</main>;
}
```

This worked during development but caused the production prerender to fail.

---

### Fix

Each affected route was refactored so that the component calling `useSearchParams()` was rendered inside a React `Suspense` boundary.

The structure followed this pattern:

```tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PageContent() {
  const searchParams = useSearchParams();

  const goal = searchParams.get("goal") ?? "";

  return <main>{goal}</main>;
}

function PageLoading() {
  return <main>Loading...</main>;
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PageContent />
    </Suspense>
  );
}
```

The same pattern was applied to:

```text
app/intake/page.tsx
app/project/page.tsx
app/guided/page.tsx
```

Each route also received an appropriate loading fallback.

---

### Verification

After correcting all three routes, the production build was run again:

```bash
npm run build
```

The build completed successfully.

Final build output:

```text
▲ Next.js 16.3.5 (Turbopack)

Creating an optimized production build ...
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data using 8 workers
✓ Generating static pages using 8 workers (7/7)
✓ Finalizing page optimization

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /guided
├ ○ /intake
└ ○ /project

○  (Static)  prerendered as static content
```

This verified that all current Howlsy application routes could successfully complete a production build.

---

### Result

The application successfully passed both TypeScript checking and Next.js production prerendering.

The following routes built successfully:

```text
/
/guided
/intake
/project
```

This also confirmed that the newly introduced structured project types and mock project data compiled successfully.

---

### Technical Lesson

A feature working correctly with:

```bash
npm run dev
```

does not guarantee that it will successfully build for production.

Development mode and production builds can exercise different framework behavior.

For Howlsy, production builds will therefore be run regularly throughout development instead of waiting until deployment.

This helps detect:

- TypeScript errors
- prerendering problems
- client/server component issues
- framework-specific rendering requirements
- deployment-related problems

before they become larger architectural issues.

---

## 2026-09-14 — Structured Project Data Model

### Decision

Howlsy should not allow arbitrary AI-generated text to directly define the application's project experience.

Instead, the application owns a structured TypeScript project model.

The AI will eventually generate information that conforms to this structure.

The primary project contract is located at:

```text
types/project.ts
```

The model defines structures for:

```text
HowlsyProject
ProjectStep
ProjectTool
ProjectMaterial
ProjectSafety
ProjectDifficulty
ProjectStatus
```

---

### Reasoning

Howlsy is designed to behave as a guided-action platform rather than a generic chatbot.

A project needs predictable information such as:

```text
title
description
category
status
difficulty
estimated duration
estimated cost
goal
context
experience
constraints
safety information
tools
materials
steps
```

Defining this structure in TypeScript gives the application a stable contract that can eventually be shared between:

```text
AI-generated project responses
Supabase project records
Project pages
Guided mode
Mock development data
Tests
API routes
```

This separates the application's data architecture from the language model generating the content.

---

### Mock Project

A temporary typed project was also created at:

```text
data/mock-project.ts
```

The mock project implements:

```ts
HowlsyProject
```

This allows the UI and project workflow to be developed against the same structure that future AI-generated projects will use.

TypeScript can now detect missing or incorrectly structured project information during development.

---

### Project Construction Boundary

Project creation was later centralized in:

```text
lib/create-project.ts
```

The `createProjectFromIntake()` function accepts the user's intake information and returns a complete `HowlsyProject`.

This prevents individual pages from independently constructing project objects.

The application therefore has a clear transformation boundary:

```text
Raw Intake
    ↓
createProjectFromIntake()
    ↓
HowlsyProject
```

During the current development stage, mock planning information supplies the portions of the project that will eventually be generated by AI.

This boundary is intentionally designed so that AI project generation can later replace the mock implementation without requiring the project and guided interfaces to be redesigned.

---

## 2026-09-14 — Browser Project Persistence

### Problem

The initial Howlsy workflow passed project information between routes through URL search parameters.

The flow was:

```text
Home
    ↓
Intake
    ↓
/project?goal=...&context=...&experience=...&constraints=...
    ↓
/guided?goal=...&context=...&experience=...&constraints=...
```

This was useful while establishing the first end-to-end application flow, but it was not appropriate as the project became more structured.

Project information could become significantly larger once Howlsy supports:

```text
AI-generated instructions
tools
materials
safety information
project steps
images
saved progress
additional project metadata
```

Continuing to transport that state through the URL would tightly couple navigation to the project's internal data.

It would also create unnecessarily long URLs and expose user-entered project details in browser history and copied links.

---

### Decision

A temporary browser persistence layer was introduced at:

```text
lib/project-store.ts
```

The module provides:

```text
saveProject()
getProject()
clearProject()
```

The current implementation uses browser `localStorage`.

This is intentionally a temporary persistence layer rather than the final Howlsy storage architecture.

---

### New Flow

The intake page now creates the structured project once:

```text
User Goal
    ↓
Guided Intake
    ↓
createProjectFromIntake()
    ↓
HowlsyProject
```

The resulting project is saved to the browser project store:

```text
HowlsyProject
    ↓
saveProject()
    ↓
localStorage
```

The project and guided pages then retrieve the same stored project:

```text
Browser Project Store
        ↓
   getProject()
      ↙   ↘
Project   Guided
```

Navigation is therefore now:

```text
/intake?goal=...
        ↓
    /project
        ↓
    /guided
```

The initial goal remains in the intake URL temporarily because the home page uses it to begin the intake process.

The complete project is no longer transported between the project and guided routes through URL parameters.

---

### Missing Project Handling

Because browser storage can be cleared or a user can navigate directly to `/project` or `/guided`, both pages handle the possibility that no stored project exists.

Instead of assuming project data is always available, the pages display a recovery state that allows the user to start a new project.

This prevents missing browser state from causing the interface to fail.

---

### Verification

After introducing the browser project store, a production build was run:

```bash
npm run build
```

The application successfully compiled, completed TypeScript validation, prerendered all routes, and completed the production build.

The complete browser workflow was then tested manually:

```text
Home
→ Intake
→ Review Answers
→ Build My Plan
→ Project
→ Guided Mode
→ Complete Guided Steps
→ Project Completion
```

The project and guided URLs were confirmed to contain no project query parameters:

```text
/project
/guided
```

Both `/project` and `/guided` were also refreshed directly.

The saved project remained available after each refresh, confirming that the browser persistence layer successfully recovered the active project.

---

### Result

Project state is now separated from route navigation.

The current architecture is:

```text
User Goal
    ↓
Guided Intake
    ↓
createProjectFromIntake()
    ↓
HowlsyProject
    ↓
Browser Project Store
    ↓
Project View
    ↓
Guided Mode
    ↓
Project Completion
```

The application now has three distinct responsibilities:

```text
create-project.ts
Transforms intake into the structured project model.

project-store.ts
Handles temporary project persistence.

Project and Guided pages
Render and interact with project data.
```

This separation reduces duplication and prepares the application for persistent server-backed projects.

---

### Future Architecture

The browser store is not intended to become Howlsy's permanent database.

The planned architecture is:

```text
User Goal
    ↓
AI Intake
    ↓
Clarifying Questions
    ↓
AI Project Generation
    ↓
Validated HowlsyProject
    ↓
Supabase
    ↓
Project ID
    ↓
Project View
    ↓
Guided Mode
    ↓
Saved Progress
```

At that stage, URLs can identify projects rather than contain project data.

For example:

```text
/projects/{projectId}
```

The UI can continue consuming the `HowlsyProject` contract while the persistence implementation changes from browser storage to Supabase.

---

### Technical Lesson

Navigation and application state serve different purposes.

URLs are useful for identifying resources and controlling navigation, but large structured application objects should not need to be serialized into route parameters simply to move between screens.

Creating a persistence boundary early also reduces the amount of application code that will need to change when the temporary storage implementation is replaced by a database.

---

## 2026-09-14 — AI Project Response Persistence Contract Failure

### Problem

After connecting the Howlsy intake experience to the live AI project-generation API, the application successfully generated a project but crashed when navigating to:

```text
/project
```

The browser reported:

```text
Runtime TypeError

Cannot read properties of undefined (reading 'summary')
```

The failure occurred in:

```text
app/project/page.tsx
```

at:

```tsx
project.safety.summary
```

The project page expected `project` to conform to the `HowlsyProject` contract, including:

```text
project.safety.summary
```

However, the object recovered from browser storage did not have `safety` at the expected level.

---

### Investigation

The AI generation endpoint correctly constructed a complete `HowlsyProject`.

The API returned the project using a response envelope:

```ts
return NextResponse.json({
  project,
});
```

Therefore, the actual HTTP response shape was:

```text
{
  project: HowlsyProject
}
```

The intake page, however, originally parsed the entire response as though the response itself were a `HowlsyProject`:

```ts
const project =
  (await response.json()) as HowlsyProject;

saveProject(project);
```

This created a contract mismatch.

Instead of storing:

```text
HowlsyProject
```

the browser persisted:

```text
{
  project: HowlsyProject
}
```

The malformed object was then recovered by `getProject()` and passed to the project page.

The UI expected:

```text
project.safety.summary
```

but the persisted object's actual path was:

```text
project.project.safety.summary
```

As a result:

```text
project.safety
```

was `undefined`, causing the runtime crash.

---

### Why TypeScript Did Not Catch the Problem

The bug exposed an important distinction between compile-time TypeScript types and runtime data validation.

The intake implementation used:

```ts
(await response.json()) as HowlsyProject
```

and the browser persistence implementation used a similar assertion after parsing `localStorage`.

A TypeScript `as` assertion does not inspect or validate the runtime object.

It only tells the TypeScript compiler to treat the value as the specified type.

Therefore, TypeScript accepted the code even though the actual runtime object had the wrong structure.

The same issue existed at the persistence boundary.

The original browser store effectively trusted:

```ts
JSON.parse(storedProject) as HowlsyProject
```

This meant malformed, outdated, or otherwise invalid browser data could enter the application while appearing correctly typed to the compiler.

---

### First Fix — Correct the API Response Contract

The intake page was updated to explicitly represent the actual API response:

```ts
type GenerateProjectResponse = {
  project: HowlsyProject;
};
```

The response is now parsed as:

```ts
const data =
  (await response.json()) as GenerateProjectResponse;
```

The project itself is then explicitly unwrapped:

```ts
saveProject(data.project);
```

This restores the intended flow:

```text
POST /api/projects/generate
        ↓
{
  project: HowlsyProject
}
        ↓
data.project
        ↓
saveProject()
        ↓
HowlsyProject
```

New AI-generated projects are therefore persisted using the correct application-owned project structure.

---

### Second Problem — Existing Malformed Browser Data

Correcting the intake page prevented future malformed projects from being stored.

However, testing revealed that the application could still crash.

The previously malformed project remained inside browser `localStorage`.

Refreshing `/project` therefore continued loading the old invalid structure.

This demonstrated that fixing the writer was not sufficient.

The persistence reader also needed to protect the application from invalid historical data.

---

### Second Fix — Runtime Validation at the Persistence Boundary

The browser project store was strengthened so that persisted values are treated as untrusted runtime data.

A lightweight runtime type guard was added:

```ts
isHowlsyProject()
```

The guard verifies important parts of the project structure before allowing the object into the application, including:

```text
id
title
description
category
status
difficulty
estimatedDuration
goal
context
experience
constraints
safety
tools
materials
steps
createdAt
updatedAt
```

The safety object is also checked before the project can reach the UI.

This prevents malformed browser data from being blindly trusted through a TypeScript assertion.

The new persistence boundary follows:

```text
localStorage
    ↓
JSON.parse()
    ↓
unknown
    ↓
runtime validation
    ↓
valid HowlsyProject
    ↓
application
```

Invalid data returns:

```text
null
```

rather than being allowed to crash the project interface.

---

### Legacy Data Migration

Because the malformed project had already been written during development, Howlsy also received a small compatibility migration.

The project store detects the known legacy shape:

```text
{
  project: HowlsyProject
}
```

If the nested project passes runtime validation, Howlsy extracts it:

```text
legacy response envelope
        ↓
nested project
        ↓
runtime validation
        ↓
valid HowlsyProject
```

The valid nested project is then written back to browser storage using the current format:

```text
{
  project: HowlsyProject
}
        ↓
HowlsyProject
        ↓
saveProject()
        ↓
correct localStorage record
```

This allows existing development data to repair itself without requiring the browser's storage to be manually cleared.

---

### Verification

After correcting the API response handling and strengthening the persistence layer, the production build was run:

```bash
npm run build
```

The build completed successfully:

```text
Creating an optimized production build ...
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

The build included:

```text
/
ƒ /api/projects/generate
/guided
/icon.svg
/intake
/project
```

The existing malformed browser project was deliberately left in `localStorage`.

The `/project` route was then refreshed without manually clearing or replacing that data.

The persistence layer successfully detected the legacy response envelope, validated the nested `HowlsyProject`, migrated it to the correct storage format, and loaded the project.

The original runtime failure:

```text
Cannot read properties of undefined (reading 'summary')
```

no longer occurred.

This verified both the immediate bug fix and the legacy-data repair path.

---

### Result

Howlsy's AI project flow now has a clearer contract across the client and persistence boundaries:

```text
User Intake
    ↓
POST /api/projects/generate
    ↓
AI Structured Planning Data
    ↓
Server-owned HowlsyProject
    ↓
{
  project: HowlsyProject
}
    ↓
Client unwraps data.project
    ↓
saveProject()
    ↓
localStorage
    ↓
runtime validation
    ↓
Project View
```

Existing data using the accidentally persisted response envelope can also be migrated automatically.

The project page no longer has to assume that any JSON object recovered from browser storage is valid merely because TypeScript has assigned it a project type.

---

### Technical Lesson

TypeScript protects compile-time relationships between values that the application already understands.

It does not validate external or persisted runtime data.

Data crossing boundaries such as:

```text
HTTP responses
localStorage
databases
files
third-party APIs
AI-generated structured output
```

should be treated as untrusted until its runtime structure has been verified.

A type assertion such as:

```ts
value as HowlsyProject
```

is not validation.

This incident also demonstrated why bug verification should reproduce the original failure state whenever possible.

Instead of clearing the malformed browser data and hiding the problem, the existing broken record was retained and used to verify that the new migration logic could repair it.

As Howlsy grows, API, AI, persistence, and database boundaries should increasingly use explicit runtime schemas rather than relying only on TypeScript assertions.

---

---

## 2026-09-14 — Rich Project Output Architecture and Type Narrowing Failure

### Architecture Milestone

Howlsy's original structured project contract was intentionally small while the core workflow was being established.

A project step primarily contained:

```text
title
instructions
completion check
warning
```

That structure was sufficient to prove the initial flow, but it was not rich enough for Howlsy's long-term product goal.

Howlsy is intended to become an interactive manual that can combine detailed instructions with measurements, diagrams, blueprints, media, verified references, troubleshooting, accessibility information, and eventually product and part information.

The project contract in:

```text
types/project.ts
```

was therefore expanded so the application can represent those concepts directly instead of attaching arbitrary AI prose to the UI.

### Rich Project Contract

The expanded model now supports step-level information including:

```text
summary
estimated duration
measurements
specifications
visual instructions
resources
products and parts
troubleshooting branches
accessibility information
```

Project-wide source records were also added. Supporting types now represent measurements, specifications, rich resources, product references, troubleshooting branches, visual instructions, and sources.

Rich resources can represent images, illustrations, diagrams, blueprints, videos, audio, documents, products, parts, sources, interactive resources, and 3D resources.

The model also distinguishes resource verification states:

```text
generated
estimated
unverified
verified
```

This distinction prevents generated or estimated information from being presented as though it came from a verified manufacturer, code, government, or technical source.

### AI Planning Boundary

The AI project-generation route was expanded to generate planning metadata for measurements, specifications, visual requirements, troubleshooting branches, accessibility descriptions, step duration, tool quantities, and material specifications.

The planning model is deliberately not treated as a retrieval system:

```text
User Intake
    ↓
AI Project Planning
    ↓
Structured HowlsyProject
    ↓
Visual / Resource Requirements
    ↓
Future Enrichment and Retrieval
    ↓
Verified Rich Resources
```

The planning layer may specify that a step needs a dimensioned blueprint and describe exactly what it should show, but it must not pretend that the blueprint has already been generated.

Likewise, the planning endpoint must not fabricate product URLs, video URLs, manufacturer URLs, document URLs, citations, or verified compatibility claims.

Actual media, products, parts, technical documents, and authoritative references will be supplied by later enrichment, retrieval, generation, and verification systems. Until then, generated planning data initializes unavailable resources as empty collections.

### Persistence Migration

Existing projects in browser `localStorage` were created before the rich fields existed. Simply requiring all new fields would make previously valid development projects unreadable.

The persistence layer in:

```text
lib/project-store.ts
```

was therefore changed from a lightweight validator into a validation and migration boundary:

```text
localStorage
    ↓
JSON.parse()
    ↓
unknown runtime data
    ↓
validation
    ↓
legacy normalization
    ↓
current HowlsyProject
    ↓
save normalized shape
    ↓
application
```

Older valid steps receive safe defaults for measurements, specifications, visual instructions, resources, products, troubleshooting, and accessibility. Older projects also receive an empty `sources` collection.

The normalized project is written back to browser storage so the migration does not repeat on every read. The earlier compatibility repair for the historical API response-envelope bug remains supported.

### Build Failure

After the richer persistence normalizer was implemented, `npm run build` compiled the application but TypeScript failed with `TS2322`.

The errors affected:

```text
ProjectVisualInstruction[]
ProjectResource[]
ProjectSource[]
```

Representative failures reported that a generic `string` was not assignable to narrow unions such as:

```text
"illustration" | "diagram" | "blueprint" | "annotated_image" | "three_d"
```

Similar errors occurred for resource types and source types.

### Cause

Persisted data enters the normalizer as `unknown` and is narrowed into generic `Record<string, unknown>` records.

The first implementation correctly performed runtime comparisons against allowed values. However, the reconstructed properties were still inferred by TypeScript as generic strings rather than the required literal unions.

The runtime logic therefore knew the values were valid, while the compiler did not have enough type information to prove it.

### Fix

Dedicated TypeScript type guards were introduced:

```ts
isProjectVisualResourceType()
isProjectResourceType()
isProjectResourceVerificationStatus()
isProjectSourceType()
```

These guards communicate both runtime validity and compile-time union types.

Normalization was also separated into focused helpers:

```ts
normalizeProductReference()
normalizeResource()
normalizeVisualInstruction()
normalizeSource()
normalizeProjectStep()
normalizeProject()
```

Malformed rich collections are rejected instead of silently accepted. Missing rich collections from legitimate older projects are migrated with safe defaults.

### Verification

After the type guards and persistence normalization were completed, the production build was run again:

```bash
npm run build
```

The build completed successfully:

```text
▲ Next.js 16.3.5 (Turbopack)

Creating an optimized production build ...
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data using 10 workers
✓ Generating static pages using 10 workers (9/9)
✓ Finalizing page optimization
```

The build included the static application routes and the dynamic `/api/projects/generate` endpoint.

The engineering implementation was committed as:

```text
a06a5bb feat: establish rich project output architecture
```

### Result

Howlsy's project model is no longer limited to a sequence of text instructions.

The architecture can now evolve toward:

```text
User Goal
    ↓
Structured Project Plan
    ↓
Detailed Guided Steps
    ↓
Measurements + Specifications
    ↓
Illustrations + Diagrams + Blueprints
    ↓
Videos + Audio + Interactive Resources
    ↓
Products + Compatible Parts
    ↓
Verified Sources
    ↓
Adaptive Troubleshooting
    ↓
Accessible Guided Execution
```

The application also has a safer persistence boundary capable of migrating older project records while rejecting malformed rich data.

Most importantly, rich-output planning and rich-resource fulfillment remain separate responsibilities. The planning model can specify what a user needs without falsely claiming that external information or media has already been retrieved or verified.

### Technical Lesson

Runtime validation and TypeScript narrowing are related but separate concerns.

A runtime comparison may correctly reject invalid values while still failing to provide the compiler with enough information to infer a narrow union type. Explicit type guards allow the same validation rule to serve both runtime safety and compile-time correctness.

This milestone also reinforced a broader Howlsy design principle:

> Rich AI output should be structured around provenance and verification, not merely made more visually impressive.

As Howlsy adds retrieval and enrichment systems, distinctions between requested, generated, estimated, retrieved, unverified, and verified information should remain part of the data architecture rather than being left to UI wording alone.

---

## Development Principle

Howlsy development follows a simple rule:

> Build the application in small, verifiable milestones and preserve the reasoning behind meaningful technical decisions.

Meaningful features, fixes, and architectural changes should be:

1. implemented
2. tested
3. production-build verified when appropriate
4. committed to Git
5. documented here when the reasoning is useful

The Git history should therefore show not only what Howlsy became, but how engineering problems were identified and solved during development.