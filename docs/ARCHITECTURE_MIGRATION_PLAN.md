# ScrumHub Frontend Architecture Migration Plan

## Overview

This plan outlines the migration of the current `frontend/` codebase to the architecture defined in `docs/TRUTH.md`, `docs/FRONTEND_ARCHITECTURE.md`, and `docs/FRONTEND_STYLING.md`.

**Current State:**
- Vite configured via `@lovable.dev/vite-tanstack-config` (black-box)
- Components in `components/scrumhub/` (not feature-organized)
- Tailwind CSS v4 already configured (oklch CSS variables in `src/styles.css`)
- TanStack Start with file-based routing in `src/routes/`
- No `features/` directory — code is not feature-organized
- No centralized `apiClient`, `store/`, or global hooks

**Target State:**
- Native Vite config with explicit plugins (per TRUTH.md:459-507)
- Feature-first architecture with strict boundaries (TRUTH.md:486-502)
- Tailwind CSS v4 with oklch CSS variables — verified compliant with FRONTEND_STYLING.md
- TanStack Router + TanStack Query (TRUTH.md:340)
- React Context for global state (AuthContext, ThemeRegistry)
- TypeScript only (`.ts`/`.tsx`) (AGENTS.md:151-155)
- Frontend styling enforced via linting rules (FRONTEND_STYLING.md compliance)

---

## S1: Replace Lovable Vite Config with Native Configuration

**Description:** Remove `@lovable.dev/vite-tanstack-config` and configure Vite natively with explicit plugins. The Lovable config is a black-box that wraps multiple plugins (React, Tailwind, tsconfig paths, TanStack router) — extracting explicit config is required for maintainability.

**Critical Warning:** The current `vite.config.ts` explicitly states: "do NOT add them manually or the app will break with duplicate plugins." Before removing Lovable, you MUST identify all plugins it injects so they can be explicitly re-added.

**How to extract Lovable config:** Run `npm info @lovable.dev/vite-tanstack-config` or inspect its source to enumerate included plugins. The vite.config.ts comment already hints at them: `tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare, componentTagger, VITE_* env injection, @ path alias, React/TanStack dedupe`.

**Reference:** TRUTH.md:506-507 (`vite.config.ts`), FRONTEND_STYLING.md:528-543 (Tailwind Vite plugin), react-vite-ts-expert/SKILL.md

**Acceptance Criteria:**
- AC1.1: `package.json` `devDependencies` no longer contains `@lovable.dev/vite-tanstack-config`
- AC1.2: `vite.config.ts` uses native `defineConfig` with these explicit plugins:
  - `@vitejs/plugin-react` (React support)
  - `vite-tsconfig-paths` (path aliases)
  - `tailwindcss()` (from `@tailwindcss/vite`)
  - `@tanstack/router-plugin/vite` (TanStack Router code generation)
  - Any remaining plugins previously provided by Lovable (cloudflare, componentTagger, etc.)
- AC1.3: Environment variables (`VITE_*`) continue to work (Lovable auto-injected these)
- AC1.4: `@/` path alias continues to resolve (configured via tsconfig paths)
- AC1.5: `npm run dev` builds and serves without Lovable plugins
- AC1.6: `npm run build` completes successfully
- AC1.7: All Tailwind classes render correctly (verify with `bg-sidebar-bg`)

**Dependencies:** None
**Estimated Effort:** 30-45 minutes (extracting black-box config is non-trivial)
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

## S10: Verify Styles Compliance with FRONTEND_STYLING.md

**Description:** The codebase already uses Tailwind CSS v4 with oklch CSS variables (in `src/styles.css`). This step verifies the existing CSS matches FRONTEND_STYLING.md requirements and identifies any deviations.

**Note on Bootstrap:** The current `src/styles.css` does NOT contain Bootstrap — it uses Tailwind v4 with oklch variables. The migration plan previously assumed Bootstrap was present. This step focuses on compliance verification, not replacement.

**Reference:** FRONTEND_STYLING.md:1-567 (entire document — color system, typography, spacing, component specs, anti-patterns)

**Acceptance Criteria:**
- AC10.1: `src/styles.css` defines all required CSS variables from FRONTEND_STYLING.md:14-56 (VS Code semantic tokens, UI semantic tokens, status/priority tokens)
- AC10.2: Typography uses `font-sans: "Segoe UI"...` and `font-mono: "JetBrains Mono"...` (FRONTEND_STYLING.md:72-75)
- AC10.3: Base font size is 13px (FRONTEND_STYLING.md:79)
- AC10.4: No hardcoded hex values in `styles.css` — all colors use oklch format
- AC10.5: No Bootstrap classes (`container-fluid`, `row`, `col-`, etc.) anywhere in `src/`
- AC10.6: No `bg-[#hex]` inline styles in any component (verify with grep for `bg-\[#`)
- AC10.7: Anti-patterns from FRONTEND_STYLING.md:376-462 are not present:
  - No gradients (`bg-gradient-*`)
  - No heavy shadows (`shadow-2xl`, `shadow-[0_10px...]`)
  - No fully rounded pills (`rounded-full`)
  - No vivid saturated backgrounds on large areas
  - No neon/glowing effects
  - No inline hex styles
  - No light mode colors in dark-only context

**Dependencies:** S1
**Estimated Effort:** 20-25 minutes
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
- AC12.3: All routes navigate correctly (verify at least one authenticated route and one public route)
- AC12.4: Entity colors render correctly (verify with a colored epic/project if test data exists)
- AC12.5: No `.js` or `.jsx` files in `src/` — all TypeScript
- AC12.6: No Bootstrap CSS classes present (grep for `container-fluid`, `row`, `col-`, `btn-`)
- AC12.7: All 13 feature modules exist under `src/features/`
- AC12.8: Global directories exist: `services/`, `store/`, `hooks/`, `types/`, `utils/`, `styles/`
- AC12.9: `src/components/ui/index.ts` provides barrel export for all Tier 1 atoms
- AC12.10: `src/components/layout/` contains AppShell, Sidebar, TopBar, MobileMenu

**Dependencies:** S11
**Estimated Effort:** 15-20 minutes
**Status:** NOT_STARTED

---

## S13: Frontend Maintenance Enablement

**Description:** Establish tooling and documentation to ensure the migrated architecture is maintained over time. This addresses the requirement to keep the frontend maintainable after migration.

**Reference:** FRONTEND_STYLING.md:376-462 (anti-patterns), AGENTS.md:160-180 (what NOT to do)

**Acceptance Criteria:**
- AC13.1: ESLint rules detect anti-patterns from FRONTEND_STYLING.md:
  - No `bg-gradient-*` classes
  - No `shadow-2xl` or larger shadow utilities
  - No `rounded-full` classes
  - No inline hex styles (`style={{ backgroundColor: '#...' }}`)
  - No light mode color classes (`bg-white`, `text-gray-900`, etc.)
- AC13.2: ESLint rules detect architectural violations:
  - No business logic in `pages/` (thin orchestrator rule)
  - No direct API calls in components (must use hooks)
  - No `any` types
  - No imports between features' internals (cross-feature imports must use shared atoms only)
- AC13.3: `docs/FRONTEND_STYLING.md` anti-patterns are referenced in ESLint config via a custom rule or comment explaining enforcement
- AC13.4: `docs/MAINTENANCE.md` exists with:
  - Design philosophy ("Sober, Structured, Sophisticated" — VS Code aesthetic)
  - Dark-only mode enforcement
  - Checklist for adding new components (color contract, JSDoc, tier assignment)
  - Checklist for adding new features (directory structure, barrel exports)
  - Link to FRONTEND_STYLING.md for complete visual guidelines
- AC13.5: `src/styles.css` or a companion file documents the CSS variable naming convention for Tailwind integration

**Dependencies:** S12
**Estimated Effort:** 30-40 minutes (ESLint config + documentation)
**Status:** NOT_STARTED

---

## S14: Update TRUTH.md to Reflect Completed Migration

**Description:** After all migration steps, update `docs/TRUTH.md` to mark the architecture as implemented and remove any "target state" language that implies the architecture is not yet in place.

**Reference:** TRUTH.md:1-7 (this file is the source of truth — must stay current)

**Acceptance Criteria:**
- AC14.1: TRUTH.md no longer describes the target architecture as "future state" — language reflects that `src/features/`, `src/services/`, `src/store/`, etc. are implemented
- AC14.2: Any section in TRUTH.md that described "what should exist" vs "what exists" is updated to reflect actual state
- AC14.3: A new section in TRUTH.md (or a companion `docs/ARCHITECTURE_STATUS.md`) documents when the migration completed (date) and any known remaining imperfections

**Dependencies:** S13
**Estimated Effort:** 10-15 minutes
**Status:** NOT_STARTED

---

## Implementation Order

```
S1 (Replace Lovable) ──────────────────────────────── → S2 (Global Structure)
                                                              ↓
S3 (UI Components) ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← S4 (Feature Structure)
                                                              ↓
S5 (Feature Services) → S6 (Feature Hooks) → S7 (Feature Components)
                                                              ↓
S8 (TanStack Router) ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
      ↓
S9 (TanStack Query) → S10 (Styles Compliance) → S11 (TypeScript) → S12 (Final)
                                                                          ↓
                                                              S13 (Maintenance) → S14 (Update TRUTH.md)
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

After S12 (Final Verification), also run:
```bash
# Verify no Bootstrap classes
rg "container-fluid|row|col-|btn-" frontend/src/
# Verify no inline hex styles
rg 'style={{.*#[0-9A-Fa-f]' frontend/src/
# Verify no gradients
rg "bg-gradient" frontend/src/
```

After S13 (Maintenance), verify:
```bash
npm run lint     # Should now flag style anti-patterns
```

---

## Current Codebase vs Target

| What Exists Now | Target State | Migration Step |
|-----------------|--------------|----------------|
| `vite.config.ts` using Lovable black-box | Native Vite with explicit plugins | S1 |
| `src/styles.css` (Tailwind v4, oklch) ✓ | Verified compliant with FRONTEND_STYLING.md | S10 |
| `components/scrumhub/` (mixed layout + feature) | Feature-first in `src/features/` | S4, S7 |
| `src/routes/` (file-based routing) | Routes + thin page orchestrators | S8 |
| No `features/` directory | 13 feature modules | S4 |
| No `services/apiClient.ts` | Centralized fetch wrapper | S2 |
| No `store/` (AuthContext, ThemeRegistry) | Context providers | S2 |
| No global hooks (`useEntityTheme`, etc.) | Global hooks | S2 |
| No `src/components/ui/` barrel | Shared UI atoms | S3 |
| No `src/components/layout/` | Layout components | S3 |
| TanStack Query not configured | QueryClient in app root | S9 |
| No `src/types/` | Global TypeScript types | S2 |
| No `src/utils/themeUtils.ts` | Color math utilities | S2 |
| ESLint without style enforcement | Style + architecture lint rules | S13 |
| TRUTH.md describes target state | TRUTH.md reflects actual state | S14 |

*Last updated: 2026-05-04*