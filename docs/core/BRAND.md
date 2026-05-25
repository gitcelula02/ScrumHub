# BRAND.md — Visual Identity & Design Language

**This file owns:** Colors (with hex/CSS variable names), typography, tone of voice.
**For styling rules:** See [STYLING.md](./STYLING.md)
**Last updated:** 2026-05-15

---

## Brand Identity

**Product Name:** ScrumHub
**Design Philosophy:** "Sober, Structured, Sophisticated"
**Reference UI:** Visual Studio Code
**Mascot:** Abstract geometric "S-Link" Dragon
**Catchphrase:** *Architecting Agility.*

---

## Color System (oklch)

### Brand Colors

| Name | CSS Variable | oklch Value | Usage |
|------|--------------|--------------|-------|
| Primary | `--color-primary` | `oklch(0.55 0.16 250)` | Primary actions, links |
| Primary Foreground | `--color-primary-foreground` | `oklch(0.98 0 0)` | Text on primary |
| Secondary | `--color-secondary` | `oklch(0.30 0 0)` | Secondary surfaces |
| Muted | `--color-muted` | `oklch(0.27 0 0)` | Muted backgrounds |
| Muted Foreground | `--color-muted-foreground` | `oklch(0.62 0 0)` | Secondary text |
| Accent | `--color-accent` | `oklch(0.36 0.06 250)` | Accent highlights |
| Destructive | `--color-destructive` | `oklch(0.60 0.22 27)` | Destructive actions |
| Border | `--color-border` | `oklch(0.32 0 0)` | Standard borders |
| Input | `--color-input` | `oklch(0.24 0 0)` | Input backgrounds |
| Ring | `--color-ring` | `oklch(0.55 0.16 250)` | Focus rings |

### Entity Colors (Dynamic, User-Defined)

These are computed at runtime from user-defined hex on Project, Epic, Sprint, Status entities:

| CSS Variable | Computation | Usage |
|--------------|-------------|-------|
| `--entity-solid` | full hex | Color dot, icon fill |
| `--entity-bg` | hex at 12% alpha | Badge fill, row tint |
| `--entity-border` | hex at 45% alpha | Border, left accent line |
| `--entity-fg` | auto-contrasted | Text on colored bg |

**See:** [STYLING.md](./STYLING.md) — Entity Color Chain section

### Status & Priority Colors

| Name | CSS Variable | oklch Value | Usage |
|------|--------------|--------------|-------|
| Priority High | `--priority-high` | `oklch(0.65 0.22 25)` | High priority |
| Priority Medium | `--priority-med` | `oklch(0.78 0.16 75)` | Medium priority |
| Priority Low | `--priority-low` | `oklch(0.70 0.14 160)` | Low priority |
| Status Todo | `--status-todo` | `oklch(0.65 0 0)` | Todo status |
| Status Progress | `--status-progress` | `oklch(0.70 0.15 220)` | In progress |
| Status Done | `--status-done` | `oklch(0.68 0.16 150)` | Done status |

---

## Typography

### Font Stacks

| Usage | Font Stack |
|-------|------------|
| Sans (body) | `"DM Sans", system-ui, -apple-system, sans-serif` |
| Mono (code) | `"JetBrains Mono", "Fira Code", "Consolas", monospace` |

### Type Scale

| Size | Value | Usage |
|------|-------|-------|
| Base | 13px | Default body text |
| Small/Labels | 11px | `text-[11px]` |
| Body | 13px | Default |
| Section headers | 14px | `font-semibold` |
| Page titles | 18px | `font-bold` |
| Monospace IDs | `text-[11px] font-mono` | Ticket numbers, code |

### Type Rules

- IDs, code, ticket numbers → `font-mono text-[11px]`
- Navigation labels → `text-[11px] uppercase tracking-wider font-semibold`
- Body text → `text-[13px]`

---

## Border Radius

| Element | Radius |
|---------|--------|
| Workspace | 3px |
| Default | 5px |
| Auth card | 8px |
| **Maximum** | `rounded-xl` (never fully rounded pills) |

---

## Transitions

| Speed | Duration |
|-------|----------|
| Fast | 120ms |
| Base | 200ms |
| Slow | 350ms |

Use `transition-colors` or explicit duration. Never bouncy animations.

---

## Spacing Standards

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

## Panel Dimensions

| Component | Size | Background |
|-----------|------|------------|
| ActivityBar | 48px wide | `--activity-bar` |
| Explorer | 256px wide | `--sidebar-bg` |
| TitleBar | 32px height | `--titlebar` |
| TabBar | 36px height | `--tab-inactive` |
| StatusBar | 24px height | `--status-bar` |
| PropertiesPanel | 288px wide | `--sidebar-bg` |

---

*For VS Code semantic tokens: See [STYLING.md](./STYLING.md)*