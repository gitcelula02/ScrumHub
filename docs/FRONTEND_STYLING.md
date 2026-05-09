# FRONTEND_STYLING.md — ScrumHub Visual Language & Maintenance Guide

**Design Philosophy:** "Sober, Structured, Sophisticated" — A premium code editor (IDE) aesthetic.
**Theme:** Default dark theme implemented via semantic CSS variables. The variable-based color system enables future theme support and high UI customization. Never assume the theme is hardcoded.

---

## 1. COLOR SYSTEM

All colors use **oklch** for perceptual uniformity. CSS variables are defined in `src/styles/globals.css` under `:root`. **Never hardcode hex values.**

The color system has **two layers**:

### 1.1 Static Semantic Tokens (Theme-Agnostic UI)

These define the VS Code-inspired dark theme palette for structural UI elements. They use `--color-*` prefixes and map to Tailwind via `@theme inline`.

### VS Code Semantic Tokens

| Variable | Value (oklch) | Usage |
|----------|---------------|-------|
| `--editor` | `oklch(0.22 0 0)` | Main content background |
| `--sidebar-bg` | `oklch(0.25 0 0)` | Sidebar panels, Explorer |
| `--sidebar-fg` | `oklch(0.83 0 0)` | Sidebar text |
| `--activity-bar` | `oklch(0.30 0 0)` | Left activity rail |
| `--activity-bar-fg` | `oklch(0.66 0 0)` | Inactive icons |
| `--activity-bar-active` | `oklch(0.95 0 0)` | Active icon / left indicator |
| `--status-bar` | `oklch(0.55 0.16 250)` | Bottom status bar (blue) |
| `--status-bar-fg` | `oklch(0.98 0 0)` | Status bar text |
| `--tab-active` | `oklch(0.22 0 0)` | Active tab background |
| `--tab-inactive` | `oklch(0.18 0 0)` | Inactive tabs background |
| `--tab-border` | `oklch(0.55 0.16 250)` | Active tab top border (blue accent) |
| `--list-hover` | `oklch(0.30 0.005 270)` | Row hover background |
| `--list-active` | `oklch(0.36 0.06 250)` | Selected row background |
| `--panel-border` | `oklch(0.32 0 0)` | Borders, dividers |
| `--titlebar` | `oklch(0.27 0 0)` | Title bar background |

### UI Semantic Tokens

| Variable | Value (oklch) | Usage |
|----------|---------------|-------|
| `--primary` | `oklch(0.55 0.16 250)` | Primary actions (blue) |
| `--primary-foreground` | `oklch(0.98 0 0)` | Text on primary |
| `--secondary` | `oklch(0.30 0 0)` | Secondary surfaces |
| `--muted` | `oklch(0.27 0 0)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.62 0 0)` | Secondary text |
| `--accent` | `oklch(0.36 0.06 250)` | Accent highlights |
| `--destructive` | `oklch(0.60 0.22 27)` | Destructive actions (red) |
| `--border` | Same as `--panel-border` | Standard border |
| `--input` | `oklch(0.24 0 0)` | Input field background |
| `--ring` | `oklch(0.55 0.16 250)` | Focus rings |

### Status & Priority Tokens

| Variable | Value (oklch) | Usage |
|----------|---------------|-------|
| `--priority-high` | `oklch(0.65 0.22 25)` | High priority (red-orange) |
| `--priority-med` | `oklch(0.78 0.16 75)` | Medium priority (yellow) |
| `--priority-low` | `oklch(0.70 0.14 160)` | Low priority (green) |
| `--status-todo` | `oklch(0.65 0 0)` | Todo status (gray) |
| `--status-progress` | `oklch(0.70 0.15 220)` | In progress (blue) |
| `--status-done` | `oklch(0.68 0.16 150)` | Done status (green) |

### 1.2 Dynamic Entity Colors (User-Defined, Runtime-Computed)

These CSS variables (`--entity-*`) are computed at **runtime** from user-defined hex colors on Project, Epic, Sprint, and Status entities. They are **NOT** static tokens — they change per entity.

| Variable | Computation | Usage |
|----------|-------------|-------|
| `--entity-bg` | hex at 12% alpha | Badge fill, row tint |
| `--entity-fg` | auto-contrasted text color | Text on colored background |
| `--entity-border` | hex at 45% alpha | Border, left accent line |
| `--entity-solid` | full hex | Color dot, icon fill |

**The Entity Color Chain (follow this exactly):**

```
API response: { color: "#3B6D11", id: 1, ... }
        ↓
Feature hook calls registerEntities([{ id: 1, color: "#3B6D11" }])
        ↓
ThemeRegistry caches buildEntityTheme(hex) → CSS vars object
        ↓
Feature component calls useEntityTheme(entity.color)
        ↓
Spreads result as style={{ ...theme }} on the container element
        ↓
UI atom reads var(--entity-bg), var(--entity-fg), var(--entity-border), var(--entity-solid)
```

**Color-Carrying Entities and Their Hooks:**

| Entity | Color Field | Registered By |
|--------|-------------|--------------|
| Project | `color` | `useProjects` |
| Epic | `color` | `useBacklog` (via task tree) |
| Sprint | `color` | `useSprints` |
| Status | `color` | `useBoards` |

**Rules:**
- Never pass a raw hex color as a prop into a UI atom
- Never hardcode entity colors in CSS
- The `useEntityTheme(hex)` hook computes the CSS variables at the container level
- CSS variable scoping is automatic — sibling badges with different colors never collide

### Usage Pattern

```tsx
// CORRECT — use CSS variables
className="bg-sidebar-bg text-sidebar-fg border-panel-border"

// WRONG — never hardcode hex
className="bg-[#252526] text-[#CCCCCC]"
```

---

## 2. TYPOGRAPHY

### Font Stack

```css
--font-sans: "DM Sans", system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", "Consolas", monospace;
```

### Scale

| Size | Value | Usage |
|------|-------|-------|
| Base | 13px | Default body text |
| Small/Labels | 11px | `text-[11px]` |
| Body | 13px | Default |
| Section headers | 14px | `font-semibold` |
| Page titles | 18px | `font-bold` |
| Monospace IDs | `text-[11px] font-mono` | Ticket numbers, code |

### Rules

- IDs, code, ticket numbers → `font-mono text-[11px]`
- Navigation labels → `text-[11px] uppercase tracking-wider font-semibold`
- Body text → `text-[13px]`
- Section headers → `text-[14px] font-semibold`
- Page titles → `text-[18px] font-bold`

---

## 3. LAYOUT ARCHITECTURE

### Route-Driven Shell Pattern

ScrumHub uses a **VS Code-inspired IDE layout** driven by TanStack Router. The `AppShell` component wraps all project-scoped views and renders `<Outlet />` for child route content.

**Route Structure:**
```
/app                                    → Redirect to /app/projects
/app/projects                           → Workspace context (no AppShell)
/app/projects/create                    → Create project (no AppShell)
/app/projects/$projectId/*             → Project workspace (AppShell + <Outlet />)
  /dashboard, /board, /backlog, /calendar, /sprints, /settings
```

**`src/routes/app/projects/$projectId/route.tsx`** is the mandatory project layout:
```tsx
export const Route = createFileRoute("/app/projects/$projectId")({
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData(projectQuery(params.projectId));
  },
  component: ProjectLayout,
});

function ProjectLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
```

### ActivityBar-Based Layout (VS Code Pattern)

The application uses an **ActivityBar** (left icon rail) + **Explorer** (file-tree style sidebar) + **Tab Bar** (editor tabs) layout. This is NOT the traditional sidebar+topbar pattern.

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  TitleBar (h-8, --titlebar bg)                                            │
├────┬──────────┬───────────────────────────────────────┬─────────────────────┤
│    │          │ TabBar (h-9, --tab-inactive bg)        │                     │
│ A  │ E        ├─────────────────────────────────────────┤                     │
│ C  │ X        │                                         │                     │
│ T  │ P        │         Main Content Area               │                     │
│ I  │ L        │         (flex-1, --editor bg)          │  PropertiesPanel    │
│ V  │ O        │         <Outlet /> renders here         │  (w-72, conditional)│
│ I  │ R        │                                         │                     │
│ T  │ E        │                                         │                     │
│ Y  │ R        │                                         │                     │
│ B  │          │                                         │                     │
│ A  │          ├─────────────────────────────────────────┤                     │
│ R  │          │ Explorer (w-64, --sidebar-bg)          │                     │
│    │          │ (collapsible, shows project tree)      │                     │
├────┴──────────┴─────────────────────────────────────────┴─────────────────────┤
│  StatusBar (h-6, --status-bar bg)                                          │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Panel Dimensions

| Component | Width/Height | Background | Notes |
|-----------|-------------|------------|-------|
| ActivityBar | `w-12` (48px) | `--activity-bar` | Icons only, hover tooltips |
| Explorer | `w-64` (256px) | `--sidebar-bg` | Collapsible, file-tree style |
| TitleBar | `h-8` (32px) | `--titlebar` | App title, window controls |
| TabBar | `h-9` (36px) | `--tab-inactive` | Editor-style tabs |
| StatusBar | `h-6` (24px) | `--status-bar` | Branch, alerts, notifications |
| PropertiesPanel | `w-72` (288px) | `--sidebar-bg` | Conditional, task detail sidebar |

### Padding Standards

| Element | Padding |
|---------|---------|
| Page content | `p-6` |
| Card interior | `p-4` or `p-6` |
| Explorer section header | `px-4 py-3` |
| Explorer item (top-level) | `px-2 py-0.5` |
| Explorer item (nested) | `pl-4 pr-2 py-0.5` |
| Tab item | `pl-3 pr-2 h-full` |
| List item | `px-4 py-3` |
| Input field | `px-3 py-2` |

---

## 4. COMPONENT SPECIFICATIONS

### 4.1 BUTTONS

**Variants:**

```tsx
// Default — primary action
className="bg-primary text-primary-foreground shadow hover:bg-primary/90"

// Destructive — danger actions
className="bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"

// Outline — secondary action
className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"

// Ghost — transparent, hover reveals
className="hover:bg-accent hover:text-accent-foreground"

// Link — text only
className="text-primary underline-offset-4 hover:underline"
```

**Sizes:**

| Size | Classes |
|------|---------|
| Default | `h-9 px-4 py-2` |
| Small | `h-8 rounded-md px-3 text-xs` |
| Large | `h-10 rounded-md px-8` |
| Icon | `h-9 w-9` |

**Rules:**
- Use `inline-flex items-center justify-center gap-2`
- Icon buttons: `h-9 w-9` with `size-4` icon
- Always `rounded-md` — never fully rounded pills

---

### 4.2 CARDS

```tsx
// Standard card
className="rounded-xl border bg-card text-card-foreground shadow"

// Structure
<Card>
  <CardHeader>         // p-6 + flex flex-col space-y-1.5
  <CardTitle>          // font-semibold leading-none tracking-tight
  <CardDescription>    // text-sm text-muted-foreground
  <CardContent>        // p-6 pt-0
  <CardFooter>         // flex items-center p-6 pt-0
</Card>
```

**Rules:**
- `rounded-xl` (max rounding allowed)
- Border: `border border-panel-border` or semantic `border`
- Background: `bg-card`
- Shadow: light `shadow`, NOT `shadow-lg` or `shadow-xl`

---

### 4.3 INPUTS

```tsx
// Text input
className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
```

**Rules:**
- Height: `h-9` (36px)
- Border: `border border-input`
- Background: `bg-transparent` (not white)
- Border radius: `rounded-md`
- Focus: `focus-visible:ring-1 focus-visible:ring-ring`
- Placeholder: `placeholder:text-muted-foreground`

---

### 4.4 BADGES

```tsx
// Default — primary colored
className="border-transparent bg-primary text-primary-foreground shadow"

// Secondary
className="border-transparent bg-secondary text-secondary-foreground"

// Destructive
className="border-transparent bg-destructive text-destructive-foreground"

// Outline — border only
className="border text-foreground"

// Status badge (inline flex)
className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors"

// Priority indicator (small dot)
className="w-2 h-2 rounded-full bg-priority-high" // or med/low
```

---

### 4.5 TABS

```tsx
// Tab list container
className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"

// Tab trigger
className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"

// Tab content
className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

---

### 4.6 ACTIVITY BAR (Left Icon Rail)

The ActivityBar is the **primary navigation** in the project workspace. It uses route-driven navigation via `useNavigate`.

```tsx
// Container
className="w-12 bg-activity-bar flex flex-col items-center justify-between border-r border-panel-border"

// Icon button
className="w-12 h-12 flex items-center justify-center text-activity-bar-fg hover:text-activity-bar-active transition-colors"

// Active indicator (left border)
<span className="absolute left-0 top-0 bottom-0 w-0.5 bg-activity-bar-active" />

// Icon size: 24px with strokeWidth={1.5}
<Icon size={24} strokeWidth={1.5} />

// Disabled state (project-only items when no project selected)
disabled={projectOnly && !projectId}
className="opacity-30 cursor-not-allowed"
```

**Navigation items:** Projects (workspace), Backlog, Sprints, Settings. Items that require a project context are hidden/disabled when `projectId` is absent.

---

### 4.7 EXPLORER (Workspace Sidebar)

The Explorer shows project structure in a file-tree style.

```tsx
// Container
className="w-64 bg-sidebar-bg border-r border-panel-border flex flex-col select-none"

// Section header
className="h-9 px-4 flex items-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"

// Tree item (top-level)
className="w-full flex items-center gap-1 px-2 py-0.5 hover:bg-list-hover"

// Tree item (nested)
className="w-full flex items-center gap-1 pl-4 pr-2 py-0.5 hover:bg-list-hover"

// Active tree item
className="w-full flex items-center gap-2 pl-9 pr-2 py-0.5 text-left hover:bg-list-hover bg-list-active"
```

---

### 4.8 TAB BAR (Editor Tabs)

IDE-style tabs representing open items (dashboard, tasks, etc.).

```tsx
// Tab container
className="flex bg-tab-inactive border-b border-panel-border h-9 overflow-x-auto"

// Tab item (inactive)
className="group flex items-center gap-2 pl-3 pr-2 h-full border-r border-panel-border cursor-pointer text-[13px] shrink-0 text-muted-foreground hover:text-foreground"

// Tab item (active)
className="group flex items-center gap-2 pl-3 pr-2 h-full border-r border-panel-border cursor-pointer text-[13px] shrink-0 bg-tab-active text-foreground border-t-2 border-t-tab-border -mt-px"

// Close button (visible on hover)
className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-list-hover opacity-0 group-hover:opacity-100"
```

---

### 4.9 STATUS BAR (Bottom)

```tsx
// Container
className="h-6 bg-status-bar text-status-bar-fg flex items-center text-[11px] font-mono select-none"

// Item (clickable)
className="h-full px-2 flex items-center gap-1 hover:bg-white/10"

// Divider spacing: flex-1 between groups
```

---

### 4.10 LISTS & ROWS

```tsx
// Hoverable row
className="hover:bg-list-hover"

// Selected/active row
className="bg-list-active hover:bg-list-active"

// List container
className="divide-y divide-panel-border"

// Skeleton loading row
className="bg-sidebar-bg border border-panel-border rounded p-4 flex gap-4"
```

---

### 4.11 AVATARS

```tsx
// Circular avatar
className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center"

// Size variants (via className or CSS):
// Small: w-5 h-5 text-[9px]
// Medium: w-6 h-6 text-[10px]
// Large: w-8 h-8 text-[12px]
```

---

## 5. CSS VARIABLE USAGE MAP

| CSS Variable | Tailwind Equivalent | Where Used |
|-------------|---------------------|------------|
| `--editor` | `bg-editor` | Main background |
| `--sidebar-bg` | `bg-sidebar-bg` | Sidebar, Explorer, cards |
| `--sidebar-fg` | `text-sidebar-fg` | Sidebar text |
| `--activity-bar` | `bg-activity-bar` | ActivityBar background |
| `--activity-bar-fg` | `text-activity-bar-fg` | Inactive icons |
| `--activity-bar-active` | `text-activity-bar-active` / `bg-activity-bar-active` | Active state |
| `--status-bar` | `bg-status-bar` | StatusBar background |
| `--status-bar-fg` | `text-status-bar-fg` | StatusBar text |
| `--tab-active` | `bg-tab-active` | Active tab bg |
| `--tab-inactive` | `bg-tab-inactive` | Tab bar bg |
| `--list-hover` | `hover:bg-list-hover` | Row hover |
| `--list-active` | `bg-list-active` | Selected row |
| `--panel-border` | `border-panel-border` | All borders |
| `--primary` | `bg-primary` | Primary buttons |
| `--muted-foreground` | `text-muted-foreground` | Secondary text |
| `--entity-bg` | (runtime-computed) | Entity-colored containers |
| `--entity-fg` | (runtime-computed) | Text on entity bg |
| `--entity-border` | (runtime-computed) | Entity borders |
| `--entity-solid` | (runtime-computed) | Color dots, icons |

---

## 6. TANCHSTACK QUERY CONVENTIONS

All project-scoped queries **MUST** use hierarchical query keys following Law 8.

### Hierarchical Query Key Pattern

```
['project', projectId, resource]
```

| Wrong | Correct |
|-------|---------|
| `['board']` | `['project', projectId, 'board']` |
| `['tasks']` | `['project', projectId, 'tasks']` |
| `['tasks', taskId]` | `['project', projectId, 'tasks', taskId]` |
| `['sprints']` | `['project', projectId, 'sprints']` |

**Why:** Guarantees cache isolation per project, correct invalidation when switching projects, prevents stale data bleedover.

### Hook Signature Example

```tsx
// src/features/backlog/hooks/useTasks.ts
export function useTasks(projectId: string) {
  return useQuery<Task[]>({
    queryKey: ['project', projectId, 'tasks'],
    queryFn: () => backlogService.getTasks(projectId),
  });
}
```

---

## 7. ADDING NEW UI COMPONENTS

When introducing a new shared atom or UI element in `src/components/ui/`:

- [ ] **Color Contract:** Use only semantic CSS variables (`bg-sidebar-bg`, `text-foreground`, `border-panel-border`). Never hardcode hex.
- [ ] **Tier Assignment:** Verify it adheres to the Three-Tier Rule — stateless, props in, JSX out. No API calls, no side effects.
- [ ] **Entity Colors (if applicable):** If the component displays an entity with a user-defined color (Project, Epic, Sprint, Status), receive the color via `useEntityTheme` at the container level, NOT as a prop into the atom. The atom should use `var(--entity-bg)`, etc.
- [ ] **JSDoc:** Add a complete `@component` JSDoc comment with props documentation.
- [ ] **Barrel Export:** Add the export to `src/components/ui/index.ts`.
- [ ] **Styling Review:** No `bg-gradient-*`, no `shadow-2xl`, no `rounded-full`. Max rounding is `rounded-xl` or `rounded-md`.

---

## 8. ADDING NEW FEATURES

When creating a new domain feature in `src/features/<name>/`:

- [ ] **Directory Structure:** Create standard subdirectories: `components/`, `hooks/`, `services/`, `types/`, `utils/` (optional), `styles/` (optional).
- [ ] **Barrel Exports:** Expose the public API through `src/features/<name>/index.ts`.
- [ ] **No Internal Cross-Imports:** No other feature reaches into this feature's internals. All cross-feature imports must use the barrel index (`import { X } from '@/features/feature-name'`).
- [ ] **Route File + Page Pattern:** Create a route file in `src/routes/app/projects/$projectId/<feature>.tsx` that delegates to a thin page in `src/pages/<Feature>Page.tsx`.
- [ ] **Thin Page Components:** Pages call hooks and render feature components. No business logic, no complex JSX — extract to a feature component if it exceeds ~30 lines.
- [ ] **Query Key Hierarchy:** Use `['project', projectId, 'feature']` for all project-scoped queries.
- [ ] **Entity Colors (if applicable):** Call `registerEntities()` in the hook if the data contains colored entities.

---

## 9. WHAT NOT TO DO (Anti-Patterns)

### ❌ Gradients
```tsx
// WRONG — no gradients ever
className="bg-gradient-to-r from-purple-600 to-blue-600"

// CORRECT — solid colors only
className="bg-primary"
className="bg-sidebar-bg"
```

### ❌ Heavy Shadows
```tsx
// WRONG
className="shadow-2xl"
className="shadow-[0_10px_40px_rgba(0,0,0,0.5)]"

// CORRECT — only shadow-sm or shadow
className="shadow"    // subtle
className="shadow-sm" // very subtle
```

### ❌ Fully Rounded Pills
```tsx
// WRONG — looks like AI slop
className="rounded-full px-6 py-3"

// CORRECT
className="rounded-md px-4 py-2"
className="rounded-xl" // max allowed
```

### ❌ Vivid Saturated Backgrounds
```tsx
// WRONG — overwhelming color fields
className="bg-blue-600"
className="bg-purple-700"

// CORRECT — muted, dark surfaces
className="bg-sidebar-bg"
className="bg-muted"
```

### ❌ Neon/Glowing Effects
```tsx
// WRONG
className="shadow-[0_0_20px_rgba(37,99,235,0.5)]"

// CORRECT
className="shadow-sm"
```

### ❌ Excessive Animations
```tsx
// WRONG — bouncy, playful animations
className="animate-bounce"
className="transition-all duration-500 ease-in-out"

// CORRECT — fast, subtle transitions
className="transition-colors"  // default ~150ms
className="transition-all duration-150"
```

### ❌ Inline Styles for Colors
```tsx
// WRONG
style={{ backgroundColor: '#3B6D11' }}

// CORRECT — use CSS variables via Tailwind
className="bg-sidebar-bg"
```

### ❌ Hardcoded Light Mode Colors
```tsx
// WRONG — light mode colors
className="bg-white text-gray-900"

// CORRECT — use dark theme palette
className="bg-editor text-foreground"
```

### ❌ Entity Color Props to Atoms
```tsx
// WRONG — passing color as prop to atom
<EpicBadge color={epic.color} />

// CORRECT — compute theme at container, use entity CSS vars
<div style={useEntityTheme(epic.color)}>
  <EpicBadge />  // reads var(--entity-bg) etc.
</div>
```

---

## 10. BUILDING NEW VIEWS — QUICK REFERENCE

### Page Structure
```tsx
export function MyPage() {
  return (
    <div className="flex flex-col h-full bg-editor">
      {/* Page Header */}
      <div className="px-6 py-4 border-b border-panel-border">
        <h1 className="text-lg font-semibold">Page Title</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6 xl:col-span-3">
            <div className="bg-sidebar-bg border border-panel-border rounded-lg p-4">
              {/* Content */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Stat Card
```tsx
<div className="bg-sidebar-bg border border-panel-border rounded-lg p-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-xs text-muted-foreground uppercase tracking-wide">Label</span>
    <Icon size={18} className="text-muted-foreground" />
  </div>
  <div className="mb-1">
    <span className="text-2xl font-bold">Value</span>
  </div>
  <div className="text-xs text-muted-foreground">Subtitle</div>
</div>
```

### List Item
```tsx
<div className="flex items-center gap-3 px-4 py-3 hover:bg-list-hover border-b border-panel-border">
  <StatusIcon />
  <span className="flex-1 text-[13px]">Task title</span>
  <Badge variant="outline">Status</Badge>
</div>
```

### Empty State
```tsx
<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
  <Icon name="inbox" size={40} className="mb-2 opacity-40" />
  <p className="text-sm">No items yet</p>
</div>
```

### Task Detail Side-by-Side (TaskDetailPage)
```tsx
<div className="flex h-full">
  <div className="flex-1 min-w-0">
    <TaskView taskId={taskId} projectId={projectId} />
  </div>
  <PropertiesPanel taskId={taskId} projectId={projectId} />
</div>
```

---

## 11. TAILWIND CONFIG

The project uses **Tailwind CSS v4** with `@theme inline` in `src/styles/globals.css`. Custom colors are defined as CSS variables and mapped to Tailwind via the `--color-*` prefixed variables.

```ts
// vite.config.ts
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

## 12. CSS IMPORT ORDER

When creating new CSS files, follow this order:

1. Tailwind base (via Vite plugin `@tailwindcss/vite`)
2. Custom CSS variables in `src/styles/globals.css`
3. Component-specific styles (rare — prefer Tailwind utilities)

**In `src/styles/globals.css`:**
```css
@import './globals.css';          /* 1. CSS variables and base styles */
@import 'tailwindcss/base';       /* 2. Tailwind base */
@import 'tailwindcss/components'; /* 3. Tailwind components */
@import 'tailwindcss/utilities';  /* 4. Tailwind utilities */
```

---

## 13. FINAL REMINDERS

1. **Semantic CSS variables** — never hardcode colors. The variable system enables future themes.
2. **No gradients** — solid oklch values only.
3. **Sharp but not harsh** — `rounded-md` max, no fully rounded pills.
4. **Subtle shadows** — `shadow-sm` or nothing.
5. **Fast transitions** — 150ms, linear or ease-out.
6. **Dark theme default** — the default UI palette is VS Code dark, but colors come from variables.
7. **13px base** — lean toward smaller, denser text.
8. **Monospace for IDs** — ticket numbers, code snippets.
9. **Dense layouts** — compact spacing, no excessive padding.
10. **Follow the IDE metaphor** — activity bar, explorer, tabs, status bar.
11. **Entity colors via useEntityTheme** — never pass color as prop to atoms.
12. **Hierarchical query keys** — always `['project', projectId, ...]`.

---

*Last reviewed: 2026-05-07*
*Updated: Merged with MAINTENANCE.md, added entity color system, ActivityBar layout, query key conventions*