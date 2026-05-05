# ScrumHub Frontend Architecture

## Overview

This document describes the complete file structure, purpose, and architectural patterns of the ScrumHub frontend. It is designed to serve as a comprehensive reference for any AI agent or developer joining the project — covering **what each file does**, **why it exists**, and **where to go to extend or fix it**.

---

## Table of Contents

1. [Architecture Principles](#1-architecture-principles)
2. [Directory Structure](#2-directory-structure)
3. [Entry Points](#3-entry-points)
4. [Global Services Layer](#4-global-services-layer)
5. [Global State (Store)](#5-global-state-store)
6. [Global Hooks](#6-global-hooks)
7. [Feature Modules](#7-feature-modules)
8. [Shared UI Components](#8-shared-ui-components)
9. [Styles & Theming](#9-styles--theming)
10. [Utils](#10-utils)
11. [Pages (Route Targets)](#11-pages-route-targets)
12. [Design System](#12-design-system)
13. [Adding New Features](#13-adding-new-features)
14. [Key Conventions](#14-key-conventions)
15. [Common Patterns](#15-common-patterns)
16. [Assets Management](#16-assets-management)

---

## 1. Architecture Principles

ScrumHub follows a **Feature-First Architecture** with strict boundaries:

| Rule | Description |
|------|-------------|
| **Feature Ownership** | Code belonging to a business domain stays in `src/features/[domain]/` |
| **Shared Utility** | Cross-cutting code (API client, auth state, layout) lives at `src/` root |
| **Single Responsibility** | Each file does one thing: services fetch data, hooks manage state, components render |
| **Dependency Direction** | Pages depend on Hooks depend on Services. Components are leaf nodes |
| **No UI in Services** | Services return raw data — never import React or write JSX |
| **No State in Components** | Components receive props; state lives in hooks or context |

---

## 2. Directory Structure

```
frontend/
├── public/                          # STATIC ASSETS — served at root / (favicon, robots.txt, etc)
│   ├── favicon.ico
│   └── images/                      # Static images (landing page, etc)
├── src/
│   ├── assets/                      # BUNDLED ASSETS — imported in components (icons, logos)
│   ├── routes/__root.tsx            # ROOT COMPONENT — providers + HTML shell + root outlet
│   ├── client.tsx                   # Entry point — mounts StartClient to #root
├── components/                      # SHARED UI — used by multiple features
│   ├── AIAssistantButton.tsx        # Fixed-position AI chat trigger
│   ├── layout/                      # Structural components (AppShell, Sidebar, TopBar, MobileMenu)
│   │   ├── AppShell.tsx             # Authenticated layout wrapper (Sidebar + TopBar + Outlet)
│   │   ├── Sidebar.tsx              # Project navigation tree in sidebar
│   │   ├── TopBar.tsx               # Top header with search bar
│   │   └── MobileMenu.tsx           # Full-screen mobile overlay nav
│   └── ui/                          # Atomic reusable UI elements
│       ├── EpicBadge.tsx            # Colored epic pill with dynamic theme
│       ├── SprintPill.tsx           # Colored sprint pill with dynamic theme
│       ├── StatusBadge.tsx          # Semantic status + priority tags (todo/in_progress/done/etc)
│       ├── ColorPickerSwatch.tsx    # Color selection swatch grid
│       └── index.ts                 # Barrel export
├── features/                        # FEATURE MODULES — each is self-contained
│   ├── auth/                        # Authentication
│   ├── backlog/                     # Backlog management (epics + tasks)
│   ├── board/                       # Kanban board
│   ├── calendar/                    # Calendar view
│   ├── chat/                        # Project chat
│   ├── overview/                    # Project dashboard / stats
│   ├── projects/                    # Project management
│   ├── settings/                    # User + project settings
│   ├── sprints/                     # Sprint management
│   ├── tasks/                       # Task management
│   ├── quest-tree/                  # Quest tree view
│   ├── ai/                          # AI assistant features
│   └── workspace/                   # Visual workspace canvas
├── services/                        # GLOBAL API CLIENT only
│   └── apiClient.ts                 # Central fetch wrapper
├── hooks/                           # GLOBAL HOOKS (useAuthGuard, useAuthRedirect, useEntityTheme)
├── store/                           # GLOBAL STATE (AuthContext, ThemeRegistry + their hooks)
├── styles/                          # GLOBAL STYLES (CSS variables, Tailwind config)
├── utils/                           # PURE UTILITIES (color math — no React, no side effects)
└── pages/                           # ROUTE TARGETS — thin wrappers that compose hooks + features
    ├── LandingPage.tsx              # Public landing page
    ├── LoginPage.tsx                # Login form
    ├── RegisterPage.tsx             # Registration form
    ├── ProjectListPage.tsx          # Projects dashboard
    ├── ProjectCreatePage.tsx        # New project form
    ├── ProjectPage.tsx              # Project detail (redirects to overview)
    ├── BacklogPage.tsx              # Backlog view
    ├── BoardPage.tsx                # Kanban board page
    ├── SprintPage.tsx               # Sprint planning
    ├── CalendarPage.tsx             # Calendar view
    ├── ChatPage.tsx                 # Chat view
    ├── WorkspacePage.tsx            # Workspace canvas
    ├── SettingsPage.tsx             # Settings
    └── NotFound.tsx                 # 404
```

---

## 3. Entry Points

### `src/client.tsx`

**Purpose:** The single DOM entry point for the browser. It hydrates or renders the `<StartClient />` component, which initializes the TanStack Router.

**Responsibilities:**
- Bootstraps the application on the client-side.
- Handles hydration for SSR-compatible routes.
- Connects the React root to the DOM element with ID `root`.

---

### `src/routes/__root.tsx`

**Purpose:** The single React root component for the entire application. In TanStack Router, this file defines the HTML shell (`<html>`, `<head>`, `<body>`) and the global provider tree.

**Responsibilities:**
1. Declares all `Provider` wrappers (QueryClientProvider, AuthProvider).
2. Defines the global `<head>` content (Meta tags, title, stylesheets).
3. Renders the `<Outlet />` for all sub-routes.
4. Handles the 404 (Not Found) and global error states.

**Provider order (outermost to innermost):**
```
QueryClientProvider → AuthProvider → Router Outlet
```

**What to change here:**
- Adding a new global context provider.
- Modifying meta tags or the application title.
- Adjusting the base HTML/Body structure.

**Route structure:**
```
/                       → LandingPage (public)
/login                  → LoginPage (public)
/register               → RegisterPage (public)

<AppShell> (authenticated wrapper):
  /projects             → ProjectListPage
  /projects/new         → ProjectCreatePage
  /projects/:projectId  → ProjectPage
  /projects/:projectId/backlog   → BacklogPage
  /projects/:projectId/board     → BoardPage
  /projects/:projectId/sprints   → SprintPage
  /projects/:projectId/calendar  → CalendarPage
  /projects/:projectId/chat      → ChatPage
  /projects/:projectId/workspace → WorkspacePage
  /projects/:projectId/settings  → SettingsPage
  /settings              → SettingsPage (user settings, no project)

*                      → NotFound
```

**What to change here:**
- Adding a new route
- Adding/removing providers
- Restructuring which routes use AppShell

---

## 4. Global Services Layer

### `src/services/apiClient.ts`

**Purpose:** The **single fetch wrapper** used by ALL feature services. All API calls go through here — no raw `fetch()` anywhere else in the codebase.

**Responsibilities:**
- Base URL from `import.meta.env.VITE_API_URL` (defaults to `http://localhost:3000/api`)
- JSON serialization/deserialization
- Consistent error shape: `Error` with `{ message, status, data }`
- HTTP methods: `get`, `post`, `patch`, `put`, `delete`

**Why this matters:** If you need to switch from `fetch` to `axios` (or add interceptors, retries, etc), you change only this file. Every service file is unaffected.

**How to use:**
```ts
import { apiClient } from '@/services/apiClient';
const user = await apiClient.get('/auth/me');
const project = await apiClient.post('/projects', { name: 'My Project', color: '#6B5CFF' });
```

**What to change here:**
- Switching HTTP library
- Adding auth token injection (already handled via `credentials: 'include'`)
- Adding retry logic
- Adding request/response logging

---

## 5. Global State (Store)

### `src/store/AuthContext.tsx`

**Purpose:** Provides authenticated user state and auth actions app-wide. Restores session on mount by calling `authService.getCurrentUser()`.

**Exposes:** `{ user, login, logout, authLoading }`

**Behavior:**
- On mount: fetches current user, stores in state
- On 401 error: clears user
- `login()`: calls `authService.login()`, stores result
- `logout()`: calls `authService.logout()`, clears localStorage token and state

**What to change here:**
- Changing how tokens are stored (currently `localStorage` + `credentials: 'include'`)
- Adding refresh token logic
- Adding role/permission checks

---

### `src/store/useAuth.ts`

**Purpose:** Hook to access `AuthContext`. Throws if used outside `<AuthProvider>`.

```ts
const { user, login, logout, authLoading } = useAuth();
```

---

### `src/store/ThemeRegistry.tsx` + `src/store/useThemeRegistry.ts`

**Purpose:** A global memoized cache that maps `entityId → computed CSS variable set`.

**Why it exists:** The same epic/project color renders in the sidebar nav, backlog table, kanban cards, sprint headers, and multiple task cards simultaneously. Without a registry, each component independently recalculates the color math on every render.

**How it works:**
1. Feature hooks call `registerEntities([{ id, color }])` after fetching data from the API
2. `ThemeRegistry` computes and caches the full CSS variable set (`--entity-bg`, `--entity-fg`, `--entity-border`, `--entity-solid`) per entityId
3. Any component can call `getTheme(entityId)` to get the ready-to-spread style object

**What to change here:**
- Adding new CSS variable outputs from color math
- Adjusting the color algorithm (see `src/utils/themeUtils.ts`)

---

## 6. Global Hooks

### `src/hooks/useAuthGuard.ts`

**Purpose:** Redirects unauthenticated users to `/login`. Used in `AppShell` and any protected route wrapper.

```ts
useAuthGuard(); // defaults to redirecting to /login
useAuthGuard('/custom-redirect');
```

**Behavior:** Navigates after `authLoading` completes and `user` is null.

---

### `src/hooks/useAuthRedirect.ts`

**Purpose:** Redirects **authenticated** users away from public pages (Landing, Login, Register) to `/projects`.

```ts
useAuthRedirect(); // defaults to /projects
useAuthRedirect('/some-other-path');
```

---

### `src/hooks/useEntityTheme.ts`

**Purpose:** Converts a runtime hex color (from an epic, sprint, or project) into a scoped inline `style` object with CSS variables.

**Input:** A hex color string (e.g., `"#3B6D11"`) or `null`/`undefined`

**Output:** A `React.CSSProperties` object:
```ts
{
  '--entity-bg': 'rgba(59, 109, 17, 0.12)',
  '--entity-fg': '#ffffff',
  '--entity-border': 'rgba(59, 109, 17, 0.45)',
  '--entity-solid': '#3B6D11'
}
```

**How components use it:**
```tsx
function EpicBadge({ epic }: { epic: Epic }) {
  const theme = useEntityTheme(epic?.color); // compute once
  return <span className="entity-badge" style={theme}>{epic.name}</span>;
}
```

**Architecture note:** This hook is the **only** place that knows about the hex → CSS variable mapping. UI components are completely color-agnostic — they only reference `var(--entity-*)` in CSS.

**What to change here:** You likely won't need to. The CSS variable names and the color math algorithm are in `src/utils/themeUtils.ts`.

---

## 7. Feature Modules

Each feature follows an identical internal structure:
```
features/[feature-name]/
├── components/          # Feature-specific UI (NOT shared outside this feature)
│   ├── *.tsx
│   └── index.ts         # Optional barrel export
├── hooks/               # Feature-specific state + side effects
│   ├── *.ts
│   └── index.ts         # Optional barrel export
├── services/            # Feature-specific API calls
│   ├── *.ts
│   └── index.ts         # Optional barrel export
├── types/               # Feature-specific TypeScript types
│   └── *.ts
├── utils/               # Feature-specific utilities
│   └── *.ts
├── styles/              # Feature-specific styles
│   └── *.css
└── index.ts             # Optional — re-exports for cleaner imports
```

---

### `features/auth/`

**Files:**
- `services/authService.ts`

**What it does:** API calls for authentication: `login`, `register`, `logout`, `getCurrentUser`.

**Response shape:**
```ts
User: { id, name, email, avatarUrl?, role? }
```

**Missing:** No `components/`, `hooks/`, or `pages/` — auth pages (Login, Register) currently live at `src/pages/`. This is a deviation from the feature-first principle.

**To improve:** Move LoginPage/RegisterPage into `features/auth/pages/`.

---

### `features/backlog/`

**Files:**
- `components/BacklogTable.tsx` — Renders epics as expandable rows with tasks
- `hooks/useBacklog.ts` — Fetches epics with tasks, registers epic colors to ThemeRegistry
- `services/backlogService.ts` — API: `getEpicsWithTasks`, `createEpic`, `updateEpic`, `createTask`, `updateTask`
- `types/backlogTypes.ts` — TypeScript types for backlog entities
- `index.ts` — Re-exports

**Hook contract:**
```ts
const { epics, loading, error, is404, refetch } = useBacklog(projectId);
```

**Service contract:**
```ts
Epic: { id, name, color, status, startDate, endDate, tasks[] }
Task: { id, title, status, priority, assignee, dueDate, epicId, sprintId }
```

**Missing:** No `pages/` — the page lives at `src/pages/BacklogPage.tsx`.

---

### `features/board/`

**Files:**
- `components/BoardView.tsx` — Kanban board with drag-and-drop columns
- `components/ManageBoardsModal.tsx` — Modal for managing custom board columns
- `hooks/useBoard.ts` — Fetches tasks, groups by status, handles moveTask optimistic updates
- `services/boardService.ts` — API: `getTasksByProject`, `updateTaskStatus`, `createTask`

**Hook contract:**
```ts
const { columns, loading, error, moveTask, refetch, allTasks } = useBoard(projectId, {
  sprintId,     // filter by sprint
  userIds,      // filter by assignees
  customBoards  // custom column definitions
});
```

**Columns shape:** `{ [status]: Task[] }` where status is one of `todo | in_progress | in_review | done | blocked`.

**Design note:** Task cards show an epic color bar at the top using `useEntityTheme` for the epic color.

---

### `features/calendar/`

**Files:**
- `components/CalendarView.tsx` — Monthly calendar grid
- `hooks/useCalendar.ts` — Fetches tasks, indexes by `dueDate` (YYYY-MM-DD)
- `services/calendarService.ts` — API: `getTasksForCalendar`, `createTask`

**Hook contract:**
```ts
const { tasksByDate, year, month, prevMonth, nextMonth, loading, error, refetch } = useCalendar(projectId);
// tasksByDate: { '2025-04-15': [task, task], ... }
```

**Current limitation:** Backend doesn't support `?month=&year=` filtering — all tasks fetched and filtered client-side.

---

### `features/chat/`

**Files:**
- `components/ChatLayout.tsx` — Full-width chat with sliding members sidebar
- `hooks/useChat.ts` — Chat state and messaging logic
- `services/chatService.ts` — API calls for messages and channels

**Status:** Uses mock data for messages and members. Basic API integration in progress.

**What it does:**
- Dark-themed chat UI (matches sidebar aesthetic)
- Sliding "Online Members" panel from the right
- Mock AI message (ScrumHub AI)
- Message input (non-functional — no WebSocket or API)

**To improve:** Complete `useChat.ts` and `chatService.ts`, implement WebSocket for real-time messaging.

---

### `features/overview/`

**Files:**
- `components/OverviewView.tsx` — Project dashboard with stats, velocity chart, workload
- `hooks/useOverview.ts` — Fetches 9 data points in parallel via `Promise.all`
- `services/overviewService.ts` — API + extensive mock data fallback

**Hook contract:**
```ts
const {
  loading, error, stats, velocityData, teamWorkload, overdueTasks,
  upcomingDeadlines, recentActivity, chatNotifications, nextDaily,
  userTasks, projectDescription, updateDescription, refetch
} = useOverview(projectId);
```

**Service pattern:** Every method wraps the API call in try/catch and returns mock data on failure. This ensures the UI always renders even when the backend hasn't implemented an endpoint yet.

---

### `features/projects/`

**Files:**
- `components/EpicRow.tsx` — Single epic row in project stats
- `components/ProjectCreateModal.tsx` — Create project form
- `components/ProjectStatsView.tsx` — Stats display (tasks, completion, members)
- `components/StatCard.tsx` — Single stat metric card
- `components/StatsSkeleton.tsx` — Loading skeleton for stats
- `hooks/useProjects.ts` — Fetches all projects, registers colors to ThemeRegistry
- `hooks/useCreateProject.ts` — Handles project creation form submission
- `services/projectService.ts` — API: `getAll`, `getById`, `create`, `update`, `remove`, `addMember`

**Hook contract:**
```ts
const { projects, loading, error, refetch } = useProjects();
```

**Color registration:** All projects register their colors so the sidebar can render colored dots without re-fetching.

---

### `features/settings/`

**Files:**
- `components/AISettings.tsx` — AI model, skills, agent, permission toggles
- `components/GeneralSettings.tsx` — User profile form (name, email, timezone, avatar)
- `components/SettingsLayout.tsx` — Two-column settings shell (nav + content)
- `components/UserProfileSettings.tsx` — User profile settings tab
- `hooks/useSettings.ts` — Wrapper hook for settings data
- `services/settingsService.ts` — API: user profile, preferences, AI settings (all with mock fallback)
- `hooks/index.ts`, `services/index.ts` — Barrel exports

**Status:** All methods use mock data. The service layer has try/catch that silently falls back to mock values.

---

### `features/sprints/`

**Files:**
- `components/SprintCreateModal.tsx` — Create sprint form
- `components/SprintRetrospective.tsx` — Sprint retrospective view
- `components/SprintTreeView.tsx` — Hierarchical sprint overview
- `components/SprintView.tsx` — Sprint detail view
- `hooks/useSprints.ts` — Fetches sprints with 8s timeout handling
- `services/sprintService.ts` — API: `getByProject`, `create`, `update`, `assignTasks`

**Hook contract:**
```ts
const { sprints, loading, error, is404, refetch } = useSprints(projectId);
```

**Note:** `FETCH_TIMEOUT = 8000ms` wraps all requests. If the request times out or returns 404, returns empty sprints with `is404: true`. This gracefully handles the backend not yet implementing sprint endpoints.

---

### `features/workspace/`

**Files:**
- `components/CanvasElement.tsx` — Individual draggable/resizable canvas element (sticky, text, shape)
- `components/WorkspaceToolbar.tsx` — Canvas toolbar (add sticky, add text, zoom, save)
- `components/WorkspaceView.tsx` — Main canvas with pan/zoom, grid background
- `hooks/useWorkspace.ts` — Fetches workspace data
- `hooks/useCanvasElements.ts` — Manages element CRUD, drag/resize state, undo
- `services/workspaceService.ts` — API: `getByProject`, `saveElements` (both use mock fallback)
- `hooks/index.ts`, `services/index.ts`, `components/index.ts` — Barrel exports

**Design aesthetic:** "Sober, Structured, Sophisticated" — 1px borders, max 4px radius, 150ms transitions.

**Current limitation:** Backend doesn't implement workspace storage — all operations log to console and use mock data.

---

## 8. Shared UI Components

Located at `src/components/`, these are **reuseable across features** — unlike feature-specific components which live inside each feature folder.

### Layout Components (`src/components/layout/`)

#### `AppShell.tsx`

**Purpose:** The authenticated layout wrapper. Renders `Sidebar + TopBar` around a `<Outlet />` (child route).

**Key behaviors:**
- Auth guard: redirects to `/login` if not authenticated (after loading)
- Sidebar collapsed state (shared between Sidebar and TopBar)
- Mobile menu toggle (hides sidebar on mobile, shows full-screen overlay)
- Loading spinner while auth is resolving
- Renders `<AIAssistantButton />`

**Usage:** All authenticated routes are wrapped in `<Route element={<AppShell />}` in the router config.

---

#### `Sidebar.tsx`

**Purpose:** Primary project navigation. Shows a list of projects (from `useProjects`) that expand to show views.

**Key behaviors:**
- Project list from global `useProjects()` hook
- Collapsible sidebar (wide ↔ icon-only)
- Project sub-nav with views: Overview, Backlog, Board, Sprints, Calendar, Workspace, Chat
- Active project highlighting via `useEntityTheme` for color
- User avatar + name at bottom, logout button

**Usage:** Consumed only by `AppShell`.

---

#### `TopBar.tsx`

**Purpose:** Fixed top header with a search bar (centered) and notification bell placeholder.

**Usage:** Consumed only by `AppShell`.

---

#### `MobileMenu.tsx`

**Purpose:** Full-screen overlay navigation for mobile (<768px). Mirrors the sidebar's project list.

**Usage:** Rendered inside `AppShell`, toggled by `mobileMenuOpen` state.

---

### UI Components (`src/components/ui/`)

#### `EpicBadge.tsx`

**Purpose:** Displays an epic's name as a colored pill. Color comes entirely from `useEntityTheme(epic.color)`.

**Props:** `{ epic, pill, dot, className, onClick }`

**Special behavior:** Renders nothing if `epic` is null/undefined. Safe to use in optional slots.

---

#### `SprintPill.tsx`

**Purpose:** Displays a sprint name as a colored pill. Same color contract as `EpicBadge`.

**Props:** `{ sprint, showStatus, className }`

**Status dot:** If `showStatus` is true, shows a colored dot (green=active, amber=planned, gray=done).

---

#### `StatusBadge.tsx` + `PriorityTag.tsx`

**Purpose:** Semantic (not user-defined) status and priority labels. Uses hardcoded Tailwind color classes — correct because these are fixed enums, not user-customizable colors.

**Status values:** `todo`, `in_progress`, `in_review`, `done`, `blocked`

**Priority values:** `low`, `medium`, `high`, `critical`

---

#### `ColorPickerSwatch.tsx`

**Purpose:** A grid of selectable color swatches. Used in `ProjectCreateModal`, `ManageBoardsModal`, and sprint/epic create forms.

**Props:** `{ colors, value, onChange, size? }`

---

### Standalone Component

#### `AIAssistantButton.tsx`

**Purpose:** Fixed-position floating action button (bottom-left) that opens the AI assistant. Visible on all views.

**Note:** Currently non-functional (no onClick handler). Placeholder for AI integration.

---

## 9. Styles & Theming

### `src/styles/globals.css`

**Purpose:** All CSS custom properties (design tokens). This is the **single source of truth** for colors, spacing, typography, shadows, and radius. Uses oklch for perceptual uniformity.

**Sections:**
- Typography: `--font-sans`, `--font-mono`
- VS Code dark palette: `--editor`, `--sidebar-bg`, `--sidebar-fg`, `--activity-bar`, etc.
- Brand palette: `--color-brand-*` (violet)
- Semantic: `--color-success`, `--color-warning`, `--color-danger`, `--color-info`
- Entity color system: `--entity-bg`, `--entity-fg`, `--entity-border`, `--entity-solid`
- Layout: `--sidebar-width`, `--sidebar-width-sm`, `--topbar-height`

**Rule:** Never hardcode hex values in components. Use these tokens. Entity colors (user-defined project/epic/sprint colors) come from `useEntityTheme` at runtime and are NOT in this file.

**Import order (via Vite):**
1. CSS variables and base styles in `globals.css`
2. Tailwind CSS loaded via `@tailwindcss/vite` plugin

---

## 10. Utils

### `src/utils/themeUtils.ts`

**Purpose:** Pure color math utilities — no React, no side effects. These are plain TS functions safe to use in hooks, services, and even tests.

**Functions:**

| Function | Purpose |
|----------|---------|
| `hexToRgb(hex)` | Parse hex string → `{ r, g, b }` (handles shorthand `#abc`) |
| `rgbToHex(r, g, b)` | Convert back to hex string |
| `hexToRgba(hex, alpha)` | Add alpha channel → `rgba()` CSS string |
| `getLuminance(hex)` | WCAG luminance formula (0=black to 1=white) |
| `getContrastColor(hex)` | Decide dark or light text for readability on bg |
| `lighten(hex, amount)` | Mix color toward white |
| `darken(hex, amount)` | Mix color toward black |
| `buildEntityTheme(hex)` | **Main function** — computes full CSS variable set for an entity |

**`buildEntityTheme(hex)` output:**
```ts
{
  '--entity-bg': 'rgba(59, 109, 17, 0.12)',      // soft fill
  '--entity-fg': '#ffffff',                       // readable text
  '--entity-border': 'rgba(59, 109, 17, 0.45)',  // medium accent
  '--entity-solid': '#3B6D11'                     // full-opacity
}
```

**Architecture:** This module is the **only** place that knows how entity hex colors map to CSS variables. `useEntityTheme` (in `src/hooks/`) calls this. UI components consume the CSS variables only.

---

## 11. Pages (Route Targets)

Pages live in `src/pages/` (flat structure). Per TRUTH.md, they are thin wrappers that:
1. Extract URL params via `useParams()`
2. Call feature hooks
3. Render feature components
4. Handle global state (loading skeletons, error states, redirecting)

Pages **should not** contain business logic — that belongs in hooks.

### Key Pages

| Page | Route | Uses Hook | Key Component |
|------|-------|-----------|---------------|
| `LandingPage.tsx` | `/` | — | Public marketing page |
| `LoginPage.tsx` | `/login` | `useAuthRedirect()` | Auth form |
| `RegisterPage.tsx` | `/register` | `useAuthRedirect()` | Registration form |
| `ProjectListPage.tsx` | `/projects` | `useProjects()` | Project cards grid |
| `ProjectCreatePage.tsx` | `/projects/new` | `useCreateProject()` | Project creation form |
| `ProjectPage.tsx` | `/projects/:projectId` | — | Redirects to `/projects/:projectId/overview` |
| `BacklogPage.tsx` | `/projects/:projectId/backlog` | `useBacklog(projectId)` | `BacklogTable` |
| `BoardPage.tsx` | `/projects/:projectId/board` | `useBoard(projectId)` | `BoardView` + `ManageBoardsModal` |
| `SprintPage.tsx` | `/projects/:projectId/sprints` | `useSprints(projectId)` | `SprintView` + `SprintCreateModal` |
| `CalendarPage.tsx` | `/projects/:projectId/calendar` | `useCalendar(projectId)` | `CalendarView` |
| `ChatPage.tsx` | `/projects/:projectId/chat` | `useChat(projectId)` | `ChatLayout` |
| `WorkspacePage.tsx` | `/projects/:projectId/workspace` | `useWorkspace(projectId)` | `WorkspaceView` + `WorkspaceToolbar` |
| `SettingsPage.tsx` | `/projects/:projectId/settings` or `/settings` | `useSettings()` | `SettingsLayout` + settings panels |
| `NotFound.tsx` | `*` | — | 404 page |

---

## 12. Design System

### Color Palette

**Brand (Violet):** `#6B5CFF` (primary action color)
- Light variants: `50`, `100` (backgrounds)
- Dark variants: `400`, `600`, `700`, `900`

**Dark Navigation (Sidebar/TopBar):** `#181e4b` / `#171E4A`

**Entity Colors:** User-defined at runtime (project/epic/sprint colors). These are stored as hex in the API and converted to CSS variables via `useEntityTheme`. They are **never hardcoded**.

**Semantic Colors:**
- Success: `#22c55e` (green)
- Warning: `#f59e0b` (amber)
- Danger: `#ef4444` (red)
- Info: `#0ea5e9` (blue)

### Typography

- **Sans:** `'DM Sans', system-ui, sans-serif`
- **Mono:** `'JetBrains Mono', monospace`

### Spatial System

- Sidebar: 240px (expanded) / 60px (collapsed)
- TopBar: 56px height
- Panel: 380px (detail panels)

### Border Radius

- `xs`: 3px (workspace canvas — "sober" aesthetic)
- `sm`: 5px
- `md`: 8px (default)
- `lg`: 12px
- `xl`: 18px (auth card)

### Shadows

Minimal use — "1px borders instead of shadows" per SKILL.md.

### Transitions

- Fast: 120ms
- Base: 200ms
- Slow: 350ms

---

## 13. Adding New Features

### Step 1: Create the feature folder

```
src/features/[new-feature]/
├── components/
├── hooks/
├── services/
├── types/
├── utils/
├── styles/
└── index.ts
```

### Step 2: Define the types

```ts
// features/newFeature/types/newFeatureTypes.ts
export interface NewFeatureItem {
  id: string;
  name: string;
  color: string;
}
```

### Step 3: Define the service

```ts
// features/newFeature/services/newFeatureService.ts
import { apiClient } from '@/services/apiClient';

export const newFeatureService = {
  async getAll() {
    return apiClient.get('/new-feature');
  },
  async create(data: Partial<NewFeatureItem>) {
    return apiClient.post('/new-feature', data);
  },
};
```

### Step 4: Define the hook

```ts
// features/newFeature/hooks/useNewFeature.ts
import { useState, useEffect, useCallback } from 'react';
import { newFeatureService } from '../services/newFeatureService';

export function useNewFeature(projectId: string) {
  const [items, setItems] = useState<NewFeatureItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await newFeatureService.getAll(projectId);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, error, refetch: fetch };
}
```

### Step 5: Create the component

```tsx
// features/newFeature/components/NewFeatureView.tsx
interface NewFeatureViewProps {
  items: NewFeatureItem[];
  loading: boolean;
}

export function NewFeatureView({ items, loading }: NewFeatureViewProps) {
  if (loading) return <div className="placeholder-glow">...</div>;
  return (
    <div className="new-feature-wrapper">
      {items.map(item => <NewFeatureCard key={item.id} item={item} />)}
    </div>
  );
}
```

### Step 6: Wire up the page

```tsx
// src/pages/NewFeaturePage.tsx
import { useParams } from 'react-router-dom';
import { useNewFeature } from '@/features/newFeature/hooks/useNewFeature';
import { NewFeatureView } from '@/features/newFeature/components/NewFeatureView';

export default function NewFeaturePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { items, loading, error } = useNewFeature(projectId!);
  return <NewFeatureView items={items} loading={loading} />;
}
```

### Step 7: Add the route

Add the route to the TanStack Router configuration file.

---

## 14. Key Conventions

### Imports

- Use `@/` path alias for all imports (configured in `vite.config.ts`)
- Services: `import { apiClient } from '@/services/apiClient'`
- Features: `import { useBacklog } from '@/features/backlog/hooks/useBacklog'`
- Components: `import { EpicBadge } from '@/components/ui/EpicBadge'`
- Global hooks: `import { useAuth } from '@/store/useAuth'`

### File Naming

- Components: `PascalCase.tsx` (e.g., `EpicBadge.tsx`)
- Hooks: `camelCase.ts` (e.g., `useBacklog.ts`)
- Services: `camelCase.ts` (e.g., `backlogService.ts`)
- Utils: `camelCase.ts` (e.g., `themeUtils.ts`)
- Types: `camelCase.ts` (e.g., `backlogTypes.ts`)
- Pages: `PascalCase + Page.tsx` (e.g., `BacklogPage.tsx`)
- Context providers: `PascalCase.tsx` (e.g., `ThemeRegistry.tsx`)

### JSDoc Comments

All files have JSDoc comments with:
- `@component` / `@hook` / `@service` / `@module` tags
- `@description` of purpose
- `@example` usage
- Parameter and return type documentation

### Error Handling Pattern

```ts
try {
  const data = await someService.getData();
  setData(Array.isArray(data) ? data : []);
} catch (err) {
  if (err.status === 401) {
    setError('Session expired. Please log in again.');
  } else if (err.status === 404) {
    setIs404(true);
    setError(null);
  } else {
    setError(err instanceof Error ? err.message : 'Failed to load');
  }
}
```

### Color System

- Entity colors (project/epic/sprint) → `useEntityTheme(color)` → CSS variables
- Semantic colors (status/priority) → Hardcoded Tailwind classes (fixed enums, not user-defined)
- Design tokens → CSS custom properties from `globals.css`

### Mock Data Pattern

Services that don't have backend implementation use mock data as fallback:

```ts
async getData() {
  try {
    return await apiClient.get('/endpoint');
  } catch {
    return getMockData();
  }
}
```

---

## 15. Common Patterns

### Optimistic Updates

Used in `useBoard` for drag-and-drop:

```ts
const moveTask = useCallback(async (taskId: string, newStatus: string) => {
  // 1. Optimistically update UI immediately
  setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  try {
    // 2. Send to server
    await boardService.updateTaskStatus(taskId, { status: newStatus });
  } catch {
    // 3. Revert on failure
    fetchBoard();
  }
}, [fetchBoard]);
```

### Parallel Data Fetching

Used in `useOverview` to fetch multiple data points concurrently:

```ts
const [stats, velocity, workload, ...] = await Promise.all([
  overviewService.getProjectStats(projectId),
  overviewService.getVelocityData(projectId),
  overviewService.getTeamWorkload(projectId),
  ...
]);
```

### Theme Registration Pattern

After fetching entity data, immediately register colors:

```ts
const { registerEntities } = useThemeRegistry();

const data = await backlogService.getEpicsWithTasks(projectId);
setEpics(data);
// Register colors so any component can use getTheme(epicId) instantly
registerEntities(data.map(epic => ({ id: epic.id, color: epic.color })));
```

### Entity-Theme-Agnostic Components

Components like `EpicBadge`, `SprintPill`, and `Sidebar` receive entity data and compute styling externally. They only ever access `var(--entity-*)` CSS variables or receive a pre-computed `style={theme}` prop. This means they never need to change when the color algorithm changes.

---

## 16. Assets Management

ScrumHub uses a dual-asset strategy based on Vite conventions:

### Static Assets (`frontend/public/`)
- **Purpose:** Files that should be served exactly as-is, without processing by the build tool.
- **Access:** Referenced via absolute paths (e.g., `<img src="/images/logo.png" />`).
- **Use Case:** Favicons, `robots.txt`, large videos, or third-party libraries not in npm.

### Bundled Assets (`frontend/src/assets/`)
- **Purpose:** Files that are part of the dependency graph and should be optimized/hashed by Vite.
- **Access:** Imported in components (e.g., `import logo from '@/assets/logo.svg'`).
- **Use Case:** SVG icons, small images, and CSS background images.

### Documentation Assets (`docs/assets/`)
- **Purpose:** Images and media used exclusively within the Markdown documentation files.
- **Access:** Relative paths within `.md` files.
- **Use Case:** Architecture diagrams, UX sketches, and design references.

---

## Deviation Notes

These deviations from TRUTH.md's target structure exist in the current codebase and should be addressed during the migration to feature-first architecture:

### 1. Pages live in `src/pages/` (flat) instead of `features/[feature]/pages/`

Per TRUTH.md, pages should be `features/[feature]/pages/`. Currently all 14 pages are in a flat `src/pages/` directory.

### 2. Auth feature is incomplete

`features/auth/` only has `services/authService.ts`. Missing `components/`, `hooks/`, `pages/`. The Login and Register pages should ideally live here.

### 3. Chat feature is incomplete

`features/chat/` only has `components/ChatLayout.tsx`. Missing `hooks/` and `services/`. The chat feature is the least developed.

### 4. Some features lack `types/` and `utils/` directories

Per TRUTH.md, each feature should have `types/` and `utils/` directories for feature-specific types and utilities.

---

*Last updated: 2026-05-04*