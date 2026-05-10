# Free Board (Visual Roadmap)

**Status: Planned**

---

## Overview

The Free Board is a visual canvas workspace for creating diagrams, sketches, and schemes that are bidirectionally linked to backlog items. Visual elements on the canvas update their appearance based on the state of linked backlog items.

**Key Features:**
- Infinite canvas with pan and zoom
- Shape tools (rectangles, circles, arrows, text, sticky notes)
- Bidirectional linking to tasks, epics, stories
- Visual state sync (elements change color when linked items complete)
- Used as AI context for SCRUM planning

---

## Schema & API Reference

**Entity Definition:** See [ERD.md](/docs/ERD.md) — Canvas, CanvasElement, and CanvasElementTaskLink entities.

**API Endpoints:** See [ENDPOINTS.md](/docs/ENDPOINTS.md) — Canvases (Free Board) section for full endpoint documentation with `is_implemented` flags.

---

## Frontend Views

### Canvas List View

**Route:** `/app/projects/:projectId/canvases`

**Components:**
- **CanvasCard**: Preview thumbnail, name, last edited, linked task count
- **CreateCanvasButton**
- **QuickFilters**: All, Mine, Shared

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Canvases                                          [+ New Canvas]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌───────────────────────┐  ┌───────────────────────┐           │
│ │ ┌─────────────────┐   │  │ ┌─────────────────┐   │           │
│ │ │     [Preview]   │   │  │ │     [Preview]   │   │           │
│ │ │                 │   │  │ │                 │   │           │
│ │ └─────────────────┘   │  │ └─────────────────┘   │           │
│ │ Q3 Architecture      │  │ Sprint 14 Flow       │           │
│ │ Last edited: 2h ago  │  │ Last edited: 1d ago  │           │
│ └───────────────────────┘  └───────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Canvas Editor View

**Route:** `/app/projects/:projectId/canvases/:canvasId`

**Layout:** Full-screen canvas with floating toolbars

**Components:**
- **ToolPalette** (left sidebar, collapsible):
  - Select tool
  - Rectangle
  - Ellipse
  - Arrow/Connector
  - Text
  - Sticky Note
  - Task Card (drag from backlog)
  - Image upload
  - Shape styles (fill, stroke)

- **CanvasViewport** (center):
  - Infinite pan/zoom canvas
  - Grid overlay (toggleable)
  - Minimap (bottom-right corner)

- **PropertiesPanel** (right sidebar, contextual):
  - Element properties when selected
  - Style customization
  - Task link configuration

- **ElementToolbar** (top, contextual):
  - Bring forward / Send backward
  - Lock/Unlock
  - Duplicate
  - Delete
  - Link to task

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back   Q3 Architecture          [Share] [AI Assist] [Save]   │
├────┬────────────────────────────────────────────────────┬──────┤
│    │ ☐ □ ○ → T 📝 ▣ 🖼️ │                                │      │
│ 🖼️ │                        │                              │      │
│ 🀆 │    ┌──────────────────┐│                              │ Prop │
│ ⬚  │    │ User Auth Module ││                              │ ──── │
│ →  │    │ ████████████████ ││                              │ Fill │
│ 📝 │    │ [DONE]           ││                              │ #3B82│
│ ▣  │    └──────────────────┘│                              │ ──── │
│    │           ↓            │                              │ Link │
│    │    ┌──────┐            │                              │ task │
│    │    │ API  │            │                              │ ──── │
│    │    └──────┘            │                              │      │
├────┴────────────────────────────────────────────────────┴──────┤
│                              [−] [100%] [+]        □ Minimap     │
└─────────────────────────────────────────────────────────────────┘
```

### Task Card Element (on Canvas)

**Display:**
- Task title
- Task type icon
- Status badge with color sync
- Priority indicator
- Assignee avatar(s)
- Due date (if set)

**States:**
- Default: Shows basic info
- Hover: Highlight border, show "Click to open" tooltip
- Linked: Shows small link icon
- Sync'd: Background color reflects task status

### Linked Task Sidebar

**Location:** Right panel when element is linked

**Sections:**
- **Linked Task**: Clickable link to open task detail
- **Status Binding**: Current status + color indicator
- **Style Mappings**: List of status → style mappings
- **Sync Direction**: Toggle between Task→Canvas or Bidirectional

### AI Assist Panel

**Features:**
- "Draw this architecture" - describe in natural language
- "Add sprint flow" - AI generates template
- "Link to backlog" - Select and link multiple elements
- "Update styles" - Apply consistent styling

---

## Implementation Checklist

- [ ] Database migration for canvases, elements, links
- [ ] Backend: CanvasService CRUD
- [ ] Backend: CanvasElementService with bulk support
- [ ] Backend: CanvasLinkService
- [ ] Backend: CanvasAIGenerator
- [ ] Frontend: canvas feature module
- [ ] Frontend: CanvasEditor view
- [ ] Frontend: ToolPalette component
- [ ] Frontend: CanvasViewport with pan/zoom
- [ ] Frontend: Element rendering (rect, circle, text, etc.)
- [ ] Frontend: TaskCard element with status sync
- [ ] Frontend: PropertiesPanel
- [ ] Frontend: LinkedTaskSidebar
- [ ] Frontend: Minimap component
- [ ] Frontend: AI Assist panel
- [ ] E2E tests for canvas creation and linking
- [ ] Documentation update (ERD.md, ENDPOINTS.md, TRUTH.md)

---

## Notes

- Canvas viewport state should be persisted per user per canvas
- Large canvases (500+ elements) may need virtual rendering
- Task links should update in real-time via WebSocket when task status changes
- Export canvas to PNG/SVG should be supported
- AI-generated canvases should be clearly marked
- Consider mobile/tablet support for canvas viewing (not necessarily editing)