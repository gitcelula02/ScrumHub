# Simultaneous Sprints

**Status:** Planned

---

## Overview

Multiple independent sprints run in parallel within the same project. Different sub-teams work on separate modules without interference.

**Key Constraints:**
- Each task belongs to exactly one sprint
- Sprints share same backlog pool
- Views can filter by sprint or sprint-set

**Use Cases:**
- Frontend team: 2-week sprint on UI
- Backend team: 3-week sprint on API
- QA team: 1-week sprint on test automation

**Entity Definition:** See [domain/ERD.md](/docs/domain/ERD.md) — Sprint entity with `is_parallel`, `team_tag`.

**API Endpoints:** See [api/ENDPOINTS.md](/docs/api/ENDPOINTS.md) — Sprints section.

---

## Frontend Views

### Sprint Overview Panel

**Location:** Project dashboard sidebar or header

**Components:**
- **ActiveSprintBadge**: Count of active sprints
- **SprintSelector**: Switch between sprints
- **SprintGroupTabs**: If grouped, tabs per group

### Sprint Board View

**Route:** `/app/projects/:projectId/board`

**Behavior:**
- Default: "All Active Sprints" combined board
- Sprint selector for filtering
- Columns shared, data filtered
- Task cards show sprint badge in combined view

### Sprint Selector Options
- "All Active Sprints" (default)
- "All Sprints" (includes planning/completed)
- Individual sprint selection
- Sprint by team_tag filter

### Sprint Detail View

**Route:** `/app/projects/:projectId/sprints/:sprintId`

**Components:**
- SprintHeader, SprintStats, SprintBoard, SprintCalendar

### Sprint Comparison View

**Route:** `/app/projects/:projectId/sprints/compare`

- Velocity comparison (bar chart)
- Completion rate over time (line chart)
- Burndown per sprint (multi-line)

---

## Routes

| View | Route |
|------|-------|
| Board | `/app/projects/:projectId/board` |
| Sprint Detail | `/app/projects/:projectId/sprints/:sprintId` |
| Sprint Compare | `/app/projects/:projectId/sprints/compare` |

---

## Notes

- Drag-drop between sprints requires confirmation
- Cancelled sprint tasks return to backlog
- Calendar shows multiple sprint timelines side by side
- Mini-Sprints run alongside regular sprints independently