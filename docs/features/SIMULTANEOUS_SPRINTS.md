# Simultaneous Sprints

**Status: Planned**

---

## Overview

Simultaneous Sprints allow multiple independent sprints to run in parallel within the same project. This enables different sub-teams to work on separate modules or feature tracks without interfering with each other's workflow.

**Key Constraints:**
- Each task belongs to exactly one sprint
- Sprints run independently but share the same backlog pool
- Teams can filter views by specific sprint or sprint-set

**Use Cases:**
- Frontend team runs a 2-week sprint on UI features
- Backend team runs a 3-week sprint on API development
- QA team runs a 1-week sprint on test automation

---

## Schema & API Reference

**Entity Definition:** See [ERD.md](/docs/ERD.md) — Sprint entity with `is_parallel`, `team_tag`, and SprintGroup/SprintGroupMembership.

**API Endpoints:** See [ENDPOINTS.md](/docs/ENDPOINTS.md) — Sprints (Simultaneous) section for full endpoint documentation with `is_implemented` flags.

---

## Frontend Views

### Sprint Overview Panel

**Location:** Project dashboard sidebar or header dropdown

**Components:**
- **ActiveSprintBadge**: Shows count of active sprints
- **SprintSelector**: Dropdown to switch between sprints
- **SprintGroupTabs**: If sprints are grouped, tabs per group

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ 🏃 3 Active Sprints        [View All ▼]             │
│                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│ │ Frontend    │ │ Backend     │ │ QA Sprint   │     │
│ │ ████░░ 45%  │ │ ██░░░░ 30%  │ │ █████░ 72%  │     │
│ │ 12 days     │ │ 18 days     │ │ 3 days      │     │
│ └─────────────┘ └─────────────┘ └─────────────┘     │
└─────────────────────────────────────────────────────┘
```

### Sprint Board View (Multi-Sprint Aware)

**Route:** `/app/projects/:projectId/board` or `/app/projects/:projectId/sprints/:sprintId/board`

**Behavior:**
- Default view shows "All Active Sprints" combined board
- Sprint selector allows filtering to specific sprint
- Columns are shared across sprints but data is filtered
- Task cards show sprint badge when viewing combined board
- Drag-and-drop between sprints possible via task move modal

**Visual Design:**
```
┌────────────────────────────────────────────────────────────────┐
│ [All Sprints ▼] [Frontend ▼] [Backend ▼]     [Filter] [Sort] │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TO DO          IN PROGRESS       TESTING           DONE      │
│  ────────────────────────────────────────────────────────────  │
│  ┌──────────┐   ┌──────────┐      ┌──────────┐     ┌──────────┐ │
│  │ Task A   │   │ Task D   │      │ Task G   │     │ Task J   │ │
│  │ [FE Sprint]│ │ [FE Sprint]│    │ [BE Sprint]│   │ [BE Sprint]│ │
│  └──────────┘   └──────────┘      └──────────┘     └──────────┘ │
│  ┌──────────┐   ┌──────────┐      ┌──────────┐                   │
│  │ Task B   │   │ Task E   │      │ Task H   │                   │
│  │ [BE Sprint]│ │ [BE Sprint]│    │ [QA Sprint]│                 │
│  └──────────┘   └──────────┘      └──────────┘                   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Sprint Selector UI

**Location:** Board view header

**Options:**
- "All Active Sprints" (default combined view)
- "All Sprints" (includes planning/completed)
- Individual sprint selection
- Sprint by team_tag filter

### Sprint Detail View

**Route:** `/app/projects/:projectId/sprints/:sprintId`

**Components:**
- **SprintHeader**: Name, goal, dates, status badge, team tag
- **SprintStats**: Task counts, completion, velocity
- **SprintBoard**: Kanban view filtered to this sprint only
- **SprintCalendar**: Calendar showing sprint timeline
- **SprintRetrospective**: Link to retrospective (if completed)

### Sprint Creation Modal

**Fields:**
- Name (required)
- Goal (markdown)
- Start Date (required)
- End Date (required)
- Color (optional)
- Team Tag (optional - dropdown with common options + custom)
- Linked Sprints (optional - sprints that share tasks)

### Sprint Comparison View

**Route:** `/app/projects/:projectId/sprints/compare`

**Purpose:** Compare metrics across multiple sprints

**Charts:**
- Velocity comparison (bar chart)
- Completion rate over time (line chart)
- Burndown per sprint (multi-line)

---

## Implementation Checklist

- [ ] Database migration for sprints table additions
- [ ] Database migration for sprint_groups
- [ ] Backend: SprintService updates
- [ ] Backend: BoardService multi-sprint support
- [ ] Backend: TaskService single-sprint validation
- [ ] Frontend: Sprint types update
- [ ] Frontend: useActiveSprints hook
- [ ] Frontend: SprintSelector component
- [ ] Frontend: SprintCard component
- [ ] Frontend: Board view updates for multi-sprint
- [ ] Frontend: SprintCompareView
- [ ] Frontend: Sprint detail page updates
- [ ] E2E tests for simultaneous sprint creation and viewing
- [ ] Documentation update (ERD.md, ENDPOINTS.md, TRUTH.md)

---

## Notes

- Task drag-and-drop between sprints should be allowed but require confirmation
- When a sprint is cancelled, tasks return to backlog (not deleted)
- Sprint naming conventions can include team_tag for clarity: "FE Sprint 12" vs "BE Sprint 8"
- Calendar view should show multiple sprint timelines side by side
- AI reports should be able to filter by sprint or show cross-sprint insights

---

## Relationship with Mini-Sprints

Simultaneous Sprints work alongside **Mini-Sprints** (see [MINI_SPRINTS.md](./MINI_SPRINTS.md)) as complementary cadence options:

| Aspect | Regular Sprint | Mini-Sprint |
|--------|----------------|-------------|
| **Duration** | 1-4 weeks | 1-3 days |
| **Planning** | Full ceremony | Lightweight, async |
| **Frequency** | Per sprint cycle | As-needed |
| **Use Case** | Planned feature work | Tactical bursts |

**How They Work Together:**

1. **Parallel Execution**: Mini-Sprints can run alongside regular sprints without interference
2. **Capacity Independence**: Mini-Sprint tasks don't count against sprint capacity
3. **Parent-Child Linking**: A Mini-Sprint can optionally link to a parent Sprint for context
4. **Shared Backlog**: Both draw tasks from the same backlog pool (different backlogs possible)

**Example Scenario:**

```
Project: "E-Commerce Platform"

Regular Sprints (Simultaneous):
├── Frontend Sprint 12 (2 weeks) - UI feature development
└── Backend Sprint 8 (3 weeks) - API development

Mini-Sprints (Tactical, alongside):
├── 🔥 Hotfix Mini-Sprint: Payment bug fix (24h)
└── 📊 Research Mini-Sprint: PO user feedback analysis (2 days)
```

Both sprint types can operate independently, and the Sprint Overview panel shows both regular sprints and active mini-sprints side-by-side.