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

## Backend Entities

### Canvas Entity

```typescript
Canvas {
  id: UUID
  project_id: UUID (FK)
  name: string
  description: string
  viewport: JSON { x: number, y: number, zoom: number }
  settings: JSON {
    grid_enabled: boolean
    snap_to_grid: boolean
    background_color: string
  }
  created_by: UUID (FK to users)
  created_at: timestamp
  updated_at: timestamp
}
```

### Canvas Element Entity

```typescript
CanvasElement {
  id: UUID
  canvas_id: UUID (FK)
  type: "rectangle" | "circle" | "arrow" | "text" | "sticky_note" | "image" | "task_card" | "connector"
  position: JSON { x: number, y: number }
  size: JSON { width: number, height: number }
  rotation: number (degrees)
  style: JSON {
    fill_color: string
    stroke_color: string
    stroke_width: number
    opacity: number
    border_radius: number (for rectangles)
    font_size: number (for text)
    font_family: string
  }
  content: string (for text, sticky notes)
  z_index: number
  locked: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### Canvas Task Link Entity

```typescript
CanvasElementTaskLink {
  id: UUID
  element_id: UUID (FK)
  task_id: UUID (FK)
  link_type: "visual_state" | "navigation" | "reference"
  state_binding: JSON {
    sync_direction: "task_to_canvas" | "canvas_to_task" | "bidirectional"
    status_mappings: Array<{
      task_status: string
      element_style_override: JSON (optional style changes)
    }>
  }
  created_at: timestamp
}
```

### Default Status-to-Color Mappings

```typescript
const DEFAULT_STATUS_STYLES = {
  "To Do": { fill_color: "#94A3B8" },       // Gray
  "In Progress": { fill_color: "#3B82F6" }, // Blue
  "In Review": { fill_color: "#F59E0B" },   // Amber
  "Testing": { fill_color: "#8B5CF6" },     // Purple
  "Done": { fill_color: "#10B981" },        // Green
  "Blocked": { fill_color: "#EF4444" },    // Red
};
```

---

## API Endpoints

### Canvas CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/canvases` | List all canvases in project |
| POST | `/projects/:projectId/canvases` | Create new canvas |
| GET | `/canvases/:canvasId` | Get canvas with elements |
| PATCH | `/canvases/:canvasId` | Update canvas settings |
| DELETE | `/canvases/:canvasId` | Delete canvas |
| PATCH | `/canvases/:canvasId/viewport` | Update viewport position/zoom |

### Canvas Elements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/canvases/:canvasId/elements` | Get all elements |
| POST | `/canvases/:canvasId/elements` | Create element |
| PATCH | `/canvases/:canvasId/elements/:elementId` | Update element |
| DELETE | `/canvases/:canvasId/elements/:elementId` | Delete element |
| POST | `/canvases/:canvasId/elements/bulk` | Create multiple elements |
| PATCH | `/canvases/:canvasId/elements/reorder` | Update z-index order |

### Task Linking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/canvases/:canvasId/elements/:elementId/link` | Link element to task |
| DELETE | `/canvases/:canvasId/elements/:elementId/link` | Unlink element |
| GET | `/canvases/:canvasId/task-links` | Get all task links |
| GET | `/tasks/:taskId/canvas-links` | Get canvas elements linked to task |
| PATCH | `/canvases/:canvasId/task-links/:linkId` | Update link configuration |

### Request/Response Examples

**Create Canvas:**
```json
POST /projects/123/canvases
{
  "name": "Q3 Architecture Roadmap",
  "description": "High-level architecture diagram for Q3 initiatives",
  "settings": {
    "grid_enabled": true,
    "snap_to_grid": true,
    "background_color": "#1E293B"
  }
}
```

**Create Linked Element:**
```json
POST /canvases/canvas-uuid/elements
{
  "type": "task_card",
  "position": { "x": 100, "y": 200 },
  "size": { "width": 200, "height": 100 },
  "task_id": "task-uuid",
  "link_type": "visual_state",
  "state_binding": {
    "sync_direction": "task_to_canvas",
    "status_mappings": [
      { "task_status": "To Do", "element_style_override": { "fill_color": "#94A3B8" } },
      { "task_status": "In Progress", "element_style_override": { "fill_color": "#3B82F6" } },
      { "task_status": "Done", "element_style_override": { "fill_color": "#10B981" } }
    ]
  }
}
```

**Batch Element Creation (from AI):**
```json
POST /canvases/canvas-uuid/elements/bulk
{
  "elements": [
    {
      "type": "rectangle",
      "position": { "x": 0, "y": 0 },
      "size": { "width": 400, "height": 200 },
      "style": { "fill_color": "#3B82F6", "stroke_color": "#2563EB" },
      "content": "User Authentication Module"
    },
    {
      "type": "arrow",
      "position": { "x": 400, "y": 100 },
      "size": { "width": 100, "height": 0 },
      "style": { "stroke_color": "#64748B" }
    }
  ]
}
```

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

## Architecture Changes

### Database Migration

```sql
CREATE TABLE canvases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  viewport JSONB NOT NULL DEFAULT '{"x":0,"y":0,"zoom":1}',
  settings JSONB NOT NULL DEFAULT '{"grid_enabled":true,"snap_to_grid":true,"background_color":"#1E293B"}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE canvas_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  position JSONB NOT NULL DEFAULT '{"x":0,"y":0}',
  size JSONB NOT NULL DEFAULT '{"width":100,"height":100}',
  rotation NUMBER DEFAULT 0,
  style JSONB NOT NULL DEFAULT '{}',
  content TEXT,
  z_index INTEGER NOT NULL DEFAULT 0,
  locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE canvas_element_task_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id UUID NOT NULL REFERENCES canvas_elements(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  link_type VARCHAR(50) NOT NULL DEFAULT 'visual_state',
  state_binding JSONB NOT NULL DEFAULT '{"sync_direction":"task_to_canvas","status_mappings":[]}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_canvases_project ON canvases(project_id);
CREATE INDEX idx_canvas_elements_canvas ON canvas_elements(canvas_id);
CREATE INDEX idx_canvas_element_task_links_element ON canvas_element_task_links(element_id);
CREATE INDEX idx_canvas_element_task_links_task ON canvas_element_task_links(task_id);
```

### Backend Changes

1. **CanvasService**: CRUD for canvases
2. **CanvasElementService**: Element CRUD and bulk operations
3. **CanvasLinkService**: Task linking and state sync
4. **CanvasAIGenerator**: AI-assisted canvas creation

### Frontend Changes

1. **canvasFeature**: New feature module
   - `features/canvas/`
   - `components/CanvasEditor`
   - `components/CanvasToolbar`
   - `components/CanvasViewport`
   - `components/CanvasElement`
   - `components/TaskCardElement`
   - `components/PropertiesPanel`
   - `components/LinkedTaskSidebar`

2. **New Hooks:**
   - `useCanvas(canvasId)`
   - `useCanvasElements(canvasId)`
   - `useTaskLinks(elementId)`
   - `useCanvasViewport(canvasId)`

3. **Canvas Library Selection:**
   - React-based canvas library (e.g., Konva, Fabric.js, or custom SVG)
   - Consider: performance with 1000+ elements, touch support

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