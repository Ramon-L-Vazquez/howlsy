# Howlsy Architecture

## Overview

Howlsy is an AI-guided application that turns a user's goal into a structured, actionable project.

The application separates the user interface, AI orchestration, project data, and persistent storage so each part can evolve independently.

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Next.js server routes and server-side functionality

### Database and Authentication
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

### AI
- Large language model API
- Vision-capable models for user-uploaded images
- Structured AI responses for project generation

### Deployment
- Vercel

## Application Flow

User Goal
↓
AI Intake
↓
Clarifying Questions
↓
Project Generation
↓
Structured Project Plan
↓
Guided Step Mode
↓
Progress Tracking
↓
Project Completion

## Core Data Model

### User

Represents a Howlsy account.

### Project

A goal the user wants to accomplish.

Example:

> Build a non-load-bearing wall in my basement.

A project can contain:

- title
- description
- category
- status
- difficulty
- estimated duration
- estimated cost
- safety information
- progress

### Project Step

An individual action required to complete a project.

Each step can contain:

- title
- instructions
- order
- completion status
- warnings
- images
- notes

### Material

An item consumed while completing a project.

Examples:

- lumber
- drywall
- screws
- joint compound

### Tool

Equipment needed to perform the project.

Examples:

- drill
- level
- tape measure
- saw

### Attachment

Images or files provided by the user during a project.

Attachments may be analyzed by AI to provide contextual guidance.

## AI Architecture

Howlsy should not treat every interaction as an isolated chat message.

The AI layer will transform user conversations into structured project information.

For example:

User:

> I want to put a wall in my basement.

Howlsy may determine that more information is required before generating instructions.

Questions could include:

- Where will the wall be installed?
- Is it load-bearing?
- What are the dimensions?
- Are electrical outlets required?
- Can you upload a photo of the area?

Once sufficient context exists, the AI generates a structured project.

## Safety

Howlsy may provide guidance involving tools, vehicles, electricity, construction, and other real-world activities.

The application should:

- identify potentially hazardous steps
- provide appropriate warnings
- recognize when professional assistance may be necessary
- avoid presenting uncertain information as fact
- distinguish estimates from verified measurements or requirements

## Design Principle

The interface should answer one question at every stage:

> What should I do next?

Users should not need to understand AI prompting to use Howlsy.