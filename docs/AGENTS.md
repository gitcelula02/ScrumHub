# AGENTS.md — Entry Point for AI Assistants

**This file is the first thing to read before any task.**
It routes you to the correct docs and defines the workflow.
**Last updated:** 2026-05-15

---

## Reading Order

For any task, read these files **in order**:

1. **This file (AGENTS.md)** — determines which docs to read
2. **core/TRUTH.md** — non-negotiable rules (<80 lines)
3. Relevant **core/*.md** files based on task type (see below)

---

## Task-Based Routing

### Implement a new feature
1. `core/TRUTH.md` — folder naming, barrel exports, component tier rules
2. `core/ARCHITECTURE.md` — stack, directory structure, TypeScript norms
3. `core/STYLING.md` — Tailwind rules, entity colors, component specs
4. `core/UX.md` — navigation, ActivityBar, AI interactions, view behaviors
5. `core/BRAND.md` — colors (with values), typography
6. `domain/ERD.md` — entity definitions and relationships
7. `api/ENDPOINTS.md` — API endpoints (table format)
8. `features/[name]/SPEC.md` — feature spec (what to build)

### Add a UI component to an existing feature
1. `core/TRUTH.md` — three-tier rule, naming
2. `core/STYLING.md` — component specs, "what not to do"
3. `core/BRAND.md` — color values
4. `features/[name]/SPEC.md` — component requirements

### Fix a bug
1. `core/TRUTH.md` — core rules
2. `core/ARCHITECTURE.md` — service layer, query keys
3. `features/[name]/SPEC.md` — expected behavior
4. `features/[name]/STATUS.md` — current implementation state

### Add an API endpoint
1. `domain/ERD.md` — entity schema
2. `api/ENDPOINTS.md` — endpoint format (table)
3. `core/ARCHITECTURE.md` — service layer pattern
4. Update `api/ENDPOINTS.md` with new endpoint

### Update styling (CSS/Tailwind)
1. `core/STYLING.md` — Tailwind rules, anti-patterns
2. `core/BRAND.md` — color values, typography
3. `core/TRUTH.md` — entity color chain

### Update navigation/UX
1. `core/UX.md` — ActivityBar, routes, view behaviors
2. `core/STYLING.md` — layout specs
3. `features/[name]/SPEC.md` — view requirements

---

## Creating a New Feature Doc

When creating `docs/features/[name]/`:

1. Create `SPEC.md` — route, components, UX description (stable)
2. Create `STATUS.md` — implementation state (living log)
3. **After completing work, update STATUS.md** with what was done

### STATUS.md Format

```markdown
# [Feature] Status

**Last updated:** YYYY-MM-DD

## Implementation State

| Component | Status | Notes |
|-----------|--------|-------|
| Service | ✅ Done | |
| Hook | 🚧 In Progress | |
| Component | 📋 Planned | |

## Known Issues
- None

## Recent Changes
- YYYY-MM-DD: Completed service layer
```

---

## Adding a New View (Step-by-Step)

1. **Create page**: `src/pages/<Feature>Page.tsx`
   - Thin orchestrator: `useParams()` → call hook → render component

2. **Add route**: `src/routes/app/projects/$projectId/<feature>.tsx`
   - Use `createFileRoute("/app/projects/$projectId/<feature>")`

3. **Add ActivityBar item**: `src/components/layout/ActivityBar.tsx`
   - Icon, label, route path, project-only flag

4. **Create feature component**: `src/features/<name>/components/<View>.tsx`
   - Receives data via props, uses Tier 1 atoms

5. **Create feature hook**: `src/features/<name>/hooks/use<Name>.ts`
   - TanStack Query, `registerEntities()` if colored

6. **Create feature service**: `src/features/<name>/services/<name>Service.ts`
   - `apiClient` calls, JSDoc on every method

7. **Update SPEC.md** if it exists

8. **Update STATUS.md** — mark component as done

---

## Key Rules (from TRUTH.md)

- **No `any` types** — always proper TypeScript
- **Never pass raw hex to UI atoms** — use `useEntityTheme()` + CSS vars
- **Pages are thin** — no business logic, only routing and composition
- **Services fetch data** — no React imports, no JSX
- **Barrel exports** — always import from `index.ts`
- **Query keys** — always `['project', projectId, 'resource']`

---

## File Index

| File | Owns | Don't repeat here |
|------|------|-------------------|
| `core/TRUTH.md` | Non-negotiables | Styling, architecture |
| `core/BRAND.md` | Color values, typography | Rules, structure |
| `core/ARCHITECTURE.md` | Folder structure, TS norms | Colors, UX |
| `core/STYLING.md` | Tailwind rules, layouts | Values, naming |
| `core/UX.md` | Navigation, AI flows | Styling, colors |
| `domain/ERD.md` | Entity schemas | Routes, components |
| `domain/CONCEPTS.md` | Scrum terminology | Code, specs |
| `api/ENDPOINTS.md` | API endpoints (table) | UI, entities |
| `features/*/SPEC.md` | Feature requirements | Architecture |
| `features/*/STATUS.md` | Implementation state | Specs |

---

## Critical: Never Do These

- ❌ `style={{ backgroundColor: '#3B6D11' }}` — use `useEntityTheme`
- ❌ Import from other features' internals
- ❌ Business logic in pages
- ❌ `any` type
- ❌ `.js` extension in imports

---

## Questions?

If a doc is unclear or contradictory:
1. **TRUTH.md** is the source of truth for technical decisions
2. Ask for clarification before proceeding
3. Note the ambiguity so docs can be improved

---

*After any task that modifies implementation, update `features/[name]/STATUS.md`*