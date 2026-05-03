# FRONTEND_STYLING.md — ScrumHub Visual Language Guide

**Design Philosophy:** "Sober, Structured, Sophisticated" — A premium code editor (IDE) aesthetic.
**App Mode:** Dark-only. No light mode. No exceptions.

---

## 1. COLOR SYSTEM

All colors use **oklch** for perceptual uniformity. CSS variables are defined in `src/styles.css` under `:root`. **Never hardcode hex values.**

### VS Code Semantic Tokens

| Variable                  | Value (oklch)                | Usage                              |
|---------------------------|------------------------------|------------------------------------|
| `--editor`                | `oklch(0.22 0 0)` (#1E1E1E)  | Main background                    |
| `--sidebar-bg`            | `oklch(0.25 0 0)` (#252526)  | Sidebar panels                     |
| `--sidebar-fg`            | `oklch(0.83 0 0)` (#CCCCCC)  | Sidebar text                       |
| `--activity-bar`          | `oklch(0.30 0 0)` (#333333)  | Left activity rail                 |
| `--activity-bar-fg`      | `oklch(0.66 0 0)`            | Inactive icons                     |
| `--activity-bar-active`   | `oklch(0.95 0 0)` (#F3F3F3)  | Active icon / left indicator       |
| `--status-bar`            | `oklch(0.55 0.16 250)` (#007ACC) | Bottom status bar (blue)        |
| `--status-bar-fg`          | `oklch(0.98 0 0)`            | Status bar text                    |
| `--tab-active`            | `oklch(0.22 0 0)` (#1E1E1E)  | Active tab background              |
| `--tab-inactive`          | `oklch(0.18 0 0)` (#2D2D2D)  | Inactive tabs background            |
| `--tab-border`            | `oklch(0.55 0.16 250)`       | Active tab top border (blue accent)|
| `--list-hover`            | `oklch(0.30 0.005 270)` (#2A2D2E) | Row hover background           |
| `--list-active`           | `oklch(0.36 0.06 250)` (#094771) | Selected row background        |
| `--panel-border`          | `oklch(0.32 0 0)` (#3C3C3C)  | Borders, dividers                  |
| `--titlebar`              | `oklch(0.27 0 0)` (#3C3C3C)  | Title bar background               |

### UI Semantic Tokens

| Variable                  | Value (oklch)                | Usage                              |
|---------------------------|------------------------------|------------------------------------|
| `--primary`              | `oklch(0.55 0.16 250)`       | Primary actions (blue)             |
| `--primary-foreground`    | `oklch(0.98 0 0)`            | Text on primary                    |
| `--secondary`             | `oklch(0.30 0 0)`            | Secondary surfaces                 |
| `--muted`                | `oklch(0.27 0 0)`            | Muted backgrounds                  |
| `--muted-foreground`     | `oklch(0.62 0 0)`            | Secondary text                     |
| `--accent`               | `oklch(0.36 0.06 250)`       | Accent highlights                  |
| `--destructive`           | `oklch(0.60 0.22 27)`        | Destructive actions (red)          |
| `--border`               | Same as `--panel-border`     | Standard border                    |
| `--input`                | `oklch(0.24 0 0)`            | Input field background             |
| `--ring`                 | `oklch(0.55 0.16 250)`       | Focus rings                        |

### Status & Priority Tokens

| Variable              | Value (oklch)            | Usage                      |
|-----------------------|--------------------------|----------------------------|
| `--priority-high`     | `oklch(0.65 0.22 25)`    | High priority (red-orange) |
| `--priority-med`      | `oklch(0.78 0.16 75)`    | Medium priority (yellow)   |
| `--priority-low`      | `oklch(0.70 0.14 160)`   | Low priority (green)       |
| `--status-todo`       | `oklch(0.65 0 0)`        | Todo status (gray)         |
| `--status-progress`   | `oklch(0.70 0.15 220)`   | In progress (blue)         |
| `--status-done`       | `oklch(0.68 0.16 150)`   | Done status (green)        |

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
--font-sans: "Segoe UI", system-ui, -apple-system, "Inter", sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", "Consolas", "Courier New", monospace;
```

### Scale
- **Base:** 13px (`font-size: 13px` on `body`)
- **Small/Labels:** 11px (`text-[11px]`)
- **Body:** 13px (default)
- **Headings:** 14-18px with `font-semibold` or `font-bold`
- **Monospace IDs:** `font-mono text-[11px]`

### Rules
- IDs, code, ticket numbers → `font-mono text-[11px]`
- Navigation labels → `text-[11px] uppercase tracking-wider font-semibold`
- Body text → `text-[13px]`
- Section headers → `text-[14px] font-semibold`
- Page titles → `text-[18px] font-bold`

---

## 3. SPACING & LAYOUT

### IDE Layout Structure (Top → Bottom)
```
┌─────────────────────────────────────────────────┐
│ TitleBar (h-8, --titlebar bg)                   │
├────┬─────┬──────────────────────────────────────┤
│    │     │ TabBar (h-9, --tab-inactive bg)       │
│ A  │ S   ├──────────────────────────────────────┤
│ C  │ I   │                                      │
│ T  │ D   │         Main Content Area            │
│ I  │ E   │         (flex-1, --editor bg)        │
│ V  │ B   │                                      │
│ I  │ A   │                                      │
│ T  │ R   │                                      │
│ Y  │     │                                      │
│ B  │     ├──────────────────────────────────────┤
│ A  │     │ PropertiesPanel (w-80, conditional) │
│ R  │     │                                      │
├────┴─────┴──────────────────────────────────────┤
│ StatusBar (h-6, --status-bar bg)                │
└─────────────────────────────────────────────────┘
```

### Panel Dimensions
| Component        | Width/Height      | Background          |
|------------------|-------------------|---------------------|
| ActivityBar      | `w-12`            | `--activity-bar`    |
| Sidebar          | `w-64`            | `--sidebar-bg`      |
| TitleBar         | `h-8`             | `--titlebar`        |
| TabBar           | `h-9`             | `--tab-inactive`    |
| StatusBar        | `h-6`             | `--status-bar`      |
| PropertiesPanel  | `w-80` (optional) | `--sidebar-bg`      |

### Padding Standards
| Element              | Padding                  |
|----------------------|--------------------------|
| Page content         | `p-6`                    |
| Card interior        | `p-4` or `p-6`           |
| Sidebar section header | `px-4 py-3`            |
| Sidebar item         | `px-2 py-0.5`            |
| Nested sidebar item  | `pl-4 pr-2 py-0.5`       |
| Tab item             | `pl-3 pr-2 h-full`       |
| List item            | `px-4 py-3`              |
| Input field          | `px-3 py-2`              |

---

## 4. COMPONENT SPECIFICATIONS

### 4.1 BUTTONS

**Variants** (from `button.tsx`):
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
| Size    | Classes                    |
|---------|----------------------------|
| Default | `h-9 px-4 py-2`            |
| Small   | `h-8 rounded-md px-3 text-xs` |
| Large   | `h-10 rounded-md px-8`     |
| Icon    | `h-9 w-9`                  |

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
<Card>                    // Container with border + shadow
  <CardHeader>            // p-6 + flex flex-col space-y-1.5
  <CardTitle>             // font-semibold leading-none tracking-tight
  <CardDescription>      // text-sm text-muted-foreground
  <CardContent>           // p-6 pt-0
  <CardFooter>           // flex items-center p-6 pt-0
</Card>
```

**Rules:**
- `rounded-xl` (max rounding allowed)
- Border: `border border-panel-border` or semantic `border`
- Background: `bg-card` (which is `var(--card)`)
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

**Variants:**
```tsx
// Default — primary colored
className="border-transparent bg-primary text-primary-foreground shadow"

// Secondary
className="border-transparent bg-secondary text-secondary-foreground"

// Destructive
className="border-transparent bg-destructive text-destructive-foreground"

// Outline — border only
className="border text-foreground"
```

**Common patterns:**
```tsx
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

### 4.6 SIDEBARS

**Activity Bar (left rail):**
```tsx
className="w-12 bg-activity-bar flex flex-col items-center justify-between border-r border-panel-border"

Active indicator: absolute left-0 top-0 bottom-0 w-0.5 bg-activity-bar-active
Icon button: w-12 h-12 flex items-center justify-center
Icon size: 24px with strokeWidth={1.5}
```

**Workspace Sidebar (explorer):**
```tsx
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

### 4.7 TAB BAR (Editor Tabs)

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

### 4.8 STATUS BAR (Bottom)

```tsx
// Container
className="h-6 bg-status-bar text-status-bar-fg flex items-center text-[11px] font-mono select-none"

// Item (clickable)
className="h-full px-2 flex items-center gap-1 hover:bg-white/10"

// Divider spacing: flex-1 between groups
```

---

### 4.9 LISTS & ROWS

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

### 4.10 AVATARS

```tsx
// Circular avatar
className="avatar-circle" // Custom CSS: circular with centered text

// Sizes (define in CSS):
// Small: 24px, Medium: 32px, Large: 40px
```

---

## 5. CSS VARIABLE USAGE MAP

| CSS Variable         | Tailwind Equivalent        | Where Used                |
|---------------------|---------------------------|---------------------------|
| `--editor`          | `bg-editor`               | Main background           |
| `--sidebar-bg`      | `bg-sidebar-bg`           | Sidebar, cards            |
| `--sidebar-fg`      | `text-sidebar-fg`         | Sidebar text              |
| `--activity-bar`    | `bg-activity-bar`         | ActivityBar               |
| `--activity-bar-fg` | `text-activity-bar-fg`     | Inactive icons            |
| `--activity-bar-active` | `text-activity-bar-active` / `bg-activity-bar-active` | Active state |
| `--status-bar`      | `bg-status-bar`           | StatusBar                 |
| `--status-bar-fg`   | `text-status-bar-fg`      | StatusBar text            |
| `--tab-active`      | `bg-tab-active`           | Active tab bg             |
| `--tab-inactive`    | `bg-tab-inactive`         | Tab bar bg                |
| `--list-hover`      | `hover:bg-list-hover`     | Row hover                 |
| `--list-active`     | `bg-list-active`          | Selected row              |
| `--panel-border`    | `border-panel-border`     | All borders               |
| `--primary`         | `bg-primary`              | Primary buttons           |
| `--muted-foreground`| `text-muted-foreground`   | Secondary text            |

---

## 6. WHAT NOT TO DO (Anti-Patterns)

### ❌ FORBIDDEN: Gradients
```tsx
// WRONG — no gradients ever
className="bg-gradient-to-r from-purple-600 to-blue-600"
className="bg-gradient-to-br hover:from-purple-500"

// CORRECT — solid colors only
className="bg-primary"
className="bg-sidebar-bg"
```

### ❌ FORBIDDEN: Heavy Shadows
```tsx
// WRONG — no large shadows
className="shadow-2xl"
className="shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
className="drop-shadow-xl"

// CORRECT — only light shadows when needed
className="shadow"        // subtle
className="shadow-sm"     // very subtle
```

### ❌ FORBIDDEN: Fully Rounded Pills
```tsx
// WRONG — looks like AI slop
className="rounded-full px-6 py-3"

// CORRECT — modest rounding
className="rounded-md px-4 py-2"
className="rounded-xl"  // max allowed
```

### ❌ FORBIDDEN: Vivid Saturated Backgrounds on Large Areas
```tsx
// WRONG — overwhelming color fields
className="bg-blue-600"
className="bg-purple-700"

// CORRECT — muted, dark surfaces
className="bg-sidebar-bg"
className="bg-muted"
```

### ❌ FORBIDDEN: Neon/Glowing Effects
```tsx
// WRONG — no glow
className="shadow-[0_0_20px_rgba(37,99,235,0.5)]"
className="shadow-glow"

// CORRECT — no shadows or very subtle
className="shadow-sm"
```

### ❌ FORBIDDEN:过度使用动画 (Excessive Animations)
```tsx
// WRONG — bouncy, playful animations
className="animate-bounce"
className="transition-all duration-500 ease-in-out"

// CORRECT — fast, subtle transitions
className="transition-colors"  // default ~150ms
className="transition-all duration-150"
```

### ❌ FORBIDDEN: Inline Styles for Colors
```tsx
// WRONG
style={{ backgroundColor: '#3B6D11' }}
style={{ color: '#007ACC' }}

// CORRECT — use CSS variables via Tailwind
className="bg-sidebar-bg text-sidebar-fg"
```

### ❌ FORBIDDEN: Light Mode Colors
```tsx
// WRONG — light mode colors
className="bg-white text-gray-900"
className="bg-gray-100"

// CORRECT — dark mode palette only
className="bg-editor text-foreground"
```

---

## 7. BUILDING NEW VIEWS — QUICK REFERENCE

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
        {/* Grid layout for cards */}
        <div className="grid grid-cols-12 gap-4">
          {/* Card */}
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
  <span className="text-4xl mb-2 opacity-40">📋</span>
  <p className="text-sm">No items yet</p>
</div>
```

---

## 8. TAILWIND CONFIG

The project uses Tailwind CSS v4 with `@theme inline` in `src/styles.css`. Custom colors are defined as CSS variables and mapped to Tailwind via the `--color-*` prefixed variables.

Key configuration in `tailwind.config.ts`:
```ts
import tailwindcss from "@tailwindcss/vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    // ...
  ],
})
```

---

## 9. CSS IMPORT ORDER

When creating new CSS files, follow this order:
1. Tailwind base (via Vite plugin)
2. Custom CSS variables in `src/styles.css`
3. Component-specific styles

---

## 10. FINAL REMINDERS

1. **Dark mode only** — the entire app runs on VS Code's dark palette
2. **No gradients** — solid oklch values only
3. **Sharp but not harsh** — `rounded-md` max, no fully rounded pills
4. **Subtle shadows** — `shadow-sm` or nothing
5. **Fast transitions** — 150ms, linear or ease-out
6. **CSS variables first** — never hardcode colors
7. **13px base** — lean toward smaller, denser text
8. **Monospace for IDs** — ticket numbers, code snippets
9. **Dense layouts** — compact spacing, no excessive padding
10. **Follow the IDE metaphor** — status bar, activity bar, tabs, sidebar