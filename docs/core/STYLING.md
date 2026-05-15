# STYLING.md — Tailwind Rules & Layout Conventions

**This file owns:** Tailwind usage, entity colors, AppShell layout, component styles.
**For color values:** See [BRAND.md](./BRAND.md)
**Last updated:** 2026-05-15

---

## Tailwind CSS Rules

### Configuration

- Tailwind v4 with `@tailwindcss/vite` plugin
- Custom colors defined as CSS variables in `src/styles/globals.css`
- Use `var(--color-*)` for brand/neutral colors

### CSS Variable Map

| CSS Variable | Tailwind Equivalent |
|--------------|---------------------|
| `--editor` | `bg-editor` |
| `--sidebar-bg` | `bg-sidebar-bg` |
| `--sidebar-fg` | `text-sidebar-fg` |
| `--activity-bar` | `bg-activity-bar` |
| `--activity-bar-fg` | `text-activity-bar-fg` |
| `--activity-bar-active` | `bg-activity-bar-active` |
| `--status-bar` | `bg-status-bar` |
| `--status-bar-fg` | `text-status-bar-fg` |
| `--tab-active` | `bg-tab-active` |
| `--tab-inactive` | `bg-tab-inactive` |
| `--list-hover` | `hover:bg-list-hover` |
| `--list-active` | `bg-list-active` |
| `--panel-border` | `border-panel-border` |
| `--primary` | `bg-primary` |
| `--muted-foreground` | `text-muted-foreground` |

---

## Entity Color System

**CRITICAL:** Entity colors (Project, Epic, Sprint, Status) are computed at runtime from user-defined hex.

### The Chain

```
API response: { color: "#3B6D11", id: 1, ... }
        ↓
Feature hook calls registerEntities([{ id: 1, color: "#3B6D11" }])
        ↓
ThemeRegistry caches buildEntityTheme(hex) → CSS vars object
        ↓
Feature component calls useEntityTheme(entity.color)
        ↓
Spreads result as style={{ ...theme }} on container element
        ↓
UI atom reads var(--entity-bg), var(--entity-fg), var(--entity-border), var(--entity-solid)
```

### CSS Variables (Runtime-Computed)

| Variable | Value | Usage |
|----------|-------|-------|
| `--entity-solid` | full hex | Color dot, icon fill |
| `--entity-bg` | hex at 12% alpha | Badge fill, row tint |
| `--entity-border` | hex at 45% alpha | Border, left accent line |
| `--entity-fg` | auto-contrasted | Text on colored background |

### Color-Carrying Entities

| Entity | Color Field | Registered By |
|--------|-------------|--------------|
| Project | `color` | `useProjects` |
| Epic | `color` | `useBacklog` |
| Sprint | `color` | `useSprints` |
| Status | `color` | `useBoards` |

---

## Layout Architecture (AppShell)

### VS Code Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  TitleBar (h-8)                                                 │
├────┬────────────────────────────────────────────────────────────┤
│    │  TabBar (h-9)                                              │
│ A  ├────────────────────────────────────────────┬──────────────┤
│ C  │                                            │              │
│ T  │         Main Content Area                  │ Properties   │
│ I  │         (flex-1)                           │ Panel        │
│ V  │         <Outlet />                         │ (w-72)       │
│    │                                            │              │
│ B  ├────────────────────────────────────────────┴──────────────┤
│ A  │  Explorer (w-64, collapsible)                          │
├────┴────────────────────────────────────────────────────────────┤
│  StatusBar (h-6)                                                │
└─────────────────────────────────────────────────────────────────┘
```

### AppShell in Route Tree

`src/routes/app/projects/$projectId/route.tsx`:
```tsx
function ProjectLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
```

---

## Component Specifications

### Buttons

```tsx
// Default — primary action
className="bg-primary text-primary-foreground shadow hover:bg-primary/90"

// Destructive
className="bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"

// Outline
className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"

// Ghost
className="hover:bg-accent hover:text-accent-foreground"
```

**Sizes:** Default `h-9 px-4 py-2`, Small `h-8 px-3 text-xs`, Large `h-10 px-8`, Icon `h-9 w-9`

### Cards

```tsx
<Card className="rounded-xl border bg-card text-card-foreground shadow">
  <CardHeader />
  <CardTitle />
  <CardDescription />
  <CardContent />
  <CardFooter />
</Card>
```

### Inputs

```tsx
className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
```

---

## What NOT to Do

### ❌ Gradients
```tsx
// WRONG
className="bg-gradient-to-r from-purple-600 to-blue-600"

// CORRECT
className="bg-primary"
```

### ❌ Heavy Shadows
```tsx
// WRONG
className="shadow-2xl"
className="shadow-[0_10px_40px_rgba(0,0,0,0.5)]"

// CORRECT — only shadow-sm or shadow
className="shadow-sm"
```

### ❌ Fully Rounded Pills
```tsx
// WRONG
className="rounded-full px-6 py-3"

// CORRECT
className="rounded-md px-4 py-2"
className="rounded-xl"
```

### ❌ Vivid Saturated Backgrounds
```tsx
// WRONG
className="bg-blue-600"

// CORRECT — muted, dark surfaces
className="bg-sidebar-bg"
```

### ❌ Neon/Glowing Effects
```tsx
// WRONG
className="shadow-[0_0_20px_rgba(37,99,235,0.5)]"

// CORRECT
className="shadow-sm"
```

### ❌ Inline Styles for Colors
```tsx
// WRONG
style={{ backgroundColor: '#3B6D11' }}

// CORRECT — use CSS variables via Tailwind
className="bg-sidebar-bg"
```

### ❌ Entity Color Props to Atoms
```tsx
// WRONG — passing color as prop to atom
<EpicBadge color={epic.color} />

// CORRECT — compute theme at container, use entity CSS vars
<div style={useEntityTheme(epic.color)}>
  <EpicBadge />
</div>
```

---

## Tailwind Config (vite.config.ts)

```ts
import tailwindcss from "@tailwindcss/vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
  ],
})
```

---

## CSS Import Order

1. Tailwind base (via `@tailwindcss/vite` plugin)
2. Custom CSS variables in `src/styles/globals.css`
3. Component-specific styles (rare — prefer Tailwind)

```css
@import './globals.css';
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
```