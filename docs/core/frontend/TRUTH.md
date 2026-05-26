# TRUTH.md — Non-Negotiable Rules
**Purpose:** Absolute rules that never change. For detailed docs, see BRAND.md, ARCHITECTURE.md, STYLING.md, UX.md.
**Last updated:** 2026-05-15

---

## Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, TanStack Router & Query |
| Backend | Express.js (JavaScript), MongoDB (Mongoose), Supabase |
| AI | DeepSeek API |

## Folder Conventions

| Path | Convention |
|------|------------|
| `src/` | Main source |
| `src/features/` | Feature-first modules |
| `src/components/ui/` | Shared UI atoms |
| `src/components/layout/` | AppShell, TitleBar, etc. |
| `src/services/apiClient.ts` | Single fetch wrapper |

### Feature Module Structure
```
features/<name>/
├── components/     # Feature-specific UI
├── hooks/          # use<Name>.ts — data fetching + state
├── services/        # <name>Service.ts — API calls only
├── types/           # <name>Types.ts
├── utils/           # <name>Utils.ts
└── index.ts         # Barrel export
```

## Naming Conventions

| Thing | Convention | Example |
|-------|------------|---------|
| Component files | PascalCase | `BacklogTable.tsx` |
| Hook files | camelCase | `useBacklog.ts` |
| Service files | camelCase | `backlogService.ts` |
| Page components | PascalCase + Page | `BacklogPage.tsx` |

## Component Tier Rules

1. **UI Atoms** (`src/components/ui/`): Props in, JSX out. No data fetching. No business logic.
2. **Feature Components** (`src/features/*/components/`): Own data via feature hooks. Import UI atoms freely.
3. **Pages** (`src/pages/`): Thin orchestrators. Use `useParams()` → call hook → render component.

## Barrel Exports

- `src/components/ui/index.ts` — All UI atoms
- `src/components/layout/index.ts` — All layout components
- `features/<name>/index.ts` — Feature public API

## TypeScript Rules

- No `any` types
- Interfaces for object shapes, `type` for unions
- All exported functions/components have JSDoc

## Dynamic Color System

Entity colors (Project, Epic, Sprint, Status) use `--entity-*` CSS variables:
- `--entity-bg`, `--entity-fg`, `--entity-border`, `--entity-solid`
- **Never pass raw hex as prop to UI atoms**
- Use `useEntityTheme(hex)` at container level → spread as `style={{ ...theme }}`

## Query Key Hierarchy

All project-scoped queries: `['project', projectId, resource]`

## What NOT to Do

- ❌ `style={{ backgroundColor: '#3B6D11' }}` — use `useEntityTheme` instead
- ❌ Import from other features' internals — use shared atoms
- ❌ Business logic in pages — pages are thin orchestrators only
- ❌ Use `any` type — always use proper TypeScript types
- ❌ `.js` extension in imports — use `.ts` or `.tsx`

---

*For brand colors/typography: See [BRAND.md](BRAND.md)*
*For folder structure details: See [ARCHITECTURE.md](core/frontend/ARCHITECTURE.md)*
*For styling rules: See [STYLING.md](STYLING.md)*
*For UX/navigation: See [UX.md](UX.md)*