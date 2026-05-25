# ARCHITECTURE.md — Project Structure & Code Conventions

**This file owns:** Folder structure, TypeScript norms, component patterns, stack.
**For colors:** See [BRAND.md](./BRAND.md)
**For styling rules:** See [STYLING.md](./STYLING.md)
**Last updated:** 2026-05-15

---

## Stack

| Layer | Technology |
|-------|------------|
| Bundler | Vite (TSX, path alias `@/` → `src/`) |
| UI | React 18, TypeScript |
| Styles | Tailwind CSS |
| State | TanStack Query + React Context |
| Routing | TanStack Router |
| HTTP | Custom `apiClient` (fetch wrapper) |

---

## Directory Structure

```
src/
├── components/
│   ├── layout/           # AppShell, TitleBar, ActivityBar, StatusBar
│   └── ui/               # Shared atoms (EpicBadge, StatusBadge, etc.)
├── features/             # Feature modules
│   ├── auth/
│   ├── projects/
│   ├── backlog/
│   ├── sprints/
│   ├── tasks/
│   ├── quest-tree/
│   ├── chatroom/
│   └── ai/
├── hooks/                # Global hooks (useEntityTheme, etc.)
├── pages/                # Route-level components (thin orchestrators)
├── routes/               # TanStack Router route configuration
├── services/             # apiClient.ts
├── store/                # AuthContext, ThemeRegistry
├── styles/               # globals.css
├── types/                # Global TypeScript types
└── utils/                # Pure functions
```

---

## Feature Module Structure

Each feature follows this pattern:

```
features/<name>/
├── components/     # Feature-specific UI
├── hooks/          # use<Name>.ts — data fetching + state
├── services/       # <name>Service.ts — API calls only
├── types/          # <name>Types.ts
├── utils/          # <name>Utils.ts
└── index.ts        # Barrel export
```

---

## Three-Tier Component Rule

Every piece of UI belongs to exactly one tier:

### Tier 1 — UI Atoms (`src/components/ui/`)
- **No data fetching. No business logic. Props in, JSX out.**
- Every atom documented with JSDoc `@component` block.
- Exported via `src/components/ui/index.ts` barrel.

### Tier 2 — Feature Components (`src/features/<name>/components/`)
- Own their data by calling the feature's hook.
- May import Tier 1 atoms freely.
- **Must NOT import from other features directly.**

### Tier 3 — Pages (`src/pages/`)
- Thin orchestrators: call hooks, compose feature components, handle routing params.
- **Zero rendering logic** — no conditional JSX, no inline styles.
- If you add more than ~30 lines of JSX, extract a feature component.

---

## TypeScript Rules

| Rule | Description |
|------|-------------|
| Extensions | All files use `.ts` or `.tsx` |
| No `any` | Strict typing required — never use `any` |
| Interfaces | Use `interface` for object shapes |
| Types | Use `type` for unions and primitives |
| JSDoc | Required on all exported functions/components |

### JSDoc Template

```ts
/**
 * @component|@hook|@service MyThing
 * @description What it does and why it exists.
 *
 * @param {Type} props.name   Description
 * @returns {JSX.Element|type}
 */
```

---

## Route Architecture

```
/app                                    → Auth guard
/app/projects                           → Projects list (no AppShell)
/app/projects/create                    → Create project (no AppShell)
/app/projects/$projectId/*              → Project workspace (AppShell + Outlet)
```

### TanStack Router Patterns

- Route files: `kebab-case.tsx`
- Route creation: `createFileRoute("/path")`
- Parent routes auto-inferred from directory structure

### Query Key Hierarchy

All project-scoped queries **MUST** use:
```
['project', projectId, resource]
```

| Hook | Query Key |
|------|-----------|
| `useTasks(projectId)` | `['project', projectId, 'tasks']` |
| `useSprints(projectId)` | `['project', projectId, 'sprints']` |
| `useBoard(projectId)` | `['project', projectId, 'board']` |

---

## Service Layer

### apiClient (`src/services/apiClient.ts`)

Single fetch wrapper for all API calls.

```ts
import { apiClient } from '@/services/apiClient';
const data = await apiClient.get('/endpoint');
```

**Auth:** All requests send `credentials: "include"` for session cookies.
**401 handling:** `setOnUnauthorizedCallback(logout)` auto-logouts on session expiry.

### Service Rules

- Services return raw data — no React imports, no JSX
- One method per API endpoint
- All methods have JSDoc with `@param` and `@returns`

---

## Context Providers

| Provider | File | Purpose |
|----------|------|---------|
| AuthContext | `store/AuthContext.tsx` | User session, login/logout |
| ThemeRegistry | `store/ThemeRegistry.tsx` | Memoized entity color cache |
| EntityThemeRegistry | (in ThemeRegistry) | O(1) theme lookup |

Provider order in `__root.tsx`:
```
QueryClientProvider → EntityThemeRegistryProvider → ThemeRegistryProvider → AuthProvider → Outlet
```

---

## Imports

| Alias | Points to |
|-------|-----------|
| `@/` | `src/` |

- Always import from barrel exports: `import { button } from '@/components/ui'`
- Never import across features' internals
- Never use `.js` extension in imports

---

## Color System (Summary)

**See [STYLING.md](./STYLING.md) for full details.**

Entity colors (Project, Epic, Sprint, Status) follow this chain:

```
API response { color: "#3B6D11" }
      ↓
useBacklog hook calls registerEntities([{ id, color }])
      ↓
ThemeRegistry caches buildEntityTheme(hex) → CSS vars
      ↓
Feature component spreads style={{ ...theme }}
      ↓
UI atom reads var(--entity-bg), var(--entity-fg), etc.
```

---

## What NOT to Do

- ❌ Business logic in pages — pages are thin orchestrators only
- ❌ API calls in components — all fetching goes through hook → service
- ❌ Color logic in CSS — color math lives in `themeUtils.ts`
- ❌ Fetching in UI atoms — atoms receive data via props only
- ❌ Importing between features — use shared atoms
- ❌ Using `any` type
- ❌ `.js` extension in imports