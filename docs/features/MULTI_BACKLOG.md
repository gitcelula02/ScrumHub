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

## Schema & API Reference

**Entity Definition:** See [ERD.md](/docs/ERD.md) — Backlog entity and BacklogTask join.

**API Endpoints:** See [ENDPOINTS.md](/docs/ENDPOINTS.md) — Backlogs (Multi-Backlog) section for full endpoint documentation with `is_implemented` flags.

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