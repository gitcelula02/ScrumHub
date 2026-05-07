# ScrumHub — Frontend Migration Plan
## Route-Driven, Project-Scoped Architecture Upgrade

> **For AI Agents:** This document is the canonical migration plan. Read it fully before touching any file. Each phase must be completed and verified before proceeding to the next. This plan is derived from `TRUTH.md`, `FRONTEND_ARCHITECTURE.md`, and the target architecture defined in `FRONTEND_ARCHITECTURE_TARGET.md` (the new rules document). When there is any conflict, defer to `TRUTH.md`.

---

## Executive Summary

The current codebase has a mostly correct feature-first structure but has a critical architectural flaw: **`AppShell` is state-driven, not route-driven.** Navigation between views (Board, Backlog, Calendar, etc.) is controlled by local component state inside `AppShell`, instead of by the URL and TanStack Router's route tree. This causes multiple cascading problems:

- No deep linking — users cannot bookmark a specific board or backlog view
- No multi-tab correctness — two browser tabs on the same project share the same in-memory state
- No project-scoped cache isolation — query keys are flat and conflict across projects
- `AppShell` is a god component that must be modified every time a new view is added
- Project data is refetched in every child route rather than fetched once in a layout route
- Auth guard uses a render-then-redirect pattern instead of TanStack Router's `beforeLoad`

This migration eliminates all of these issues by restructuring the route tree around a `$projectId` layout route that owns `AppShell`, project data fetching, and context.

---

## Pre-Migration Checklist

Before starting any phase, the agent must verify the following:

- [ ] Run `npm run build` and confirm it compiles (even with known errors noted in `FRONTEND_ARCHITECTURE.md`)
- [ ] Read `src/routes/app.tsx` fully — understand the current AuthGuard pattern
- [ ] Read `src/components/layout/AppShell.tsx` fully — understand all current state, conditionals, and imports
- [ ] Read `src/router.tsx` fully — understand the router factory and type registration
- [ ] Note the broken `PropertiesPanel` import in `AppShell.tsx` (Known Issue #1 in `FRONTEND_ARCHITECTURE.md`) — this must be fixed in Phase 1 before restructuring AppShell
- [ ] Confirm TanStack Router version in `package.json` — the `route.tsx` layout file pattern requires v1.x (file-based routing with layout routes)

---

## Phase 0 — Fix Blockers (Do First, No Architecture Changes)

**Goal:** Get the codebase to a clean compile with zero known broken imports, before any structural work begins.

### Task 0.1 — Fix the `PropertiesPanel` broken import

**File:** `src/features/tasks/components/PropertiesPanel.tsx` (create)
**File:** `src/features/tasks/index.ts` (update export)

Create a minimal `PropertiesPanel` component that renders a placeholder `<div>` with the text "Properties Panel". Export it from the feature's `index.ts` barrel. The goal is not to implement it fully — just to unblock compilation.

**Verification:** `npm run build` produces no import errors related to `PropertiesPanel`.

### Task 0.2 — Add barrel export for `src/components/layout/`

**File:** `src/components/layout/index.ts` (create)

Export all layout components (`AppShell`, `ActivityBar`, `TitleBar`, `StatusBar`, `MobileMenu`) from a single `index.ts`. This is noted as missing in Known Issue #5. Needed so future refactoring imports are consistent.

### Task 0.3 — Remove `Sidebar.tsx` and `TopBar.tsx` if truly unused

**Files:** `src/components/layout/Sidebar.tsx`, `src/components/layout/TopBar.tsx`

Confirm via grep/search that nothing imports these files. If confirmed unused, delete them. If any file imports them, note but do not delete — handle in a later phase.

**Verification:** `npm run build` still passes after deletion.

---

## Phase 1 — Migrate Auth Guard to `beforeLoad`

**Goal:** Replace the render-then-redirect `AuthGuard` pattern with TanStack Router's `beforeLoad` on the `/app` route. This is a prerequisite for passing context through the router, which is required for the project layout route in Phase 2.

**Target pattern (from Known Issue #6 in `FRONTEND_ARCHITECTURE.md`):**

```tsx
// src/routes/app.tsx
export const Route = createFileRoute("/app")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AppShellLayout, // thin wrapper, explained in Phase 3
});
```

### Task 1.1 — Pass auth context into router

**File:** `src/router.tsx`

Pass the `AuthContext` value into the router's `context` option when creating the router instance:

```ts
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // will be hydrated by the root route
    queryClient,
  },
  ...
});
```

**File:** `src/routes/__root.tsx`

In the root route's component, read the auth context and pass it to the router context using `RouterProvider`'s `context` prop (or TanStack Router's `router.update()` pattern depending on exact version). Consult the installed TanStack Router version's docs for the exact API.

**File:** `src/types/index.ts` (or a new `src/types/router.ts`)

Define the `RouterContext` interface:

```ts
export interface RouterContext {
  auth: AuthContextValue;
  queryClient: QueryClient;
}
```

Register this type with TanStack Router's module augmentation in `router.tsx`.

### Task 1.2 — Replace `useAuthGuard` hook with `beforeLoad` in `/app` route

**File:** `src/routes/app.tsx`

Remove the `useAuthGuard()` call from the component. Add `beforeLoad` as shown above. The component body becomes a pure layout wrapper (see Phase 3 for the full AppShell change).

**File:** `src/hooks/useAuthGuard.ts`

Do not delete yet — other components may use it. Mark it as `@deprecated` with a comment pointing to the `beforeLoad` pattern. Delete only after confirming no other consumers.

**Verification:** Navigate to `/app/anything` while logged out — browser should redirect to `/login?redirect=/app/anything`. No flash of protected content before redirect.

---

## Phase 2 — Create the Project Layout Route

**Goal:** Create `src/routes/app/projects/$projectId/route.tsx` as the authoritative layout and data-fetching boundary for all project-scoped views. This is the most important architectural change in this entire migration.

### Task 2.1 — Create the directory structure

Create the following directory and files (empty stubs for now):

```
src/routes/app/projects/
├── index.tsx          (Workspace context — list of projects)
├── create.tsx         (Workspace context — create project form)
└── $projectId/
    └── route.tsx      (Project layout — to be filled in Task 2.2)
```

Note: If `/app/projects/` or similar routes already exist under `/app/dashboard`, reconcile carefully. Do not delete existing working routes — add alongside them and migrate incrementally.

### Task 2.2 — Implement `$projectId/route.tsx`

This file must follow the Mandatory Project Layout Pattern exactly:

```tsx
// src/routes/app/projects/$projectId/route.tsx

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { projectQuery } from "@/features/projects/api"; // see Task 2.3

export const Route = createFileRoute("/app/projects/$projectId")({
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData(projectQuery(params.projectId));
  },
  component: ProjectLayout,
});

function ProjectLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
```

**Critical rules for this file:**
- `AppShell` MUST only render here and nowhere else in the route tree
- The `loader` calls `ensureQueryData` — this preloads the project into the TanStack Query cache before any child route renders
- The component is a pure layout — no business logic, no conditionals, no state

### Task 2.3 — Create `projectQuery` factory in the projects feature

**File:** `src/features/projects/api.ts` (create if it doesn't exist)

```ts
import { queryOptions } from "@tanstack/react-query";
import { projectService } from "./services/projectService";

export const projectQuery = (projectId: string) =>
  queryOptions({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getById(projectId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
```

If `projectService.getById` does not exist yet, create a stub that returns a mock project object. The shape must match the `Project` type in `src/types/index.ts`.

### Task 2.4 — Expose `queryClient` via router context

Confirm that the `queryClient` created in `src/routes/__root.tsx` is passed through router context (set up in Phase 1, Task 1.1). The `loader` in `route.tsx` depends on `context.queryClient` being available. If this was not done in Phase 1, do it now.

**Verification:** Add a `console.log` in the `ProjectLayout` component. Navigate to `/app/projects/test-id/dashboard` (even if the child route doesn't exist yet). Confirm the layout renders and the loader ran (check Network tab for project API call or cache hit).

---

## Phase 3 — Decouple `AppShell` from View State

**Goal:** Remove all view-switching state and conditional rendering from `AppShell`. It must become a pure layout shell that renders structural chrome (ActivityBar, TitleBar, Explorer, Tabs, StatusBar) around `<Outlet />`.

### Task 3.1 — Audit `AppShell` state

Read `AppShell.tsx` and catalog every piece of state:

- What `useState` variables exist? (likely something like `activeView`, `currentProjectId`, etc.)
- What conditional rendering depends on that state? (e.g., `if (activeView === "board") return <BoardView />`)
- What events or callbacks trigger state changes? (ActivityBar clicks, Explorer selections, etc.)

Document this audit as a comment block at the top of the file before changing anything.

### Task 3.2 — Replace view-switching with `<Outlet />`

Remove the conditional view-rendering block from `AppShell`. Replace it with `<Outlet />`. The correct child route file (board, backlog, etc.) will now control what renders in that slot.

**Before (approximate):**
```tsx
// WRONG — state-driven view
{activeView === "board" && <BoardView projectId={currentProjectId} />}
{activeView === "backlog" && <BacklogView projectId={currentProjectId} />}
```

**After:**
```tsx
// CORRECT — route-driven view
<Outlet />
```

### Task 3.3 — Migrate ActivityBar navigation to `useNavigate`

Every click in `ActivityBar` that previously called `setActiveView("board")` must now call TanStack Router's `useNavigate`:

```tsx
import { useNavigate, useParams } from "@tanstack/react-router";

function ActivityBar() {
  const navigate = useNavigate();
  const { projectId } = useParams({ from: "/app/projects/$projectId" });

  return (
    <nav>
      <button onClick={() => navigate({ to: "/app/projects/$projectId/board", params: { projectId } })}>
        Board
      </button>
      {/* ... */}
    </nav>
  );
}
```

Use `useMatchRoute` or `useRouterState` to highlight the active icon (replace any `activeView === "board"` checks for highlighting).

### Task 3.4 — Remove `currentProjectId` state from `AppShell`

`AppShell` must not store the current project ID in state. The project ID lives in the URL. Any child component that needs the project ID must read it via:

```tsx
const { projectId } = useParams({ from: "/app/projects/$projectId" });
```

Any component that needs the project data must read it from the TanStack Query cache using `projectQuery`:

```tsx
import { useQuery } from "@tanstack/react-query";
import { projectQuery } from "@/features/projects/api";
import { useParams } from "@tanstack/react-router";

function SomeShellComponent() {
  const { projectId } = useParams({ from: "/app/projects/$projectId" });
  const { data: project } = useQuery(projectQuery(projectId));
  // project is guaranteed to be in cache — the loader preloaded it
}
```

**Verification:** The `AppShell` component should have zero `useState` calls that relate to which view is currently visible or which project is selected. It may still have UI-only state (e.g., explorer panel collapsed/expanded).

---

## Phase 4 — Create Project-Scoped Child Routes

**Goal:** Create one route file per major view inside `$projectId/`. Each route is a thin orchestrator that delegates to feature modules.

### Task 4.1 — Create the route files

Create these files (stubs first, then implement):

```
src/routes/app/projects/$projectId/
├── route.tsx           ← already done in Phase 2
├── dashboard.tsx       → /app/projects/$projectId/dashboard
├── board.tsx           → /app/projects/$projectId/board
├── backlog.tsx         → /app/projects/$projectId/backlog
├── calendar.tsx        → /app/projects/$projectId/calendar
├── sprints.tsx         → /app/projects/$projectId/sprints
├── settings.tsx        → /app/projects/$projectId/settings
├── tasks/
│   └── $taskId.tsx     → /app/projects/$projectId/tasks/$taskId
├── epics/
│   └── $epicId.tsx     → /app/projects/$projectId/epics/$epicId
└── chat/
    ├── index.tsx        → /app/projects/$projectId/chat
    └── $sessionId.tsx  → /app/projects/$projectId/chat/$sessionId
```

### Task 4.2 — Implement each route file using the Thin Route Pattern

Each file must follow this exact pattern:

```tsx
// src/routes/app/projects/$projectId/board.tsx

import { createFileRoute } from "@tanstack/react-router";
import { BoardPage } from "@/pages/BoardPage";

export const Route = createFileRoute("/app/projects/$projectId/board")({
  component: BoardPage,
});
```

And the corresponding page:

```tsx
// src/pages/BoardPage.tsx

import { useParams } from "@tanstack/react-router";
import { useBoard } from "@/features/board/hooks/useBoard";
import { BoardView } from "@/features/board/components/BoardView";

export function BoardPage() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/board" });
  const { columns, tasks, isLoading } = useBoard(projectId);
  return <BoardView columns={columns} tasks={tasks} isLoading={isLoading} />;
}
```

**Rules:**
- Pages extract params, call one or more feature hooks, render feature components
- Pages contain ZERO business logic
- Pages do NOT refetch the project entity — it's already in cache from the layout loader
- Feature hooks use hierarchical query keys: `["project", projectId, "board"]` not `["board"]`

### Task 4.3 — Enforce hierarchical query keys across all features

Search the entire codebase for `useQuery`, `useMutation`, and `queryKey` usage. Every query key that relates to project-scoped data must include `projectId` as the second element:

| Wrong | Correct |
|-------|---------|
| `["board"]` | `["project", projectId, "board"]` |
| `["tasks"]` | `["project", projectId, "tasks"]` |
| `["sprints"]` | `["project", projectId, "sprints"]` |
| `["backlog"]` | `["project", projectId, "backlog"]` |

This is Law 8 from the target architecture and is non-negotiable. It ensures that switching between projects invalidates the correct cache entries and prevents stale data bleedover.

### Task 4.4 — Migrate existing feature views into route-driven pattern

For each view that currently exists inside `AppShell` as a conditionally rendered component (`EpicsView`, `PermissionsView`, `BoardView`, `BacklogView`), move it to its proper route. This is incremental:

1. Create the route file
2. Create the page file
3. Move the render call out of `AppShell` and into the page
4. Delete the conditional check from `AppShell`
5. Update ActivityBar click handler to navigate to the route instead of setting state

Repeat until `AppShell` has no conditional view rendering at all.

---

## Phase 5 — Migrate Workspace Context Routes

**Goal:** Create proper workspace-level routes (`/app/projects` and `/app/projects/create`) that use a lighter layout — NO `AppShell`, NO Explorer, NO project context.

### Task 5.1 — Create workspace layout route

**File:** `src/routes/app/projects/index.tsx`

This route must NOT use `AppShell`. It should use a lighter layout component (create `WorkspaceShell` if needed, or render inline with a simple top bar and centered content). This is the project selection/listing screen.

### Task 5.2 — Create project creation route

**File:** `src/routes/app/projects/create.tsx`

Same lightweight layout. No project context (there's no `$projectId` yet).

### Task 5.3 — Set up `/app` index redirect

**File:** `src/routes/app/index.tsx`

Add a redirect so `/app` (with no path after it) goes to `/app/projects`:

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  beforeLoad: () => {
    throw redirect({ to: "/app/projects" });
  },
});
```

---

## Phase 6 — Clean Up and Enforce Architecture

**Goal:** Remove all remnants of the old state-driven pattern, update documentation, and add ESLint rules to prevent regression.

### Task 6.1 — Delete or stub-out old state-driven navigation

Remove any remaining `activeView` state, view-switch functions, or conditional render blocks that were not cleaned up during Phases 3 and 4.

### Task 6.2 — Verify `apiClient.ts` is infrastructure-only

Confirm `src/services/apiClient.ts` contains only: fetch/axios wrapper, auth token injection, base URL, JSON parsing, error normalization, and retry logic. No business API methods (no `getTasks()`, no `getBoard()`). These must live inside their respective features' `services/` directories.

If violations exist, move them now.

### Task 6.3 — Update `TRUTH.md`

Update the "Structure" section of `TRUTH.md` to reflect the new route tree. Replace the old `app.tsx → dashboard.tsx` tree with the full `$projectId/route.tsx` structure from Phase 4. Note the date of migration.

### Task 6.4 — Update `FRONTEND_ARCHITECTURE.md`

Replace Section 15 ("TanStack Router Scalability Guide") with the realized route structure. Remove the "Known Issues" that have been resolved. Update the Directory Structure diagram.

### Task 6.5 — Add ESLint rules (optional but recommended)

If ESLint is configured, add or confirm these rules are active:
- No cross-feature internal imports (features must only import from each other's `index.ts`)
- No `AppShell` import outside of `$projectId/route.tsx`
- TanStack Query `queryKey` arrays must have at least 2 elements when used inside feature hooks (prevents flat keys like `["board"]`)

---

## Anti-Pattern Reference

The agent must refuse to write or accept these patterns at any point during migration:

| Pattern | Why It's Wrong | What To Do Instead |
|---|---|---|
| `const [activeView, setActiveView] = useState("board")` in AppShell | State-driven navigation breaks deep links and multi-tab | Use `useNavigate` + route files |
| `if (activeView === "board") return <BoardView />` | AppShell should never know which view is active | Move to route file, use `<Outlet />` |
| `const [projectId, setProjectId] = useState(null)` in AppShell | Project ID must live in the URL | Read from `useParams` |
| Calling `projectService.getById()` inside `useBoard`, `useBacklog`, etc. | Project fetched N times per navigation | Fetch once in `route.tsx` loader |
| `queryKey: ["tasks"]` | Cache pollution across projects | `queryKey: ["project", projectId, "tasks"]` |
| `AppShell` rendered in any route other than `$projectId/route.tsx` | AppShell is project-aware and must not exist outside project context | Use a lighter layout for workspace routes |
| Business logic inside `src/routes/` files | Routes are orchestrators, not feature owners | Move to `src/features/[name]/` |
| `import { useBoard } from "@/features/board/hooks/useBoard"` inside another feature's internal file | Cross-feature internal imports | Import from `@/features/board` (barrel export only) |

---

## Verification Checklist (Run After All Phases)

- [ ] `npm run build` completes with zero errors
- [ ] Navigating to `/app/projects/123/board` renders the Board view inside AppShell
- [ ] Navigating to `/app/projects/456/board` renders the Board for project 456 (not 123)
- [ ] Opening two tabs — one on project 123 board, one on project 456 backlog — each shows independent data
- [ ] Refreshing the page on `/app/projects/123/board` stays on the board (not redirected to dashboard)
- [ ] Navigating to `/app/projects` shows the workspace list with NO AppShell visible
- [ ] Network tab shows project entity fetched once per project navigation, not on every sub-route change
- [ ] Query keys in Redux/React Query Devtools all include `["project", projectId, ...]` structure
- [ ] `AppShell.tsx` has zero conditional view-switching logic
- [ ] `app.tsx` uses `beforeLoad` for auth guard, not `useEffect` + `useNavigate`

---

## File Change Summary

| File | Action |
|------|--------|
| `src/routes/app.tsx` | Modify — add `beforeLoad` auth guard, remove `AuthGuard` component pattern |
| `src/routes/app/projects/index.tsx` | Create — workspace project list (no AppShell) |
| `src/routes/app/projects/create.tsx` | Create — project creation (no AppShell) |
| `src/routes/app/projects/$projectId/route.tsx` | Create — project layout with loader + AppShell |
| `src/routes/app/projects/$projectId/dashboard.tsx` | Create — thin route |
| `src/routes/app/projects/$projectId/board.tsx` | Create — thin route |
| `src/routes/app/projects/$projectId/backlog.tsx` | Create — thin route |
| `src/routes/app/projects/$projectId/calendar.tsx` | Create — thin route |
| `src/routes/app/projects/$projectId/sprints.tsx` | Create — thin route |
| `src/routes/app/projects/$projectId/settings.tsx` | Create — thin route |
| `src/routes/app/projects/$projectId/tasks/$taskId.tsx` | Create — thin route |
| `src/routes/app/projects/$projectId/epics/$epicId.tsx` | Create — thin route |
| `src/routes/app/projects/$projectId/chat/index.tsx` | Create — thin route |
| `src/routes/app/projects/$projectId/chat/$sessionId.tsx` | Create — thin route |
| `src/components/layout/AppShell.tsx` | Modify — remove view-state, add `<Outlet />` |
| `src/components/layout/ActivityBar.tsx` | Modify — replace state callbacks with `useNavigate` |
| `src/components/layout/index.ts` | Create — barrel export |
| `src/features/projects/api.ts` | Create — `projectQuery` factory |
| `src/features/tasks/components/PropertiesPanel.tsx` | Create — stub to fix broken import |
| `src/router.tsx` | Modify — pass auth + queryClient via router context |
| `src/routes/__root.tsx` | Modify — hydrate router context with auth |
| `src/types/index.ts` | Modify — add `RouterContext` interface |
| `src/hooks/useAuthGuard.ts` | Deprecate — mark and eventually delete |
| `TRUTH.md` | Update — new route tree, migration completion date |
| `FRONTEND_ARCHITECTURE.md` | Update — replace Known Issues with resolved status, update directory map |

---

*Migration plan authored: 2026-05-07*
*Based on: `TRUTH.md`, `FRONTEND_ARCHITECTURE.md`, and target architecture specification*
*For questions or blockers, refer first to `TRUTH.md` as the source of truth*
