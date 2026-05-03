# AGENTS.md — ScrumHub Codebase Guide for AI Assistants

This file is the **first thing to read** before generating any code for this project.
It describes conventions, paradigms, and rules that must be followed consistently
so that new views and components feel native to the existing codebase.

---

## Stack

| Layer       | Technology                                           |
|-------------|------------------------------------------------------|
| Bundler     | Vite (TSX, path alias `@/` → `src/`)                |
| UI          | React 18, TypeScript                                 |
| Styles      | Tailwind CSS                                         |
| State       | TanStack Query + React Context                       |
| Routing     | TanStack Router                                      |
| HTTP        | Custom `apiClient` (fetch wrapper)                  |
| Fonts       | DM Sans (body) · JetBrains Mono (code)               |

---

## Folder structure

```
src/
├── assets/               Static files (images, icons)
├── components/
│   ├── ui/               Shared atoms — EpicBadge, StatusBadge, etc.
│   └── layout/           App shell — AppShell, Sidebar, TopBar
├── features/             Feature modules (see below)
│   ├── auth/
│   ├── projects/
│   ├── backlog/
│   ├── sprints/
│   ├── tasks/
│   ├── quest-tree/
│   ├── chatroom/
│   └── ai/
├── hooks/                Cross-feature hooks — useEntityTheme, etc.
├── pages/                Route-level components (thin orchestrators only)
├── routes/               TanStack Router route configuration
├── services/             apiClient.ts — all fetch calls go through here
├── store/                React Context providers — ThemeRegistry, AuthContext
├── styles/               Global styles, Tailwind config
├── types/                Global TypeScript types
└── utils/                Pure functions — themeUtils.ts, etc.
```

### Feature module structure (each feature follows this pattern)
```
features/<name>/
├── components/     UI pieces specific to this feature
├── hooks/          use<Name>.ts — data fetching + state
├── services/       <name>Service.ts — API calls only
├── types/          <name>Types.ts — feature-specific types
├── utils/          <name>Utils.ts — feature-specific utilities
├── styles/         <name>.module.css — feature-specific styles (if needed)
└── index.ts        Public barrel export
```

---

## The three-tier component rule

Every piece of UI belongs to exactly one tier. Never mix tiers.

### Tier 1 — UI Atoms (`src/components/ui/`)
- **No data fetching. No business logic. Props in, JSX out.**
- Reference only `var(--entity-*)` or `var(--color-*)` — never hardcode hex.
- Every atom is documented with JSDoc `@component` block.
- Exported via `src/components/ui/index.ts` barrel.

### Tier 2 — Feature Components (`src/features/<name>/components/`)
- Own their data by calling the feature's hook.
- May import Tier 1 atoms freely.
- Must NOT import from other features directly — use shared atoms instead.

### Tier 3 — Pages (`src/pages/`)
- Thin orchestrators: call hooks, compose feature components, handle routing params.
- **Zero rendering logic** — no conditional JSX, no inline styles, no data transformation.
- If you add more than ~30 lines of JSX to a page, extract a feature component.

---

## Dynamic color system (most important paradigm)

User-defined colors are stored as hex strings on entity records (Project, Epic, Sprint).
**Components never receive raw hex — they only consume CSS variables.**

### The chain (follow this exactly for any new colored component)

```
API response { color: "#3B6D11" }
      ↓
useBacklog hook calls registerEntities([{ id, color }])
      ↓
ThemeRegistry caches buildEntityTheme(hex) → CSS vars object
      ↓
Feature component calls useEntityTheme(entity.color)
      ↓
Spreads result as style={{ ...theme }} on the container element
      ↓
UI atom reads var(--entity-bg), var(--entity-fg), var(--entity-border)
```

### CSS variables injected by useEntityTheme / ThemeRegistry
| Variable          | Value                        | Usage                    |
|-------------------|------------------------------|--------------------------|
| `--entity-bg`     | hex at 12% alpha             | Badge fill, row tint     |
| `--entity-fg`     | auto-contrasted text color   | Text on colored bg       |
| `--entity-border` | hex at 45% alpha             | Border, left accent line |
| `--entity-solid`  | full hex                     | Color dot, icon fill     |

### Rules
- **Never pass `color` as a prop into a UI atom.** Use `useEntityTheme` at the
  feature component level and spread `style={theme}` on the container.
- **CSS variable scoping is automatic** — each container's `--entity-*` vars
  only apply to its subtree. Sibling badges with different colors never collide.
- Semantic statuses (todo/done/blocked) use Tailwind color classes — NOT entity colors.
  See `StatusBadge` for the correct pattern.

---

## Tailwind CSS rules

### Configuration
- Tailwind is configured in `tailwind.config.ts`
- Custom colors defined as CSS variables in `src/styles/globals.css`
- Use `var(--color-*)` for brand/neutral colors

### Rules for writing styles
- Use Tailwind utility classes for all styling
- Use `var(--color-*)` for brand/neutral colors. Never hardcode hex.
- Write custom CSS only when Tailwind doesn't cover the case (rare)
- For entity-colored elements, only use `var(--entity-*)` variables — never compute
  colors in CSS. The computation happens in `themeUtils.ts`.

### Import order in main CSS
```css
@import './globals.css';          /* 1. CSS variables and base styles */
@import 'tailwindcss/base';       /* 2. Tailwind base */
@import 'tailwindcss/components'; /* 3. Tailwind components */
@import 'tailwindcss/utilities';   /* 4. Tailwind utilities */
```

---

## TypeScript rules

- All files use `.ts` or `.tsx` extension
- Strict typing required — no `any` types
- Use interfaces for object shapes
- Use type for unions and primitives
- JSDoc still required on all exported functions/components

---

## JSDoc requirement

Every exported component, hook, service method, and utility function must have a JSDoc block.
Minimum required tags:

```ts
/**
 * @component|@hook|@service|@module MyThing
 * @description What it does and why it exists.
 *
 * @param {Type} props.name   Description
 * @returns {JSX.Element|type}
 *
 * @example
 * <MyThing prop="value" />
 */
```

For components that participate in the color system, add:
```ts
 * COLOR CONTRACT:
 * [Explain whether this component sets, passes, or consumes --entity-* vars]
```

---

## How to add a new view (step-by-step)

1. **Create the page**: `src/pages/MyFeaturePage.tsx`
   - Call `useParams()` for route params
   - Call the feature hook
   - Render the feature component
   - No other logic

2. **Add the route**: in `src/routes/index.ts`, add a route using TanStack Router

3. **Create the feature component**: `src/features/<name>/components/MyFeatureView.tsx`
   - Receives data via props from the page
   - Uses shared atoms from `@/components/ui`
   - JSDoc with full prop documentation

4. **Create the feature hook**: `src/features/<name>/hooks/use<Name>.ts`
   - Uses TanStack Query to call the service
   - Calls `registerEntities()` if the data has colored entities
   - Returns `{ data, loading, error, refetch }`

5. **Create the service**: `src/features/<name>/services/<name>Service.ts`
   - Uses `apiClient` from `@/services/apiClient`
   - One method per API endpoint
   - JSDoc on every method with `@param` and `@returns`

6. **If entities have user colors**:
   - In the hook: call `registerEntities(data.map(e => ({ id: e.id, color: e.color })))`
   - In the feature component: `const theme = useEntityTheme(entity.color)` → `style={theme}`
   - In the UI atom: use `var(--entity-bg/fg/border/solid)` only

---

## Color-carrying entities

| Entity  | Stored field | Registered by hook   |
|---------|--------------|----------------------|
| Project | `color`      | `useProjects`        |
| Epic    | `color`      | `useBacklog`         |
| Sprint  | `color`      | `useSprints`         |
| Status  | `color`      | `useBoards`          |

---

## Naming conventions

| Thing              | Convention           | Example                    |
|--------------------|----------------------|----------------------------|
| Component files    | PascalCase           | `BacklogTable.tsx`         |
| Hook files         | camelCase            | `useBacklog.ts`            |
| Service files      | camelCase            | `backlogService.ts`        |
| Type files         | camelCase            | `backlogTypes.ts`          |
| CSS files          | _kebab-case          | `_bootstrap-overrides.css` |
| CSS variables      | --kebab-case         | `--color-brand-500`        |
| CSS entity vars    | --entity-*           | `--entity-bg`              |
| Page components    | PascalCase + Page    | `BacklogPage.tsx`          |
| Context providers  | PascalCase           | `ThemeRegistry.tsx`        |
| Route files        | routes.ts            | `routes.ts`                |

---

## What NOT to do

- ❌ `style={{ backgroundColor: '#3B6D11' }}` — use `useEntityTheme` instead
- ❌ `import { EpicBadge } from '../ui/EpicBadge'` — always import from the barrel `@/components/ui`
- ❌ Business logic in pages — pages are thin orchestrators only
- ❌ API calls in components — all fetching goes through a hook → service
- ❌ Color logic in CSS — color math lives in `themeUtils.ts`
- ❌ Fetching in UI atoms — atoms receive data via props only
- ❌ Importing between features — use shared atoms or lift to a shared hook
- ❌ Using `any` type — always use proper TypeScript types
- ❌ Using `.js` extension in imports — use `.ts` or `.tsx` as appropriate