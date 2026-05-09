# Multi-Backlog Orchestration

**Status: Planned**

---

## Overview

Multi-Backlog Orchestration allows projects to contain multiple specialized backlogs instead of a single monolithic backlog. This enables different sub-teams to work within their own context while maintaining project-wide visibility.

**Use Cases:**
- A "Development Backlog" for developers working on features
- A "QA/Testing Backlog" for testers managing test cases and bug reports
- A "Strategic Planning Backlog" for product owners managing long-term planning

---

## Backend Entities

### Backlog Entity

```typescript
Backlog {
  id: UUID
  project_id: UUID (FK)
  name: string
  description: string (markdown)
  type: "development" | "qa_testing" | "strategic" | "custom"
  color: string (hex)
  order: number
  is_default: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

**Relationships:**
- Project ↔ Backlogs: One-to-Many
- Backlog ↔ Tasks: One-to-Many (tasks belong to one backlog)
- Backlog ↔ Boards: One-to-Many

### Backlog Zone (Conceptual)

Each backlog is organized into zones representing different workflow stages:

```typescript
BacklogZone {
  id: UUID
  backlog_id: UUID (FK)
  name: string ("Dev Zone", "QA Zone", "PO Zone")
  type: "development" | "testing" | "planning"
  order: number
  associated_roles: Role[]
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/backlogs` | List all backlogs for a project |
| POST | `/projects/:projectId/backlogs` | Create a new backlog |
| GET | `/backlogs/:backlogId` | Get backlog details |
| PATCH | `/backlogs/:backlogId` | Update backlog |
| DELETE | `/backlogs/:backlogId` | Delete backlog (soft delete) |
| PATCH | `/backlogs/:backlogId/reorder` | Reorder backlog |
| GET | `/backlogs/:backlogId/tasks` | Get tasks in backlog |
| GET | `/backlogs/:backlogId/boards` | Get boards linked to backlog |

### Request/Response Examples

**Create Backlog:**
```json
POST /projects/123/backlogs
{
  "name": "Development Backlog",
  "description": "Main development tasks and features",
  "type": "development",
  "color": "#3B82F6"
}
```

**Response:**
```json
{
  "id": "uuid",
  "project_id": "123",
  "name": "Development Backlog",
  "description": "Main development tasks and features",
  "type": "development",
  "color": "#3B82F6",
  "order": 0,
  "is_default": false,
  "created_at": "2026-05-09T12:00:00Z",
  "updated_at": "2026-05-09T12:00:00Z"
}
```

---

## Frontend Views

### Backlog Selector

**Location:** Header, alongside project selector

**Behavior:**
- Dropdown showing all backlogs in current project
- Each backlog shows: name, type icon, task count, color indicator
- Active backlog highlighted
- Quick-switch via keyboard shortcut (Ctrl+B)
- Badge showing unread activity per backlog

**Visual Design:**
```
┌─────────────────────────────────────┐
│ [Project Selector ▼] [Backlog ▼]   │
│  Development    ✓                    │
│  QA/Testing                          │
│  Strategic Planning                  │
└─────────────────────────────────────┘
```

### Backlog List View

**Route:** `/app/projects/:projectId/backlogs`

**Components:**
- **BacklogTabs**: Horizontal tabs for each backlog (scrollable if >5)
- **BacklogHeader**: Shows backlog name, description, type badge, settings cog
- **TaskTable**: Filterable list of tasks in current backlog
- **BacklogStats**: Task counts by status, sprint, priority
- **QuickFilters**: Preset filters (My Tasks, Due Soon, Unassigned)

**Empty State:**
- Illustration + "This backlog is empty"
- "Create your first task" or "Ask AI to populate backlog"
- Quick-add task input

### Backlog Settings Modal

**Accessible from:** Backlog header cogwheel

**Options:**
- Edit name, description, color
- Change backlog type
- Set as default backlog
- Configure zone visibility
- Delete backlog (admin only, requires confirmation)

### Kanban Board (Multi-Backlog Aware)

**Behavior:**
- Board view filters to current active backlog
- When switching backlogs, board columns update to backlog's statuses
- Cross-backlog task movement triggers confirmation modal

---

## Architecture Changes

### Database Migration

```sql
-- Create backlogs table
CREATE TABLE backlogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'custom',
  color VARCHAR(7) DEFAULT '#6366F1',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add backlog_id to tasks (optional, tasks can exist outside backlogs)
ALTER TABLE tasks ADD COLUMN backlog_id UUID REFERENCES backlogs(id);

-- Create index for project -> backlogs lookup
CREATE INDEX idx_backlogs_project ON backlogs(project_id);
CREATE INDEX idx_tasks_backlog ON tasks(backlog_id);
```

### Backend Changes

1. **BacklogService**: New service for CRUD operations
2. **TaskService**: Add `backlog_id` to task queries
3. **ProjectService**: Include backlogs in project response
4. **BoardService**: Filter boards by active backlog

### Frontend Changes

1. **backlogFeature**: New feature module
   - `features/backlog-orcherstration/`
   - `features/backlog-orcherstration/components/`
   - `features/backlog-orcherstration/hooks/`
   - `features/backlog-orcherstration/services/`
   - `features/backlog-orcherstration/types/`

2. **New Hooks:**
   - `useBacklogs(projectId)` - fetches all backlogs
   - `useActiveBacklog(backlogId)` - manages active backlog state
   - `useBacklogTasks(backlogId)` - fetches tasks for backlog

3. **New Routes:**
   - `/app/projects/:projectId/backlogs` - backlog list/selector view
   - `/app/projects/:projectId/backlogs/:backlogId` - specific backlog detail

4. **State Management:**
   - `useActiveBacklog` context for cross-component backlog state
   - Persisted to localStorage per project

---

## Implementation Checklist

- [ ] Database migration for backlogs table
- [ ] Backend: BacklogService CRUD
- [ ] Backend: Task update to include backlog_id
- [ ] Backend: Board filtering by backlog
- [ ] Frontend: backlog-orcherstration feature module
- [ ] Frontend: BacklogSelector component
- [ ] Frontend: BacklogTabs component
- [ ] Frontend: Backlog list view
- [ ] Frontend: Backlog settings modal
- [ ] Frontend: Board view backlog filtering
- [ ] Frontend: Route configuration
- [ ] Frontend: Integration with useEntityTheme for backlog colors
- [ ] E2E tests for backlog creation and switching
- [ ] Documentation update (ERD.md, ENDPOINTS.md, TRUTH.md)

---

## Notes

- The first backlog created in a project should be automatically set as `is_default: true`
- Users should be able to set their preferred default backlog in user settings
- Backlog deletion should soft-delete and warn if tasks exist
- When deleting a backlog, tasks should be moved to project's default backlog