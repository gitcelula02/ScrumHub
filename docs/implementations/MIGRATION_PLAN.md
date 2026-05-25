# ScrumHub Frontend Architecture Migration Plan

> ⚠️ **OBSOLETE** — This document describes a migration that has already been completed. The target state described below is the current production state. Do not use this document for implementation guidance. Refer to the actual architecture docs instead.

---

## Overview

This plan outlines the migration of the current `frontend/` codebase to the architecture defined in `docs/core/TRUTH.md`, `docs/core/ARCHITECTURE.md`, and `docs/core/STYLING.md`.

**Current State (as of 2026-05-25):**
- ✅ Native Vite config with explicit plugins
- ✅ Feature-first architecture with strict boundaries
- ✅ Tailwind CSS v4 with oklch CSS variables
- ✅ TanStack Router + TanStack Query
- ✅ React Context for global state
- ✅ TypeScript only (`.ts`/`.tsx`)
- ✅ shadcn/ui component library

**Target State (achieved):** Same as current state above.

---

## S1-S12: All migrations marked COMPLETE

The frontend architecture migration described in this document has been completed. The codebase now matches the target state described in TRUTH.md, ARCHITECTURE.md, and STYLING.md.

---

## References

For current architecture documentation, see:
- [TRUTH.md](../core/TRUTH.md) — Non-negotiable rules
- [ARCHITECTURE.md](../core/ARCHITECTURE.md) — Folder structure and code conventions
- [STYLING.md](../core/STYLING.md) — Tailwind rules and layout conventions
- [BRAND.md](../core/BRAND.md) — Color values and typography

**Description:** Remove `@lovable.dev/vite-tanstack-config` and configure Vite natively with explicit plugins. This is critical — incorrect configuration will break Tailwind CSS and routing.

**Reference:** TRUTH.md:506-507 (`vite.config.ts`), FRONTEND_STYLING.md:528-543 (Tailwind Vite plugin)

**Acceptance Criteria:**
- AC1.1: `package.json` no longer contains `@lovable.dev/vite-tanstack-config`
- AC1.2: `vite.config.ts` uses native `defineConfig` with explicit plugins:
  - `@vitejs/plugin-react`
  - `vite-tsconfig-paths`
  - `tailwindcss()` (from `@tailwindcss/vite`)
  - `@tanstack/router-plugin/vite`
- AC1.3: `npm run dev` builds and serves without Lovable plugins
- AC1.4: `npm run build` completes successfully
- AC1.5: All Tailwind classes render correctly (verify with a component using `bg-sidebar-bg`)

**Dependencies:** None
**Estimated Effort:** 15-20 minutes
**Status:** NOT_STARTED

---

## S2: Create Global Directory Structure

**Description:** Set up the global directories as mandated by TRUTH.md:459-485.

**Reference:** TRUTH.md:459-485, AGENTS.md:23-60

**Acceptance Criteria:**
- AC2.1: `src/services/apiClient.ts` exists with fetch wrapper (base URL from `VITE_API_URL`, defaults to `http://localhost:3000/api`)
- AC2.2: `src/store/` exists with `AuthContext.tsx`, `ThemeRegistry.tsx`, `useAuth.ts`, `useThemeRegistry.ts`
- AC2.3: `src/hooks/` exists with `useAuthGuard.ts`, `useAuthRedirect.ts`, `useEntityTheme.ts`
- AC2.4: `src/components/layout/` exists with `AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `MobileMenu.tsx`
- AC2.5: `src/components/ui/` exists with barrel export `index.ts`
- AC2.6: `src/utils/themeUtils.ts` exists with color math functions
- AC2.7: `src/types/` exists for global TypeScript types
- AC2.8: `src/styles/globals.css` exists with oklch CSS variables

**Dependencies:** S1
**Estimated Effort:** 20-25 minutes
**Status:** NOT_STARTED

---

## S3: Migrate Shared UI Components to TypeScript

**Description:** Migrate existing UI components from `components/scrumhub/` and `components/ui/` to TypeScript with proper types.

**Reference:** TRUTH.md:468-473, AGENTS.md:68-82 (three-tier rule)

**Acceptance Criteria:**
- AC3.1: All components in `components/ui/` are `.tsx` with proper TypeScript interfaces
- AC3.2: All components in `components/layout/` are `.tsx` with proper TypeScript interfaces
- AC3.3: UI atoms (`components/ui/`) contain no data fetching, no side effects
- AC3.4: All exported components have JSDoc with `@component` tag
- AC3.5: `components/ui/index.ts` provides barrel export for all UI atoms
- AC3.6: No hardcoded hex colors in components — use CSS variables only

**Dependencies:** S2
**Estimated Effort:** 20-25 minutes
**Status:** NOT_STARTED

---

## S4: Create Feature Module Directory Structure

**Description:** Create the `features/` directory structure per TRUTH.md:486-502 and AGENTS.md:50-60.

**Reference:** TRUTH.md:486-502, AGENTS.md:50-60, FRONTEND_ARCHITECTURE.md:7-74

**Acceptance Criteria:**
- AC4.1: `src/features/` contains all domains: `auth/`, `backlog/`, `board/`, `calendar/`, `chat/`, `overview/`, `projects/`, `settings/`, `sprints/`, `tasks/`, `quest-tree/`, `ai/`, `workspace/`
- AC4.2: Each feature directory has: `components/`, `hooks/`, `services/`, `types/`, `utils/`, `styles/`
- AC4.3: Each feature has `index.ts` barrel export
- AC4.4: Features must NOT import from each other's internals

**Dependencies:** S2
**Estimated Effort:** 15-20 minutes
**Status:** NOT_STARTED

---

## S5: Migrate Feature Services to TypeScript

**Description:** Migrate existing feature services to `src/features/*/services/` with TypeScript types.

**Reference:** TRUTH.md:491-492, AGENTS.md:205-213

**Acceptance Criteria:**
- AC5.1: All services use `apiClient` from `@/services/apiClient`
- AC5.2: All services have TypeScript types for request/response
- AC5.3: All exported service functions have JSDoc with `@service` tag
- AC5.4: No `.js` files remain in feature services directories

**Dependencies:** S4
**Estimated Effort:** 20-25 minutes
**Status:** NOT_STARTED

---

## S6: Migrate Feature Hooks to TypeScript

**Description:** Migrate existing feature hooks to TypeScript with proper state typing.

**Reference:** TRUTH.md:497-498, AGENTS.md:200-213

**Acceptance Criteria:**
- AC6.1: All hooks use TanStack Query for data fetching
- AC6.2: All hooks have proper TypeScript types for state and return values
- AC6.3: Hooks register entity colors via `useThemeRegistry().registerEntities()`
- AC6.4: All exported hooks have JSDoc with `@hook` tag
- AC6.5: No `any` types — use proper generics or explicit types

**Dependencies:** S5
**Estimated Effort:** 20-25 minutes
**Status:** NOT_STARTED

---

## S7: Migrate Feature Components to TypeScript

**Description:** Migrate existing feature components to TypeScript with dumb/smart separation.

**Reference:** TRUTH.md:488-490, AGENTS.md:74-82, FRONTEND_ARCHITECTURE.md:74-82

**Acceptance Criteria:**
- AC7.1: Feature components (`features/*/components/`) are thin — own data via hooks only
- AC7.2: Components receive data via props, not direct state access
- AC7.3: Components use Tier 1 atoms from `@/components/ui` (barrel import)
- AC7.4: Components use `useEntityTheme()` for entity colors, not hardcoded hex
- AC7.5: No side effects (useEffect, useState) in presentational components

**Dependencies:** S6
**Estimated Effort:** 25-30 minutes
**Status:** NOT_STARTED

---

## S8: Configure TanStack Router

**Description:** Set up TanStack Router with proper file-based routing configuration.

**Reference:** TRUTH.md:480-481, AGENTS.md:11-18, react-vite-ts-expert/SKILL.md:298-331

**Acceptance Criteria:**
- AC8.1: `src/routes/routes.ts` exists with proper route tree
- AC8.2: Public routes: `/`, `/login`, `/register`
- AC8.3: Authenticated routes under AppShell with all project views
- AC8.4: `src/pages/` components are thin orchestrators (useParams → call hook → render feature component)
- AC8.5: No business logic in pages — only routing and composition

**Dependencies:** S7
**Estimated Effort:** 20-25 minutes
**Status:** NOT_STARTED

---

## S9: Set Up TanStack Query

**Description:** Configure TanStack Query provider in the app root.

**Reference:** TRUTH.md:340, AGENTS.md:16, react-vite-ts-expert/SKILL.md:67

**Acceptance Criteria:**
- AC9.1: `QueryClientProvider` wraps the app in `main.tsx`
- AC9.2: `QueryClient` configured with sensible defaults
- AC9.3: Feature hooks use TanStack Query (not useState/useEffect directly for server state)

**Dependencies:** S8
**Estimated Effort:** 10-15 minutes
**Status:** NOT_STARTED

---

## S10: Migrate Global Styles to oklch/Tailwind

**Description:** Replace Bootstrap-based CSS with Tailwind CSS v4 and oklch CSS variables.

**Reference:** FRONTEND_STYLING.md:1-567, TRUTH.md:482-483

**Acceptance Criteria:**
- AC10.1: `src/styles/globals.css` uses oklch CSS variables (no Bootstrap)
- AC10.2: All color tokens use oklch format (e.g., `oklch(0.22 0 0)`)
- AC10.3: Components use `bg-editor`, `text-sidebar-fg`, etc. (Tailwind + CSS vars)
- AC10.4: No `bg-[#hex]` inline styles
- AC10.5: Entity colors use `--entity-bg`, `--entity-fg`, `--entity-border`, `--entity-solid` only

**Dependencies:** S1
**Estimated Effort:** 25-30 minutes
**Status:** NOT_STARTED

---

## S11: Verify TypeScript Strictness

**Description:** Ensure all migrated code passes strict TypeScript checks.

**Reference:** AGENTS.md:152, react-vite-ts-expert/SKILL.md:31

**Acceptance Criteria:**
- AC11.1: `tsc --noEmit` passes without errors
- AC11.2: No `any` types anywhere in the codebase
- AC11.3: All exported functions/components have JSDoc documentation
- AC11.4: Interfaces used for object shapes, `type` for unions

**Dependencies:** S10
**Estimated Effort:** 15-20 minutes
**Status:** NOT_STARTED

---

## S12: Final Verification and Cleanup

**Description:** Final verification that the migration is complete and consistent.

**Acceptance Criteria:**
- AC12.1: `npm run dev` starts without errors
- AC12.2: `npm run build` completes successfully
- AC12.3: All routes navigate correctly
- AC12.4: Entity colors render correctly (verify with a colored epic/project)
- AC12.5: No `.js` or `.jsx` files in `src/` — all TypeScript
- AC12.6: No Bootstrap CSS classes remaining

**Dependencies:** S11
**Estimated Effort:** 15-20 minutes
**Status:** NOT_STARTED

---

## Implementation Order

```
S1 (Replace Lovable) → S2 (Global Structure)
                          ↓
S3 (UI Components) ← S4 (Feature Structure)
                          ↓
S5 (Feature Services) → S6 (Feature Hooks) → S7 (Feature Components)
                                                      ↓
S8 (TanStack Router) ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
      ↓
S9 (TanStack Query) → S10 (Styles) → S11 (TypeScript) → S12 (Final)
```

---

## Verification Commands

After each step, verify with:
```bash
npm run dev      # Dev server runs
npm run build    # Production build succeeds
npm run lint     # No lint errors
npx tsc --noEmit # No TypeScript errors
```

---

*Last updated: 2026-05-04*