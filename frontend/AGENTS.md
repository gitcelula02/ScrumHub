# AGENTS.md — ScrumHub Codebase Guide for AI Assistants

This file is the **first thing to read** before generating any code for this project.
It describes conventions, paradigms, and rules that must be followed consistently
so that new views and components feel native to the existing codebase.

---

## Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Bundler     | Vite (JSX, path alias `@/` → `src/`)|
| UI          | React 18, JavaScript (no TypeScript)|
| Styles      | Bootstrap 5 + custom CSS variables  |
| State       | React Context (no external lib)     |
| Routing     | React Router v6                     |
| HTTP        | Custom `apiClient` (fetch wrapper)  |
| Fonts       | DM Sans (body) · JetBrains Mono (code)|

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
│   └── ai/
├── hooks/                Cross-feature hooks — useEntityTheme, etc.
├── pages/                Route-level components (thin orchestrators only)
├── services/             apiClient.js — all fetch calls go through here
├── store/                React Context providers — ThemeRegistry, AuthContext
├── styles/               CSS files — see import order below
└── utils/                Pure functions — themeUtils.js, etc.
```

### Feature module structure (each feature follows this pattern)
```
features/<name>/
├── components/   UI pieces specific to this feature
├── hooks/        use<Name>.js — data fetching + state
├── services/     <name>Service.js — API calls only
└── index.js      Public barrel export
```

---

## The three-tier component rule

Every piece of UI belongs to exactly one tier. Never mix tiers.

### Tier 1 — UI Atoms (`src/components/ui/`)
- **No data fetching. No business logic. Props in, JSX out.**
- Reference only `var(--entity-*)` or `var(--color-*)` — never hardcode hex.
- Every atom is documented with JSDoc `@component` block.
- Exported via `src/components/ui/index.js` barrel.

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
- Semantic statuses (todo/done/blocked) use Bootstrap classes — NOT entity colors.
  See `StatusBadge` for the correct pattern.

---

## CSS rules

### Where colors live
```
src/styles/_variables.css      ← Brand tokens, neutrals, Bootstrap --bs-* overrides
src/styles/_bootstrap-overrides.css  ← Targeted patches after Bootstrap loads
src/styles/_utilities.css      ← .entity-badge, .entity-accent-border, helpers
```

### Import order in main.css (DO NOT change)
```css
@import './_variables.css';           /* 1. tokens must exist first */
@import 'bootstrap/dist/css/bootstrap.min.css';  /* 2. reads our --bs-* vars */
@import './_bootstrap-overrides.css'; /* 3. patches Bootstrap output */
@import './_utilities.css';           /* 4. always last */
```

### Rules for writing CSS
- Use `var(--color-*)` for all brand/neutral colors. Never hardcode hex in component CSS.
- Use Bootstrap utilities (`mb-3`, `d-flex`, `gap-2`) for spacing and layout.
- Write custom CSS only when Bootstrap doesn't cover the case.
- For entity-colored elements, only use `var(--entity-*)` variables — never compute
  colors in CSS. The computation happens in `themeUtils.js`.

---

## JSDoc requirement

Every exported component, hook, service method, and utility function must have a JSDoc block.
Minimum required tags:

```js
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
```js
 * COLOR CONTRACT:
 * [Explain whether this component sets, passes, or consumes --entity-* vars]
```

---

## How to add a new view (step-by-step)

1. **Create the page**: `src/pages/MyFeaturePage.jsx`
   - Call `useParams()` for route params
   - Call the feature hook
   - Render the feature component
   - No other logic

2. **Add the route**: in `src/App.jsx`, add a `<Route>` inside the authenticated layout

3. **Create the feature component**: `src/features/<name>/components/MyFeatureView.jsx`
   - Receives data via props from the page
   - Uses shared atoms from `@/components/ui`
   - JSDoc with full prop documentation

4. **Create the feature hook**: `src/features/<name>/hooks/use<Name>.js`
   - Calls the service
   - Calls `registerEntities()` if the data has colored entities
   - Returns `{ data, loading, error, refetch }`

5. **Create the service**: `src/features/<name>/services/<name>Service.js`
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
| Label   | `color`      | `useLabels` (future) |

---

## Naming conventions

| Thing              | Convention        | Example                    |
|--------------------|-------------------|----------------------------|
| Component files    | PascalCase        | `BacklogTable.jsx`         |
| Hook files         | camelCase         | `useBacklog.js`            |
| Service files      | camelCase         | `backlogService.js`        |
| CSS files          | _kebab-case       | `_bootstrap-overrides.css` |
| CSS variables      | --kebab-case      | `--color-brand-500`        |
| CSS entity vars    | --entity-*        | `--entity-bg`              |
| Page components    | PascalCase + Page | `BacklogPage.jsx`          |
| Context providers  | PascalCase        | `ThemeRegistry.jsx`        |

---

## What NOT to do

- ❌ `style={{ backgroundColor: '#3B6D11' }}` — use `useEntityTheme` instead
- ❌ `import { EpicBadge } from '../ui/EpicBadge'` — always import from the barrel `@/components/ui`
- ❌ Business logic in pages — pages are thin orchestrators only
- ❌ API calls in components — all fetching goes through a hook → service
- ❌ Color logic in CSS — color math lives in `themeUtils.js`
- ❌ Fetching in UI atoms — atoms receive data via props only
- ❌ Importing between features — use shared atoms or lift to a shared hook
