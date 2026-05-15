# Free Board (Visual Roadmap)

**Status:** Planned

---

## Overview

Visual canvas workspace for creating diagrams, sketches, and schemes bidirectionally linked to backlog items. Elements update appearance based on linked task state.

**Key Features:**
- Infinite canvas with pan and zoom
- Shape tools (rectangles, circles, arrows, text, sticky notes)
- Bidirectional linking to tasks, epics, stories
- Visual state sync (elements change color when linked items complete)
- AI context for SCRUM planning

**Entity Definition:** See [domain/ERD.md](/docs/domain/ERD.md) — Canvas, CanvasElement, CanvasElementTaskLink entities.

**API Endpoints:** See [api/ENDPOINTS.md](/docs/api/ENDPOINTS.md) — Canvases section.

---

## Frontend Views

### Canvas List View

**Route:** `/app/projects/:projectId/canvases`

**Components:**
- **CanvasCard**: Preview thumbnail, name, last edited, linked task count
- **CreateCanvasButton**
- **QuickFilters**: All, Mine, Shared

### Canvas Editor View

**Route:** `/app/projects/:projectId/canvases/:canvasId`

**Layout:** Full-screen canvas with floating toolbars

**Components:**
- **ToolPalette** (left): Select, Rectangle, Ellipse, Arrow, Text, Sticky Note, Task Card, Image
- **CanvasViewport** (center): Infinite pan/zoom, grid overlay, minimap
- **PropertiesPanel** (right): Element properties, style, task link config
- **ElementToolbar** (top): Bring forward/back, lock, duplicate, delete, link to task

### Task Card Element (on Canvas)

**Display:**
- Task title, type icon, status badge with color sync
- Priority indicator, assignee avatars, due date

**States:**
- Default: Basic info
- Hover: Highlight border, "Click to open" tooltip
- Linked: Small link icon
- Synced: Background color reflects task status

---

## Routes

| View | Route |
|------|-------|
| Canvas List | `/app/projects/:projectId/canvases` |
| Canvas Editor | `/app/projects/:projectId/canvases/:canvasId` |

---

## Notes

- Canvas viewport state persisted per user per canvas
- Large canvases (500+ elements) may need virtual rendering
- Task links should update via WebSocket on status change
- Export to PNG/SVG should be supported
- AI-generated canvases should be clearly marked