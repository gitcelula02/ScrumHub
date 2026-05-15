# Project Overview

**Status:** Planned

---

## Overview

Default landing view when opening a project workspace. Presents project as a customizable workspace document with modular sections, resembling a markdown file rendered inside an IDE.

**Key Characteristics:**
- IDE-inspired workspace document aesthetic
- Modular sections: reorderable, collapsible, removable, addable
- Information-dense, developer-oriented layout
- VS Code + Notion + Linear visual language

**Entity Definition:** See [domain/ERD.md](/docs/domain/ERD.md) — ProjectCustomSection entity.

**API Endpoints:** See [api/ENDPOINTS.md](/docs/api/ENDPOINTS.md) — Projects section.

---

## Frontend Views

### Layout Structure

```
┌────────────────────────────────────────────────────┐
│ TOP IDE BAR (from AppShell)                       │
├────────────────────────────────────────────────────┤
│ PROJECT OVERVIEW DOCUMENT                          │
│                                                    │
│ [Project Header] Icon | Name | Description | Pills │
│                                                    │
│ [Summary Metrics Grid]                             │
│ [Card] [Card] [Card]                              │
│ [Card] [Card] [Card]                              │
│                                                    │
│ [Custom Sections]                                  │
│ [+ Add new section]                               │
└────────────────────────────────────────────────────┘
```

### Project Header
- **Icon:** 64-72px, rounded corners, fully editable
- **Name:** Inline editable markdown heading
- **Description:** Muted gray, multiline, inline editable
- **Metadata Pills:** branch, active sprints, AI cost

### Summary Metrics Grid

| Card | Icon | Color |
|------|------|-------|
| NÚMERO DE BACKLOGS | 📋 | purple |
| TAREAS TOTALES | ✅ | blue |
| COMPLETADO | 🎯 | green |
| MENSAJES SIN LEER | 💬 | amber |
| REPORTES | 📊 | cyan |
| MIEMBROS | 👥 | gray |

### Members Section
- Avatar + name + editable role dropdown
- IDE-like, subtle separators, soft hover

### Custom Sections
- Each section: reorder up/down, remove
- Add new section: widget selector modal

### Available Widgets
- AI Insights, Sprint Health, Activity Feed, Burndown
- Documentation, Embedded Markdown, Git Activity, Timeline
- Reports, Pinned Tasks, Notes, AI Summary, Team Velocity

---

## Routes

| View | Route |
|------|-------|
| Project Overview | `/app/projects/:projectId/dashboard` |

---

## Notes

- Sections feed into project RAG context for AI
- AI cost modal shows all providers on click
- Section order persisted via order_index