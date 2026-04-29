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
frontend/src/
├── App.jsx                          # Root component with routing + providers
├── main.jsx                         # Entry point — mounts App to #root
├── components/                      # SHARED UI — used by multiple features
│   ├── AIAssistantButton.jsx        # Fixed-position AI chat trigger
│   ├── layout/                      # Structural components (AppShell, Sidebar, TopBar, MobileMenu)
│   │   ├── AppShell.jsx             # Authenticated layout wrapper (Sidebar + TopBar + Outlet)
│   │   ├── Sidebar.jsx              # Project navigation tree in sidebar
│   │   ├── TopBar.jsx               # Top header with search bar
│   │   └── MobileMenu.jsx           # Full-screen mobile overlay nav
│   └── ui/                          # Atomic reusable UI elements
│       ├── EpicBadge.jsx            # Colored epic pill with dynamic theme
│       ├── SprintPill.jsx           # Colored sprint pill with dynamic theme
│       ├── StatusBadge.jsx          # Semantic status + priority tags (todo/in_progress/done/etc)
│       ├── ColorPickerSwatch.jsx    # Color selection swatch grid
│       └── index.js                 # Barrel export
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
│   └── workspace/                   # Visual workspace canvas
├── services/                        # GLOBAL API CLIENT only
│   └── apiClient.js                 # Central fetch wrapper
├── hooks/                           # GLOBAL HOOKS (useAuthGuard, useAuthRedirect, useEntityTheme)
├── store/                           # GLOBAL STATE (AuthContext, ThemeRegistry + their hooks)
├── styles/                          # GLOBAL STYLES (CSS variables, utilities, Bootstrap overrides)
├── utils/                           # PURE UTILITIES (color math — no React, no side effects)
└── pages/                           # ROUTE TARGETS — thin wrappers that compose hooks + features
    ├── LandingPage.jsx              # Public landing page
    ├── LoginPage.jsx                # Login form
    ├── RegisterPage.jsx             # Registration form
    ├── ProjectListPage.jsx          # Projects dashboard
    ├── ProjectCreatePage.jsx        # New project form
    ├── ProjectPage.jsx              # Project detail (redirects to overview)
    ├── BacklogPage.jsx              # Backlog view
    ├── BoardPage.jsx                # Kanban board page
    ├── SprintPage.jsx               # Sprint planning
    ├── CalendarPage.jsx             # Calendar view
    ├── ChatPage.jsx                 # Chat view
    ├── WorkspacePage.jsx            # Workspace canvas
    ├── SettingsPage.jsx             # Settings
    └── NotFound.jsx                 # 404
```

---

## 3. Entry Points

### `src/main.jsx`

**Purpose:** The single DOM entry point. Creates a React root and mounts `App`.

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**What to change here:** Almost never. Only if you need to add global providers (e.g., ErrorBoundary) that wrap the entire app before anything else renders.

---

### `src/App.jsx`

**Purpose:** Root React component that declares:
1. All `Provider` wrappers (AuthProvider, ThemeRegistryProvider)
2. The complete route tree (public + authenticated)
3. Which routes are wrapped in `AppShell` (authenticated layout)

**Provider order (outermost to innermost):**
```
BrowserRouter → AuthProvider → ThemeRegistryProvider → Routes
```

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

### `src/services/apiClient.js`

**Purpose:** The **single fetch wrapper** used by ALL feature services. All API calls go through here — no raw `fetch()` anywhere else in the codebase.

**Responsibilities:**
- Base URL from `import.meta.env.VITE_API_URL` (defaults to `http://localhost:3000/api`)
- JSON serialization/deserialization
- Consistent error shape: `Error` with `{ message, status, data }`
- HTTP methods: `get`, `post`, `patch`, `put`, `delete`

**Why this matters:** If you need to switch from `fetch` to `axios` (or add interceptors, retries, etc), you change only this file. Every service file is unaffected.

**How to use:**
```js
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

### `src/store/AuthContext.jsx`

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

### `src/store/useAuth.js`

**Purpose:** Hook to access `AuthContext`. Throws if used outside `<AuthProvider>`.

```js
const { user, login, logout, authLoading } = useAuth();
```

---

### `src/store/ThemeRegistry.jsx` + `src/store/useThemeRegistry.js`

**Purpose:** A global memoized cache that maps `entityId → computed CSS variable set`.

**Why it exists:** The same epic/project color renders in the sidebar nav, backlog table, kanban cards, sprint headers, and multiple task cards simultaneously. Without a registry, each component independently recalculates the color math on every render.

**How it works:**
1. Feature hooks call `registerEntities([{ id, color }])` after fetching data from the API
2. `ThemeRegistry` computes and caches the full CSS variable set (`--entity-bg`, `--entity-fg`, `--entity-border`, `--entity-solid`) per entityId
3. Any component can call `getTheme(entityId)` to get the ready-to-spread style object

**What to change here:**
- Adding new CSS variable outputs from color math
- Adjusting the color algorithm (see `src/utils/themeUtils.js`)

---

## 6. Global Hooks

### `src/hooks/useAuthGuard.js`

**Purpose:** Redirects unauthenticated users to `/login`. Used in `AppShell` and any protected route wrapper.

```js
useAuthGuard(); // defaults to redirecting to /login
useAuthGuard('/custom-redirect');
```

**Behavior:** Navigates after `authLoading` completes and `user` is null.

---

### `src/hooks/useAuthRedirect.js`

**Purpose:** Redirects **authenticated** users away from public pages (Landing, Login, Register) to `/projects`.

```js
useAuthRedirect(); // defaults to /projects
useAuthRedirect('/some-other-path');
```

---

### `src/hooks/useEntityTheme.js`

**Purpose:** Converts a runtime hex color (from an epic, sprint, or project) into a scoped inline `style` object with CSS variables.

**Input:** A hex color string (e.g., `"#3B6D11"`) or `null`/`undefined`

**Output:** A `React.CSSProperties` object:
```js
{
  '--entity-bg': 'rgba(59, 109, 17, 0.12)',
  '--entity-fg': '#ffffff',
  '--entity-border': 'rgba(59, 109, 17, 0.45)',
  '--entity-solid': '#3B6D11'
}
```

**How components use it:**
```jsx
function EpicBadge({ epic }) {
  const theme = useEntityTheme(epic?.color); // compute once
  return <span className="entity-badge" style={theme}>{epic.name}</span>;
}
```

**Architecture note:** This hook is the **only** place that knows about the hex → CSS variable mapping. UI components are completely color-agnostic — they only reference `var(--entity-*)` in CSS.

**What to change here:** You likely won't need to. The CSS variable names and the color math algorithm are in `src/utils/themeUtils.js`.

---

## 7. Feature Modules

Each feature follows an identical internal structure:
```
features/[feature-name]/
├── components/          # Feature-specific UI (NOT shared outside this feature)
│   ├── *.jsx
│   └── index.js         # Optional barrel export
├── hooks/               # Feature-specific state + side effects
│   ├── *.js
│   └── index.js         # Optional barrel export
├── services/            # Feature-specific API calls
│   ├── *.js
│   └── index.js         # Optional barrel export
├── index.js             # Optional — re-exports for cleaner imports
└── pages/               # NOTE: Currently pages live at src/pages/ flat
                         # Per SKILL.md they should be features/[name]/pages/
```

---

### `features/auth/`

**Files:**
- `services/authService.js`

**What it does:** API calls for authentication: `login`, `register`, `logout`, `getCurrentUser`.

**Response shape:**
```js
User: { id, name, email, avatarUrl?, role? }
```

**Missing:** No `components/`, `hooks/`, or `pages/` — auth pages (Login, Register) currently live at `src/pages/`. This is a deviation from the feature-first principle (see SKILL.md deviations).

**To improve:** Move LoginPage/RegisterPage into `features/auth/pages/`.

---

### `features/backlog/`

**Files:**
- `components/BacklogTable.jsx` — Renders epics as expandable rows with tasks
- `hooks/useBacklog.js` — Fetches epics with tasks, registers epic colors to ThemeRegistry
- `services/backlogService.js` — API: `getEpicsWithTasks`, `createEpic`, `updateEpic`, `createTask`, `updateTask`
- `index.js` — Re-exports

**Hook contract:**
```js
const { epics, loading, error, is404, refetch } = useBacklog(projectId);
```

**Service contract:**
```js
Epic: { id, name, color, status, startDate, endDate, tasks[] }
Task: { id, title, status, priority, assignee, dueDate, epicId, sprintId }
```

**Missing:** No `pages/` — the page lives at `src/pages/BacklogPage.jsx`.

---

### `features/board/`

**Files:**
- `components/BoardView.jsx` — Kanban board with drag-and-drop columns
- `components/ManageBoardsModal.jsx` — Modal for managing custom board columns
- `hooks/useBoard.js` — Fetches tasks, groups by status, handles moveTask optimistic updates
- `services/boardService.js` — API: `getTasksByProject`, `updateTaskStatus`, `createTask`

**Hook contract:**
```js
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
- `components/CalendarView.jsx` — Monthly calendar grid
- `hooks/useCalendar.js` — Fetches tasks, indexes by `dueDate` (YYYY-MM-DD)
- `services/calendarService.js` — API: `getTasksForCalendar`, `createTask`

**Hook contract:**
```js
const { tasksByDate, year, month, prevMonth, nextMonth, loading, error, refetch } = useCalendar(projectId);
// tasksByDate: { '2025-04-15': [task, task], ... }
```

**Current limitation:** Backend doesn't support `?month=&year=` filtering — all tasks fetched and filtered client-side.

---

### `features/chat/`

**Files:**
- `components/ChatLayout.jsx` — Full-width chat with sliding members sidebar

**Status:** Uses mock data for messages and members. No live API integration.

**What it does:**
- Dark-themed chat UI (matches sidebar aesthetic)
- Sliding "Online Members" panel from the right
- Mock AI message (ScrumHub AI)
- Message input (non-functional — no WebSocket or API)

**Missing:** No `hooks/`, no `services/`. This is the least developed feature.

**To improve:** Add `hooks/useChat.js` and `services/chatService.js`, implement WebSocket for real-time messaging.

---

### `features/overview/`

**Files:**
- `components/OverviewView.jsx` — Project dashboard with stats, velocity chart, workload
- `hooks/useOverview.js` — Fetches 9 data points in parallel via `Promise.all`
- `services/overviewService.js` — API + extensive mock data fallback

**Hook contract:**
```js
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
- `components/EpicRow.jsx` — Single epic row in project stats
- `components/ProjectCreateModal.jsx` — Create project form
- `components/ProjectStatsView.jsx` — Stats display (tasks, completion, members)
- `components/StatCard.jsx` — Single stat metric card
- `components/StatsSkeleton.jsx` — Loading skeleton for stats
- `hooks/useProjects.js` — Fetches all projects, registers colors to ThemeRegistry
- `hooks/useCreateProject.js` — Handles project creation form submission
- `services/projectService.js` — API: `getAll`, `getById`, `create`, `update`, `remove`, `addMember`

**Hook contract:**
```js
const { projects, loading, error, refetch } = useProjects();
```

**Color registration:** All projects register their colors so the sidebar can render colored dots without re-fetching.

---

### `features/settings/`

**Files:**
- `components/AISettings.jsx` — AI model, skills, agent, permission toggles
- `components/GeneralSettings.jsx` — User profile form (name, email, timezone, avatar)
- `components/SettingsLayout.jsx` — Two-column settings shell (nav + content)
- `components/UserProfileSettings.jsx` — User profile settings tab
- `hooks/useSettings.js` — Wrapper hook for settings data
- `services/settingsService.js` — API: user profile, preferences, AI settings (all with mock fallback)
- `hooks/index.js`, `services/index.js` — Barrel exports

**Status:** All methods use mock data. The service layer has try/catch that silently falls back to mock values.

---

### `features/sprints/`

**Files:**
- `components/SprintCreateModal.jsx` — Create sprint form
- `components/SprintRetrospective.jsx` — Sprint retrospective view
- `components/SprintTreeView.jsx` — Hierarchical sprint overview
- `components/SprintView.jsx` — Sprint detail view
- `hooks/useSprints.js` — Fetches sprints with 8s timeout handling
- `services/sprintService.js` — API: `getByProject`, `create`, `update`, `assignTasks`

**Hook contract:**
```js
const { sprints, loading, error, is404, refetch } = useSprints(projectId);
```

**Note:** `FETCH_TIMEOUT = 8000ms` wraps all requests. If the request times out or returns 404, returns empty sprints with `is404: true`. This gracefully handles the backend not yet implementing sprint endpoints.

---

### `features/workspace/`

**Files:**
- `components/CanvasElement.jsx` — Individual draggable/resizable canvas element (sticky, text, shape)
- `components/WorkspaceToolbar.jsx` — Canvas toolbar (add sticky, add text, zoom, save)
- `components/WorkspaceView.jsx` — Main canvas with pan/zoom, grid background
- `hooks/useWorkspace.js` — Fetches workspace data
- `hooks/useCanvasElements.js` — Manages element CRUD, drag/resize state, undo
- `services/workspaceService.js` — API: `getByProject`, `saveElements` (both use mock fallback)
- `hooks/index.js`, `services/index.js`, `components/index.js` — Barrel exports

**Design aesthetic:** "Sober, Structured, Sophisticated" — 1px borders, max 4px radius, 150ms transitions.

**Current limitation:** Backend doesn't implement workspace storage — all operations log to console and use mock data.

---

## 8. Shared UI Components

Located at `src/components/`, these are **reuseable across features** — unlike feature-specific components which live inside each feature folder.

### Layout Components (`src/components/layout/`)

#### `AppShell.jsx`

**Purpose:** The authenticated layout wrapper. Renders `Sidebar + TopBar` around a `<Outlet />` (child route).

**Key behaviors:**
- Auth guard: redirects to `/login` if not authenticated (after loading)
- Sidebar collapsed state (shared between Sidebar and TopBar)
- Mobile menu toggle (hides sidebar on mobile, shows full-screen overlay)
- Loading spinner while auth is resolving
- Renders `<AIAssistantButton />`

**Usage:** All authenticated routes are wrapped in `<Route element={<AppShell />}>` in `App.jsx`.

---

#### `Sidebar.jsx`

**Purpose:** Primary project navigation. Shows a list of projects (from `useProjects`) that expand to show views.

**Key behaviors:**
- Project list from global `useProjects()` hook
- Collapsible sidebar (wide ↔ icon-only)
- Project sub-nav with views: Overview, Backlog, Board, Sprints, Calendar, Workspace, Chat
- Active project highlighting via `useEntityTheme` for color
- User avatar + name at bottom, logout button

**Usage:** Consumed only by `AppShell`.

---

#### `TopBar.jsx`

**Purpose:** Fixed top header with a search bar (centered) and notification bell placeholder.

**Usage:** Consumed only by `AppShell`.

---

#### `MobileMenu.jsx`

**Purpose:** Full-screen overlay navigation for mobile (<768px). Mirrors the sidebar's project list.

**Usage:** Rendered inside `AppShell`, toggled by `mobileMenuOpen` state.

---

### UI Components (`src/components/ui/`)

#### `EpicBadge.jsx`

**Purpose:** Displays an epic's name as a colored pill. Color comes entirely from `useEntityTheme(epic.color)`.

**Props:** `{ epic, pill, dot, className, onClick }`

**Special behavior:** Renders nothing if `epic` is null/undefined. Safe to use in optional slots.

---

#### `SprintPill.jsx`

**Purpose:** Displays a sprint name as a colored pill. Same color contract as `EpicBadge`.

**Props:** `{ sprint, showStatus, className }`

**Status dot:** If `showStatus` is true, shows a colored dot (green=active, amber=planned, gray=done).

---

#### `StatusBadge.jsx` + `PriorityTag.jsx`

**Purpose:** Semantic (not user-defined) status and priority labels. Uses hardcoded Bootstrap color classes — correct because these are fixed enums, not user-customizable colors.

**Status values:** `todo`, `in_progress`, `in_review`, `done`, `blocked`

**Priority values:** `low`, `medium`, `high`, `critical`

---

#### `ColorPickerSwatch.jsx`

**Purpose:** A grid of selectable color swatches. Used in `ProjectCreateModal`, `ManageBoardsModal`, and sprint/epic create forms.

**Props:** `{ colors, value, onChange, size? }`

---

### Standalone Component

#### `AIAssistantButton.jsx`

**Purpose:** Fixed-position floating action button (bottom-left) that opens the AI assistant. Visible on all views.

**Note:** Currently non-functional (no onClick handler). Placeholder for AI integration.

---

## 9. Styles & Theming

### `src/styles/_variables.css`

**Purpose:** All CSS custom properties (design tokens). This is the **single source of truth** for colors, spacing, typography, shadows, and radius.

**Sections:**
- Typography: `--font-sans`, `--font-mono`
- Brand palette: `--color-brand-50` through `--color-brand-900` (violet)
- Dark nav: `--color-dark-nav`, `--color-dark-nav-deep`, hover/active states
- Neutrals: `--color-gray-50` through `--color-gray-900`
- Semantic: `--color-success`, `--color-warning`, `--color-danger`, `--color-info` (each with a `*-bg` variant)
- Surface: `--color-surface`, `--color-surface-alt`, `--color-border`
- Radius: `--radius-xs` (3px) through `--radius-xl` (18px)
- Shadows: `--shadow-xs` through `--shadow-lg`
- Layout: `--sidebar-width` (240px), `--sidebar-width-sm` (60px), `--topbar-height` (56px)
- Bootstrap overrides: Maps Bootstrap's `--bs-*` vars to the design tokens

**Rule:** Never hardcode hex values in components. Use these tokens. Entity colors (user-defined project/epic/sprint colors) come from `useEntityTheme` at runtime and are NOT in this file.

---

### `src/styles/_utilities.css`

**Purpose:** All custom CSS beyond Bootstrap. Organized by component/feature section:

**Sections:**
1. Scrollbars (custom thin scrollbar styling)
2. Text helpers (`.text-brand`, `.text-xs`, `.text-sm`, `.fw-medium`)
3. Layout helpers (`.min-w-0`, `.truncate`)
4. Entity color system (`.entity-badge`, `.entity-badge--pill`, `.entity-accent-border`) — these consume CSS variables set by `useEntityTheme`
5. App Shell layout (`.app-shell`, `.app-main`, `.app-content`)
6. Sidebar (`.app-sidebar`, `.sidebar-brand`, `.sidebar-nav`, `.sidebar-project-btn`, `.sidebar-subnav-*`, `.sidebar-footer`)
7. TopBar (`.app-topbar`, `.topbar-search`, `.topbar-icon-btn`)
8. Auth pages (`.auth-page`, `.auth-card`, `.auth-logo-*`)
9. Landing page (`.landing-page`, `.landing-nav`, `.landing-hero`, `.landing-features`, `.landing-cta`)
10. Kanban board (`.board-view-wrapper`, `.board-column`, `.board-col-*-*`, `.board-task-card`, `.manage-boards-modal`)
11. Calendar (`.calendar-grid`, `.calendar-cell`, `.calendar-day-num`, `.calendar-task-chip`)
12. Chat (`.chat-shell`, `.chat-full-shell`, `.chat-full-members`, all chat message/input styles)
13. Workspace canvas (`.workspace-shell`, `.workspace-toolbar`, `.workspace-canvas`, `.canvas-element`)
14. Mobile menu (`.mobile-menu-overlay`, `.mobile-menu-*-*`)
15. Settings (`.settings-shell`, `.settings-nav`, `.settings-content`, `.settings-form`)
16. Bootstrap overrides, sprint views, overview stats, etc.

**Animation:** `.animate-in` = `fadeInUp` (opacity 0→1, translateY 6px→0, 200ms ease). Used on page load for cards and modals.

---

### `src/styles/_bootstrap-overrides.css`

**Purpose:** Overrides of Bootstrap defaults that can't be handled via CSS variable mapping.

---

### `src/styles/main.css`

**Purpose:** Imports all other CSS files. Entry point for all styles.

**Order:**
1. `_variables.css` (design tokens)
2. `bootstrap.min.css` (third-party)
3. `_bootstrap-overrides.css`
4. `_utilities.css` (all component CSS)
5. Some feature-specific overrides

---

## 10. Utils

### `src/utils/themeUtils.js`

**Purpose:** Pure color math utilities — no React, no side effects. These are plain JS functions safe to use in hooks, services, and even tests.

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
```js
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

Pages live in `src/pages/` (flat structure). Per the Senior React Architect SKILL.md, they should ideally be within `features/[feature]/pages/`, but currently they are centralized here.

**Role of pages:** Thin wrappers that:
1. Extract URL params via `useParams()`
2. Call feature hooks
3. Render feature components
4. Handle global state (loading skeletons, error states, redirecting)

Pages **should not** contain business logic — that belongs in hooks.

### Key Pages

| Page | Route | Uses Hook | Key Component |
|------|-------|-----------|---------------|
| `LandingPage.jsx` | `/` | — | Public marketing page |
| `LoginPage.jsx` | `/login` | `useAuthRedirect()` | Auth form |
| `RegisterPage.jsx` | `/register` | `useAuthRedirect()` | Registration form |
| `ProjectListPage.jsx` | `/projects` | `useProjects()` | Project cards grid |
| `ProjectCreatePage.jsx` | `/projects/new` | `useCreateProject()` | Project creation form |
| `ProjectPage.jsx` | `/projects/:projectId` | — | Redirects to `/projects/:projectId/overview` |
| `BacklogPage.jsx` | `/projects/:projectId/backlog` | `useBacklog(projectId)` | `BacklogTable` |
| `BoardPage.jsx` | `/projects/:projectId/board` | `useBoard(projectId)` | `BoardView` + `ManageBoardsModal` |
| `SprintPage.jsx` | `/projects/:projectId/sprints` | `useSprints(projectId)` | `SprintView` + `SprintCreateModal` |
| `CalendarPage.jsx` | `/projects/:projectId/calendar` | `useCalendar(projectId)` | `CalendarView` |
| `ChatPage.jsx` | `/projects/:projectId/chat` | — | `ChatLayout` (mock data) |
| `WorkspacePage.jsx` | `/projects/:projectId/workspace` | `useWorkspace(projectId)` | `WorkspaceView` + `WorkspaceToolbar` |
| `SettingsPage.jsx` | `/projects/:projectId/settings` or `/settings` | `useSettings()` | `SettingsLayout` + settings panels |
| `NotFound.jsx` | `*` | — | 404 page |

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
└── pages/       (when refactored; currently pages live at src/pages/)
```

### Step 2: Define the service

```js
// features/newFeature/services/newFeatureService.js
import { apiClient } from '@/services/apiClient';

export const newFeatureService = {
  async getAll() {
    return apiClient.get('/new-feature');
  },
  async create(data) {
    return apiClient.post('/new-feature', data);
  },
};
```

### Step 3: Define the hook

```js
// features/newFeature/hooks/useNewFeature.js
import { useState, useEffect, useCallback } from 'react';
import { newFeatureService } from '../services/newFeatureService';

export function useNewFeature(projectId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await newFeatureService.getAll(projectId);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, error, refetch: fetch };
}
```

### Step 4: Create the component

```jsx
// features/newFeature/components/NewFeatureView.jsx
export function NewFeatureView({ items, loading }) {
  if (loading) return <div className="placeholder-glow">...</div>;
  return (
    <div className="new-feature-wrapper">
      {items.map(item => <NewFeatureCard key={item.id} item={item} />)}
    </div>
  );
}
```

### Step 5: Wire up the page

```jsx
// src/pages/NewFeaturePage.jsx
import { useParams } from 'react-router-dom';
import { useNewFeature } from '@/features/newFeature/hooks/useNewFeature';
import { NewFeatureView } from '@/features/newFeature/components/NewFeatureView';

export default function NewFeaturePage() {
  const { projectId } = useParams();
  const { items, loading, error } = useNewFeature(projectId);
  return <NewFeatureView items={items} loading={loading} />;
}
```

### Step 6: Add the route

```jsx
// src/App.jsx
<Route path="/projects/:projectId/new-feature" element={<NewFeaturePage />} />
```

---

## 14. Key Conventions

### Imports

- Use `@/` path alias for all imports (configured in `vite.config.js`)
- Services: `import { apiClient } from '@/services/apiClient'`
- Features: `import { useBacklog } from '@/features/backlog/hooks/useBacklog'`
- Components: `import { EpicBadge } from '@/components/ui/EpicBadge'`
- Global hooks: `import { useAuth } from '@/store/useAuth'`

### File Naming

- Components: `PascalCase.jsx` (e.g., `EpicBadge.jsx`)
- Hooks: `camelCase.js` (e.g., `useBacklog.js`)
- Services: `camelCase.js` (e.g., `backlogService.js`)
- Utils: `camelCase.js` (e.g., `themeUtils.js`)
- Pages: `PascalCase.jsx` (e.g., `BacklogPage.jsx`)

### JSDoc Comments

All files have JSDoc comments with:
- `@component` / `@hook` / `@service` / `@module` tags
- `@description` of purpose
- `@example` usage
- Parameter and return type documentation

### Error Handling Pattern

```js
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
    setError(err.message ?? 'Failed to load');
  }
}
```

### Color System

- Entity colors (project/epic/sprint) → `useEntityTheme(color)` → CSS variables
- Semantic colors (status/priority) → Hardcoded in component (fixed enums, not user-defined)
- Design tokens → CSS custom properties from `_variables.css`

### Mock Data Pattern

Services that don't have backend implementation use mock data as fallback:

```js
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

```js
const moveTask = useCallback(async (taskId, newStatus) => {
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

```js
const [stats, velocity, workload, ...] = await Promise.all([
  overviewService.getProjectStats(projectId),
  overviewService.getVelocityData(projectId),
  overviewService.getTeamWorkload(projectId),
  ...
]);
```

### Theme Registration Pattern

After fetching entity data, immediately register colors:

```js
const { registerEntities } = useThemeRegistry();

const data = await backlogService.getEpicsWithTasks(projectId);
setEpics(data);
// Register colors so any component can use getTheme(epicId) instantly
registerEntities(data.map(epic => ({ id: epic.id, color: epic.color })));
```

### Entity-Theme-Agnostic Components

Components like `EpicBadge`, `SprintPill`, and `Sidebar` receive entity data and compute styling externally. They only ever access `var(--entity-*)` CSS variables or receive a pre-computed `style={theme}` prop. This means they never need to change when the color algorithm changes.

---

## Deviation Notes (Per SKILL.md)

### 1. Pages live in `src/pages/` (flat) instead of `features/[feature]/pages/`

Per the Senior React Architect SKILL.md, pages should be `features/[feature]/pages/`. Currently all 14 pages are in a flat `src/pages/` directory. This is the most significant architectural deviation.

### 2. Auth feature is incomplete

`features/auth/` only has `services/authService.js`. Missing `components/`, `hooks/`, `pages/`. The Login and Register pages should ideally live here.

### 3. Chat feature is incomplete

`features/chat/` only has `components/ChatLayout.jsx`. Missing `hooks/` and `services/`. The chat feature is the least developed.

---

*Last updated: 2026-04-29*