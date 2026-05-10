# Project Overview

**Status: Planned**

---

## Overview

The Project Overview is the default landing view when opening a project workspace. It presents the project as a customizable workspace document with modular sections, resembling a markdown file rendered inside an IDE.

**Key Characteristics:**
- IDE-inspired workspace document aesthetic
- Modular sections: reorderable, collapsible, removable, addable
- Information-dense, developer-oriented layout
- VS Code + Notion + Linear visual language

---

## Backend Entities

### ProjectCustomSection Entity

**Purpose:** User-defined custom sections for project (vision, mission, goals, etc.)

```typescript
ProjectCustomSection {
  id: UUID
  project_id: UUID (FK)
  user_id: UUID (FK - who created)
  key: string (e.g., "vision", "mission", "goal", or user-defined)
  value: text (markdown content)
  order_index: number
  created_at: timestamp
  updated_at: timestamp
}
```

**Constraints:**
- `key` is user-defined string
- Sections feed into project RAG context for AI
- Order determines display order in Project Overview

### ProjectStats (Existing, Enhanced)

```typescript
ProjectStats {
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  pending_tasks: number
  overdue_tasks: number
  completion_percentage: number
  total_backlogs: number
  active_sprints: number
  total_members: number
  unread_messages: number
}
```

---

## API Endpoints

### Project Overview Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId` | Get project details (name, description, icon, color) |
| PATCH | `/projects/:projectId` | Update project (name, description, icon) |
| GET | `/projects/:projectId/stats` | Get computed project statistics |
| GET | `/projects/:projectId/sections` | Get all custom sections |
| POST | `/projects/:projectId/sections` | Create custom section |
| PATCH | `/projects/:projectId/sections/:sectionId` | Update section (key, value, order) |
| DELETE | `/projects/:projectId/sections/:sectionId` | Delete section |
| PATCH | `/projects/:projectId/sections/reorder` | Reorder sections |

### Members & Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/members` | Get project members with roles |
| PATCH | `/projects/:projectId/members/:userId` | Update member role |

### AI Credits (Per Project)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/ai-usage` | Get project AI spending by API provider |

### Request/Response Examples

**Get Project Details:**
```json
GET /projects/project-uuid

Response:
{
  "data": {
    "id": "project-uuid",
    "name": "ScrumHub",
    "description": "Workspace tipo IDE para gestionar epics, sprints y backlog con foco en flujo continuo.",
    "goal": "Deliver an IDE-inspired agile workspace",
    "icon": "📘",
    "color": "#10B981",
    "status": "active",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Update Project:**
```json
PATCH /projects/project-uuid
{
  "name": "ScrumHub V2",
  "description": "Updated description",
  "icon": "🚀"
}

Response:
{
  "data": {
    "id": "project-uuid",
    "name": "ScrumHub V2",
    "description": "Updated description",
    "icon": "🚀",
    "updated_at": "..."
  }
}
```

**Get Project Sections:**
```json
GET /projects/project-uuid/sections

Response:
{
  "data": [
    { "id": "section-1", "key": "vision", "value": "Our vision...", "order_index": 0 },
    { "id": "section-2", "key": "goals", "value": "## Goals\n- Goal 1...", "order_index": 1 }
  ]
}
```

**Create Section:**
```json
POST /projects/project-uuid/sections
{
  "key": "vision",
  "value": "Our vision is to create the most intuitive project management experience.",
  "order_index": 0
}

Response:
{
  "data": {
    "id": "new-section-uuid",
    "key": "vision",
    "value": "Our vision is to create the most intuitive project management experience.",
    "order_index": 0,
    "created_at": "..."
  }
}
```

**Update Section:**
```json
PATCH /projects/project-uuid/sections/section-uuid
{
  "key": "mission",
  "value": "## Our Mission\nUpdated mission statement...",
  "order_index": 1
}
```

**Reorder Sections:**
```json
PATCH /projects/project-uuid/sections/reorder
{
  "section_ids": ["section-2", "section-1", "section-3"]
}
```

**Get Project AI Usage:**
```json
GET /projects/project-uuid/ai-usage

Response:
{
  "data": {
    "providers": [
      { "provider": "deepseek", "cost": 2.45, "model": "deepseek-chat" },
      { "provider": "openai", "cost": 0.85, "model": "gpt-4o-mini" }
    ],
    "total_cost": 3.30,
    "credits_remaining": 42.50,
    "credits_depleted": false
  }
}
```

**Get Project Members:**
```json
GET /projects/project-uuid/members

Response:
{
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "scrum_role": "developer",
      "is_admin": false,
      "joined_at": "...",
      "user": { "id": 5, "username": "john", "avatar_url": "..." }
    },
    {
      "id": 2,
      "user_id": 8,
      "scrum_role": "qa",
      "is_admin": true,
      "joined_at": "...",
      "user": { "id": 8, "username": "jane", "avatar_url": "..." }
    }
  ]
}
```

**Update Member Role:**
```json
PATCH /projects/project-uuid/members/5
{
  "scrum_role": "senior-developer",
  "is_admin": false
}
```

---

## Frontend Views

### Layout Structure

```
┌────────────────────────────────────────────────────┐
│ TOP IDE BAR (from AppShell - tabs handled there)  │
├────────────────────────────────────────────────────┤
│                                                    │
│ PROJECT OVERVIEW DOCUMENT                          │
│                                                    │
│ [Project Header Section]                          │
│ [Icon] [Name] [Description] [Metadata Pills]      │
│                                                    │
│ [Summary Metrics Grid]                             │
│ [Card] [Card] [Card]                               │
│ [Card] [Card] [Card]                               │
│                                                    │
│ [Custom Sections]                                  │
│ ## RESUMEN / ## MIEMBROS / ## ROLES               │
│                                                    │
│ [+ Add new section]                               │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Project Header Section

**Layout:**
```
[Editable Icon]   [Editable Project Info]
```

- **Icon**: 64px-72px square, rounded corners (14px-18px), fully editable
- **Name**: Markdown-style heading (# name), inline editable
- **Description**: Muted gray, multiline, markdown-compatible, inline editable
- **Metadata Pills Row**: branch, active sprints, AI cost (in dollars)

### Metadata Pills Row

**Pills displayed:**
- `branch main` (Git branch indicator style)
- `1 active sprints`
- `$3.30 AI cost` (provider cost with max 4 shown, clickable modal)

**Pill Style:**
- Dark background (`rgba(255,255,255,0.05)`)
- Soft border (`rgba(255,255,255,0.06)`)
- Small rounded corners
- Monospace typography

### Summary Metrics Grid

**Desktop Layout:** 3 columns, 16px-20px gap

**Cards (6):**
| Card | Icon | Color Accent |
|------|------|--------------|
| NÚMERO DE BACKLOGS | 📋 | purple |
| TAREAS TOTALES | ✅ | blue |
| COMPLETADO | 🎯 | green |
| MENSAJES SIN LEER | 💬 | amber |
| REPORTES | 📊 | cyan |
| MIEMBROS | 👥 | gray |

**Card Style:**
- Minimal dark panels
- Subtle borders
- Soft hover glow
- Compact data density

### Members Section

**Table Columns:**
| MIEMBRO | ROL |
|---------|-----|

**Row Contents:**
- Avatar
- Member name
- Editable role dropdown

**Style:** Lightweight, IDE-like, subtle separators, soft hover

### Custom Roles Section

**Each Role Card Contains:**
- Icon
- Title
- Short description
- Edit/delete icons on hover

### Section Controls

Each section has top-right controls:
- `↑` move up
- `↓` move down
- `×` remove section

### Add New Section Area

**Location:** Bottom of the page

**Appearance:** Large dashed container, centered content, subtle hover effect

**Available Widgets:**
- AI Insights
- Sprint Health
- Activity Feed
- Burndown
- Documentation
- Embedded Markdown
- Git Activity
- Timeline
- Reports
- Pinned Tasks
- Notes
- AI Summary
- Team Velocity

---

## Widget Types (Add Section)

### AI Insights Widget
Displays AI-generated summary of project health, potential blockers, and recommendations.

### Sprint Health Widget
Shows active sprint progress: tasks completed, in progress, blocked.

### Activity Feed Widget
Recent project activity: task creations, status changes, comments.

### Burndown Widget
Visual burndown chart for active sprint.

### Documentation Widget
Embedded markdown content for project documentation.

### Embedded Markdown Widget
Custom markdown content added by user.

### Git Activity Widget
Recent commits and PRs linked to project (if integrated).

### Timeline Widget
Project timeline with milestones.

### Reports Widget
Recent project reports (from Report Hub).

### Pinned Tasks Widget
Quick access to important tasks pinned by user.

### Notes Widget
Personal notes for the project.

### AI Summary Widget
Daily AI-generated summary of project status.

### Team Velocity Widget
Team velocity metrics over recent sprints.

---

## Database Schema

### ProjectCustomSections Table

```sql
CREATE TABLE project_custom_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  key VARCHAR(255) NOT NULL,
  value TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_sections_project ON project_custom_sections(project_id);
```

### AI Usage Tracking (Enhancement)

```sql
-- Project AI usage junction (tracks which API keys used per project)
CREATE TABLE project_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  api_key_id UUID NOT NULL REFERENCES api_key_vault(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_ai_usage_project ON project_ai_usage(project_id);
CREATE INDEX idx_project_ai_usage_period ON project_ai_usage(period_start, period_end);
```

---

## Implementation Checklist

- [ ] Backend: Enhanced project stats endpoint (add backlogs_count, unread_messages)
- [ ] Backend: Project custom sections CRUD
- [ ] Backend: Sections reorder endpoint
- [ ] Backend: Project AI usage aggregation endpoint
- [ ] Frontend: ProjectOverview feature module
- [ ] Frontend: Project header with inline editing
- [ ] Frontend: Metadata pills row
- [ ] Frontend: Summary metrics grid
- [ ] Frontend: Members section with editable roles
- [ ] Frontend: Custom sections rendering
- [ ] Frontend: Section toolbar controls (reorder, remove)
- [ ] Frontend: Add new section area + widget selector modal
- [ ] Frontend: AI cost modal (show all providers on click)
- [ ] E2E tests for overview interactions
- [ ] Documentation update (ERD.md, ENDPOINTS.md)