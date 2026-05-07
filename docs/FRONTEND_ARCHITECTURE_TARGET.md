---
description: ScrumHub Frontend Architecture — Project-Scoped Routing & Workspace Rules
globs: 
alwaysApply: true
---

# ScrumHub Frontend Architecture — Strict Adherence Required

You are an expert frontend architect. When working on the ScrumHub codebase, you MUST follow these architectural rules absolutely. Do not suggest patterns that violate these rules.

## 1. Core Architectural Philosophy

ScrumHub is NOT a generic dashboard application. It is a multi-project, multi-user, collaborative workspace platform inspired by Linear, Jira, ClickUp, and VS Code.

The application has TWO fundamentally different contexts that MUST remain separated architecturally, visually, and in routing:

1. **Workspace Selection Context** (Global)
2. **Project Workspace Context** (Scoped)

---

## 2. Application Contexts

### 2.1 Workspace Context (Global)
* **Purpose:** Browse projects, create projects, manage invitations, switch workspaces.
* **Routes:** `/app/projects`, `/app/projects/create`
* **Characteristics:** Lightweight layout. NO `AppShell`. NO `Explorer`. NO `Tabs`. NO Project Context. NO Board/Backlog state.

### 2.2 Project Workspace Context
* **Purpose:** Work inside a specific project (Board, Backlog, Sprints, AI, Tasks, Epics).
* **Routes:** `/app/projects/$projectId/dashboard`, `/app/projects/$projectId/board`, etc.
* **Characteristics:** Uses `AppShell`. Uses `Explorer`. Uses `Tabs`. Uses project-aware services. Uses project-scoped TanStack Query cache.

---

## 3. Required Route Structure

The filesystem routing MUST look exactly like this:

```text
src/routes/
├── __root.tsx
├── index.tsx
├── login.tsx
├── register.tsx
├── app/
│   ├── route.tsx            # Auth guard wrapper
│   ├── index.tsx            # Redirect to /app/projects
│   └── projects/
│       ├── index.tsx        # Workspace context (List of projects)
│       ├── create.tsx       # Workspace context
│       └── $projectId/
│           ├── route.tsx    # ⚠️ PROJECT LAYOUT & DATA FETCHING LIVES HERE
│           ├── dashboard.tsx
│           ├── board.tsx
│           ├── backlog.tsx
│           ├── calendar.tsx
│           ├── sprints.tsx
│           ├── settings.tsx
│           ├── tasks/
│           │   └── $taskId.tsx
│           ├── epics/
│           │   └── $epicId.tsx
│           └── chat/
│               ├── index.tsx
│               └── $sessionId.tsx
```

---

## 4. The 10 Absolute Laws

### Law 1: Project Context Lives in the URL
The current project MUST always be in the route (`/app/projects/123/board`). NEVER use `/app/board`. This enables deep linking, correct cache isolation, and multi-tab correctness.

### Law 2: AppShell Exists ONLY Inside Project Context
`AppShell.tsx` is highly project-aware (Explorer, Tabs, AI state). It MUST only render inside `/app/projects/$projectId/*` via `route.tsx`. The global project-selection area MUST use a lighter layout.

### Law 3: Project Fetching Happens ONCE
The project entity MUST be fetched in `src/routes/app/projects/$projectId/route.tsx`. Child routes MUST consume the project from route context. Do NOT refetch the project in dashboard, board, backlog, etc.

### Law 4: Routes Are Thin Orchestrators
Routes coordinate, compose, and inject context. Routes MUST NOT contain business logic, transformation logic, or reusable UI logic. Complex logic belongs in `src/features/*`.

### Law 5: Features Own Business Logic
Feature modules are authoritative business boundaries. Features contain hooks, services, feature components, utilities, and types.

### Law 6: `apiClient.ts` Is Infrastructure ONLY
`src/services/apiClient.ts` MUST ONLY contain: fetch wrapper, auth token injection, JSON parsing, error normalization, retry logic, base URL.
Business API methods belong inside features (e.g., `features/tasks/services/taskService.ts`).

### Law 7: TanStack Query Is the Source of Server State
Server state MUST use TanStack Query. Do NOT manually duplicate server state into Context, Zustand, or component state unless absolutely necessary.

### Law 8: Query Keys MUST Be Hierarchical
Correct: `['project', projectId, 'board']`
Incorrect: `['board']`
Reason: Guarantees cache isolation, invalidation, and optimistic updates.

### Law 9: AppShell Must Be Route-Driven
INCORRECT: `if (view === "board") return <BoardView />`
CORRECT: `<AppShell><Outlet /></AppShell>`
Views are determined by routes, not local component state.

### Law 10: Strict Component Boundaries
* **Tier 1 (UI Atoms):** `src/components/ui/` (Stateless, reusable, no business logic).
* **Tier 2 (Feature Components):** `src/features/*/components/` (Feature-aware, use feature hooks).
* **Tier 3 (Route Components):** `src/routes/*` (Thin orchestrators, connect routes to features).

---

## 5. The Mandatory Project Layout Pattern

When writing `src/routes/app/projects/$projectId/route.tsx`, you MUST use this exact pattern:

```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import { projectQuery } from '@/features/projects/api' // Example feature location

export const Route = createFileRoute('/app/projects/$projectId')({
  // 1. Loader for essential preloading
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData(projectQuery(params.projectId))
  },
  component: ProjectLayout,
})

function ProjectLayout() {
  // 2. AppShell wraps the outlet
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
```

---

## 6. Data Fetching Strategy

* **Use `loader` (in route) for:** Route preloading, permissions, essential layout data (like the Project entity itself).
* **Use TanStack Query hooks (in features) for:** Board data, tasks, sprints, chat sessions, comments, activity.

---

## 7. Anti-Patterns (FORBIDDEN)

If you see these, point them out and refuse to write them:
* ❌ Global project state without URL representation
* ❌ Refetching the project entity in every child route
* ❌ Business logic inside route files
* ❌ Massive `AppShell` conditionals checking the current view
* ❌ Flat `/app/dashboard` routing for project-specific data
* ❌ Features cross-importing internal files from other features
* ❌ Global service sprawl (putting task APIs in global services)

---

## 8. Final Goal

ScrumHub is Route-driven, Project-scoped, Context-isolated, Realtime-ready, Feature-first, Query-centric, and IDE-inspired. The route tree itself is the primary source of application context.