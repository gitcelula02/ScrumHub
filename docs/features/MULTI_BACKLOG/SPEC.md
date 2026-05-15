# Multi-Backlog Orchestration

**Status:** Planned

---

## Overview

Allows projects to contain multiple specialized backlogs instead of a single monolithic backlog. Different sub-teams work within their own context while maintaining project-wide visibility.

**Use Cases:**
- "Development Backlog" for developers
- "QA/Testing Backlog" for testers
- "Strategic Planning Backlog" for product owners

**Entity Definition:** See [domain/ERD.md](/docs/domain/ERD.md) — Backlog entity.

**API Endpoints:** See [api/ENDPOINTS.md](/docs/api/ENDPOINTS.md) — Backlogs section.

---

## Frontend Views

### Backlog Selector

**Location:** Header, alongside project selector

**Behavior:**
- Dropdown showing all backlogs in project
- Each shows: name, type icon, task count, color indicator
- Active backlog highlighted
- Keyboard shortcut: Ctrl+B

### Backlog List View

**Route:** `/app/projects/:projectId/backlogs`

**Components:**
- **BacklogTabs**: Horizontal tabs for each backlog
- **BacklogHeader**: Name, description, type badge, settings
- **TaskTable**: Filterable task list
- **BacklogStats**: Counts by status, sprint, priority
- **QuickFilters**: My Tasks, Due Soon, Unassigned

### Backlog Settings Modal

- Edit name, description, color
- Change type
- Set as default
- Configure visibility
- Delete (admin only)

---

## Routes

| View | Route |
|------|-------|
| Backlog List | `/app/projects/:projectId/backlogs` |

---

## Notes

- First backlog auto-set as `is_default: true`
- Users can set preferred default in settings
- Deletion soft-deletes and moves tasks to default backlog