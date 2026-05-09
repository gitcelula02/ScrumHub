# Mini-Sprints

**Status: Planned**

---

## Overview

Mini-Sprints are short-duration, tactical sprint bursts designed for urgent work that doesn't warrant a full sprint cycle. They are "tactical bursts" — typically 1 to 3 days — used for hotfixes, quick research, last-minute polish, or time-sensitive tasks that need focused attention outside the normal sprint rhythm.

**Key Distinction from Regular Sprints:**

| Aspect | Regular Sprint | Mini-Sprint |
|--------|----------------|-------------|
| **Duration** | 1-4 weeks | 1-3 days |
| **Purpose** | Planned development work | Tactical, time-sensitive tasks |
| **Planning** | Full sprint planning ceremony | Lightweight, async setup |
| **Scope** | Feature development, releases | Hotfixes, PO research, polish, urgent QA |
| **Team Involvement** | Full team | Subset or individual |
| **Backlog** | Standard backlogs | Quick-capture backlog or existing |

**Use Cases:**

1. **Hotfix Mini-Sprint**: Critical bug discovered after release, needs fixing within 24-48 hours
2. **PO Research Mini-Sprint**: Product Owner needs to validate user feedback on new feature within 2 days
3. **Polish Mini-Sprint**: Final UI/UX polish before a demo or release
4. **QA Regression Mini-Sprint**: Quick testing cycle for a specific feature area
5. **Spike Mini-Sprint**: Time-boxed research spike to evaluate a technical approach

---

## Backend Entities

### MiniSprint Entity

```typescript
MiniSprint {
  id: UUID
  project_id: UUID (FK)
  parent_sprint_id: UUID (FK, nullable - links to parent regular sprint if applicable)
  name: string
  description: string (markdown)
  goal: string (What this mini-sprint aims to achieve)
  type: "hotfix" | "research" | "polish" | "qa" | "spike" | "custom"
  start_date: date
  end_date: date
  duration_hours: number (calculated from start/end, max 72)
  status: "planning" | "active" | "completed" | "cancelled"
  color: string (hex)
  auto_complete: boolean (auto-complete when end_date reached)
  priority: "low" | "medium" | "high" | "critical"
  created_by: UUID (FK to users)
  created_at: timestamp
  updated_at: timestamp
}
```

### MiniSprintTask Assignment

```typescript
MiniSprintTask {
  id: UUID
  mini_sprint_id: UUID (FK)
  task_id: UUID (FK)
  assigned_at: timestamp
  source: "moved_from_backlog" | "moved_from_sprint" | "created_directly"
  notes: string (optional - why this task was added)
}
```

### Quick Capture Backlog

```typescript
QuickCaptureBacklog {
  id: UUID
  project_id: UUID (FK)
  name: string (default: "Quick Tasks")
  description: string
  is_active: boolean
  created_at: timestamp
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/mini-sprints` | List all mini-sprints |
| POST | `/projects/:projectId/mini-sprints` | Create a new mini-sprint |
| GET | `/mini-sprints/:miniSprintId` | Get mini-sprint details |
| PATCH | `/mini-sprints/:miniSprintId` | Update mini-sprint |
| DELETE | `/mini-sprints/:miniSprintId` | Delete mini-sprint |
| POST | `/mini-sprints/:miniSprintId/activate` | Start the mini-sprint |
| POST | `/mini-sprints/:miniSprintId/complete` | Complete the mini-sprint |
| POST | `/mini-sprints/:miniSprintId/cancel` | Cancel the mini-sprint |
| GET | `/mini-sprints/:miniSprintId/tasks` | Get tasks in mini-sprint |
| POST | `/mini-sprints/:miniSprintId/tasks` | Add task(s) to mini-sprint |
| DELETE | `/mini-sprints/:miniSprintId/tasks/:taskId` | Remove task from mini-sprint |
| GET | `/projects/:projectId/mini-sprints/active` | Get currently active mini-sprints |
| GET | `/projects/:projectId/quick-capture` | Get quick capture backlog |
| POST | `/projects/:projectId/quick-capture/tasks` | Add task directly to quick capture |

### Request/Response Examples

**Create Mini-Sprint:**
```json
POST /projects/123/mini-sprints
{
  "name": "PO User Feedback Research",
  "goal": "Validate user sentiment on latest feature update through feedback analysis",
  "type": "research",
  "start_date": "2026-05-15",
  "end_date": "2026-05-16",
  "priority": "high"
}
```

**Response:**
```json
{
  "id": "uuid",
  "project_id": "123",
  "name": "PO User Feedback Research",
  "goal": "Validate user sentiment on latest feature update through feedback analysis",
  "type": "research",
  "start_date": "2026-05-15",
  "end_date": "2026-05-16",
  "duration_hours": 48,
  "status": "planning",
  "color": "#F59E0B",
  "priority": "high",
  "created_by": "user-uuid",
  "created_at": "2026-05-09T12:00:00Z"
}
```

**Add Task to Mini-Sprint:**
```json
POST /mini-sprints/uuid/tasks
{
  "task_id": "task-uuid",
  "source": "moved_from_backlog",
  "notes": "Directly related to user feedback analysis"
}
```

---

## Frontend Views

### Mini-Sprint Banner (Dashboard)

**Location:** Project dashboard, alongside active sprints

**Display:**
```
┌────────────────────────────────────────────────────────────────┐
│ ⚡ MINI-SPRINTS                                                │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🔥 [CRITICAL] PO User Feedback Research     24h remaining  │ │
│ │    Research · Ends May 16                                 │ │
│ │    [Open]                                                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ + Create Mini-Sprint                                          │
└────────────────────────────────────────────────────────────────┘
```

### Mini-Sprint Creation Modal

**Fields:**
- Name (required)
- Goal (markdown, required)
- Type (dropdown: Hotfix, Research, Polish, QA, Spike, Custom)
- Priority (Low, Medium, High, Critical)
- Start Date (required, defaults to today)
- End Date (required, max 3 days from start)
- Color (optional)
- Link to Parent Sprint (optional, dropdown of active/planned sprints)
- Quick Task Selection (optional, pick tasks to add)

**Duration Warning:**
- If end_date > 3 days from start_date, show warning: "Mini-sprints are designed for 1-3 days. Consider creating a regular sprint for longer durations."

### Mini-Sprint Board View

**Route:** `/app/projects/:projectId/mini-sprints/:miniSprintId/board`

**Design:**
- Compact Kanban board optimized for speed
- Fewer columns (To Do, In Progress, Done)
- Larger task cards for quick scanning
- Prominent timer/countdown
- Quick add task input always visible

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔥 PO User Feedback Research          [⚡ Active] [Edit] [⚙️] │
│ Goal: Validate user sentiment on latest feature update         │
│                                                         24h left│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TO DO                    IN PROGRESS           DONE            │
│  ─────────────────────────────────────────────────────────────  │
│  ┌──────────────────┐     ┌──────────────────┐                 │
│  │ Task: Analyze    │     │ Task: Create     │                 │
│  │ support tickets  │     │ survey export    │                 │
│  │ 📅 May 15        │     │ 📅 May 15        │                 │
│  └──────────────────┘     └──────────────────┘                 │
│                                                                 │
│  + Add task                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mini-Sprint List View

**Route:** `/app/projects/:projectId/mini-sprints`

**Components:**
- **MiniSprintCard**: Name, type badge, duration, status, priority indicator
- **FilterTabs**: All, Active, Completed, Cancelled
- **QuickCreateButton**: Opens creation modal

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Mini-Sprints                        [+ Create Mini-Sprint]     │
├─────────────────────────────────────────────────────────────────┤
│ [All] [Active] [Completed] [Cancelled]                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 🔥 PO User Feedback Research          Research            │  │
│ │    Active · 24h left · May 15-16                           │  │
│ │    [Open Board]                                            │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ ⚡ UI Polish Sprint                       Polish           │  │
│ │    Completed · May 10-11 · 6 tasks completed              │  │
│ │    [View Summary]                                          │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mini-Sprint Detail Panel

**Location:** Side panel when mini-sprint is selected

**Sections:**
- **Header**: Name, type icon, status badge
- **Countdown Timer**: Prominent display of time remaining
- **Goal**: Markdown description
- **Task Progress**: X of Y tasks completed
- **Quick Actions**: Add task, Complete early, Cancel
- **Activity Feed**: Recent changes to mini-sprint tasks

### Quick Capture Mode

**Purpose:** Rapidly capture tasks without full task creation modal

**Behavior:**
- Floating input always visible on mini-sprint board
- Type task title, press Enter to create
- Task automatically added to "To Do" column
- Optional: Quick-assign, set priority inline

---

## Relationship with Regular Sprints

### Parent-Child Relationship

A mini-sprint can optionally be linked to a parent regular sprint:

```typescript
// When mini-sprint is linked to a sprint
MiniSprint {
  ...
  parent_sprint_id: UUID (FK to Sprint)
  relationship_note: string // e.g., "PO research for Sprint 12 feature"
}
```

**Use Cases:**
- Mini-sprint spawned from a specific user story in a sprint
- Quick research that feeds into sprint planning
- Hotfix that originated from a sprint bug

### Independent Mini-Sprints

Mini-sprints can also exist independently:
- Not tied to any active sprint
- Useful for PO work outside sprint scope
- Emergency fixes outside normal sprint cycle

### Board View Integration

When viewing a sprint board, mini-sprints can appear as:
- **Sidebar cards**: Quick view of active mini-sprints
- **Filter option**: "Show mini-sprint tasks" toggle
- **Color coding**: Tasks from mini-sprints have distinct border/styling

---

## Integration with Other Features

### Multi-Backlog Integration
- Mini-sprints can be assigned to specific backlogs
- Quick Capture Backlog per backlog type
- Mini-sprint tasks visible in backlog views

### Inter-Backlog Automation
- Triggers can create mini-sprints automatically
- e.g., "When critical bug reported → Create Hotfix Mini-Sprint"

### Simultaneous Sprints
- Multiple mini-sprints can run alongside regular sprints
- Different team members can work on different mini-sprints concurrently
- Mini-sprints do not interfere with sprint capacity calculations

### Report Hub
- Mini-sprint completion generates summary
- Short-form report (better for rapid turnaround)
- Can feed insights into next regular sprint retrospective

---

## Architecture Changes

### Database Migration

```sql
CREATE TABLE mini_sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'custom',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'planning',
  color VARCHAR(7) DEFAULT '#F59E0B',
  auto_complete BOOLEAN NOT NULL DEFAULT true,
  priority VARCHAR(50) NOT NULL DEFAULT 'medium',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_duration CHECK (end_date <= start_date + INTERVAL '3 days')
);

CREATE TABLE mini_sprint_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mini_sprint_id UUID NOT NULL REFERENCES mini_sprints(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL DEFAULT 'moved_from_backlog',
  notes TEXT,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (mini_sprint_id, task_id)
);

CREATE TABLE quick_capture_backlogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT 'Quick Tasks',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mini_sprints_project ON mini_sprints(project_id);
CREATE INDEX idx_mini_sprints_parent ON mini_sprints(parent_sprint_id);
CREATE INDEX idx_mini_sprints_status ON mini_sprints(status);
CREATE INDEX idx_mini_sprint_tasks_sprint ON mini_sprint_tasks(mini_sprint_id);
CREATE INDEX idx_mini_sprint_tasks_task ON mini_sprint_tasks(task_id);
```

### Backend Changes

1. **MiniSprintService**: CRUD operations
2. **MiniSprintTaskService**: Task assignment to mini-sprints
3. **QuickCaptureService**: Quick task capture
4. **NotificationService**: Mini-sprint reminders and completions

### Frontend Changes

1. **miniSprints Feature Module**:
   - `features/mini-sprints/`
   - `components/MiniSprintCard`
   - `components/MiniSprintBanner`
   - `components/MiniSprintBoard`
   - `components/MiniSprintCreateModal`
   - `components/MiniSprintDetailPanel`
   - `components/QuickCaptureInput`
   - `hooks/useMiniSprints`
   - `hooks/useMiniSprintBoard`

2. **Integration Points:**
   - Dashboard: Add mini-sprint banner alongside sprint overview
   - Board view: Show mini-sprint filter option
   - Task detail: Show "Move to Mini-Sprint" action

---

## Implementation Checklist

- [ ] Database migration for mini_sprints, mini_sprint_tasks, quick_capture_backlogs
- [ ] Backend: MiniSprintService CRUD
- [ ] Backend: MiniSprintTaskService
- [ ] Backend: QuickCaptureService
- [ ] Frontend: mini-sprints feature module
- [ ] Frontend: MiniSprintCard component
- [ ] Frontend: MiniSprintBanner (dashboard)
- [ ] Frontend: MiniSprintBoard view
- [ ] Frontend: MiniSprintCreateModal with validation
- [ ] Frontend: MiniSprintDetailPanel
- [ ] Frontend: QuickCaptureInput component
- [ ] Frontend: Integration with dashboard
- [ ] Frontend: Integration with board view
- [ ] E2E tests for mini-sprint lifecycle
- [ ] Documentation update (ERD.md, ENDPOINTS.md, TRUTH.md)

---

## Notes

- Mini-sprints should have distinct visual styling (amber/orange tones) to differentiate from regular sprints
- Duration should be strictly enforced (max 72 hours / 3 days)
- Auto-complete should trigger notifications to sprint participants
- When mini-sprint completes, tasks can be moved to backlog or next sprint
- Quick Capture mode should support keyboard-first workflow for speed
- Mini-sprint type icons should be consistent: 🔥 (hotfix), 📊 (research), ✨ (polish), 🧪 (QA), 💡 (spike)