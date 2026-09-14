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

Howlsy currently passes temporary project information between pages using URL search parameters.

For example:

```text
/intake?goal=Build+a+wall
```

The application reads those values using the Next.js `useSearchParams()` hook.

The affected routes were:

```text
/intake
/project
/guided
```

Although these pages operated correctly through the development server, the production build applies stricter prerendering requirements.

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

Each affected route was refactored so that the component calling `useSearchParams()` is rendered inside a React `Suspense` boundary.

The structure now follows this pattern:

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

The application now successfully passes both TypeScript checking and Next.js production prerendering.

The following routes build successfully:

```text
/
/guided
/intake
/project
```

This also confirmed that the newly introduced structured project types and mock project data compile successfully.

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

### Current Architecture

The current development flow is:

```text
User Goal
    ↓
Guided Intake
    ↓
Temporary URL Parameters
    ↓
Structured Project Plan
    ↓
Guided Mode
    ↓
Project Completion
```

The URL parameter implementation is temporary.

The intended architecture will evolve toward:

```text
User Goal
    ↓
AI Intake
    ↓
Clarifying Questions
    ↓
AI Project Generation
    ↓
HowlsyProject
    ↓
Database
    ↓
Project ID
    ↓
Project View
    ↓
Guided Mode
    ↓
Saved Progress
```

This will allow project state to persist without carrying project information through the URL.

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