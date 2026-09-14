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