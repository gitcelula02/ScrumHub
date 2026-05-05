# ScrumHub Frontend Maintenance Guide

This document outlines the principles, workflows, and checklists necessary to maintain the ScrumHub frontend architecture over time.

## Design Philosophy

**"Sober, Structured, Sophisticated"**

ScrumHub embraces a UI aesthetic inspired by VS Code and professional developer tools. 
- **Sober:** No gratuitous animations, no loud colors, no "bubbly" rounded elements. Information density is high.
- **Structured:** Distinct visual hierarchy. Everything has its place in the grid, bordered and segmented.
- **Sophisticated:** Seamless developer experience with polished micro-interactions (e.g., active tab highlights, hover states).

## Dark-Only Mode Enforcement

ScrumHub is a **dark-only** application. Light mode is not supported and should not be implemented. 
- Do not use Tailwind's `dark:` variant, as the default state is already dark.
- Never use light mode colors (e.g., `bg-white`, `text-gray-900`) directly. Use the defined semantic `oklch` variables.

## Checklists

### 1. Adding New UI Components (`src/components/ui/`)

When introducing a new shared atom or UI element:

- [ ] **Color Contract:** Ensure you are exclusively using semantic CSS variables (`var(--color-primary)`, `var(--color-border)`) and not hardcoded hex values.
- [ ] **Tier Assignment:** Verify it adheres to the Three-Tier Rule (dumb atoms) and has no side effects or API calls.
- [ ] **JSDoc:** Add a complete `@component` JSDoc comment detailing its props and usage.
- [ ] **Barrel Export:** Add the export to `src/components/ui/index.ts`.
- [ ] **Styling Review:** Verify there are no `bg-gradient-*`, `shadow-2xl`, or `rounded-full` classes. See [FRONTEND_STYLING.md](./FRONTEND_STYLING.md) for details.

### 2. Adding New Features (`src/features/`)

When creating a new domain feature:

- [ ] **Directory Structure:** Create standard subdirectories: `components/`, `hooks/`, `services/`, `types/`, `utils/`, `styles/` inside `src/features/<feature-name>`.
- [ ] **Barrel Exports:** Expose the public API of the feature through `src/features/<feature-name>/index.ts`.
- [ ] **No Internal Cross-Imports:** Ensure no other feature reaches directly into this feature's internals (e.g., `import X from '@/features/auth/hooks/...'`). All cross-feature imports must use the barrel index.
- [ ] **Thin Components:** Ensure feature components only own data through hooks and do not contain complex `useEffect`/`useState` logic for remote data.

## Visual Guidelines & Anti-Patterns

For the complete design system, color tokens, and styling anti-patterns (which are actively enforced by ESLint), please read the full styling guide:

👉 **[FRONTEND_STYLING.md](./FRONTEND_STYLING.md)**
