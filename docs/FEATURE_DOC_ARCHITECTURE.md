# Feature Doc Architecture

A guide for creating consistent, maintainable feature documentation in `docs/features/`.

---

## Purpose

Feature docs describe **what a feature is**, **what views it needs**, and **what data it requires** — without duplicating schema definitions or endpoint lists. Instead, they **reference** the central documentation.

---

## Document Sections

Every feature doc should follow this structure:

### 1. Header
```markdown
# Feature Name

**Status:** Planned | In Progress | Implemented
```

### 2. Overview
**Purpose:** Explain what the feature is and why it exists.

**Contents:**
- One-paragraph description of the feature
- Key principles or constraints
- Use cases (optional, for complex features)

**Example:**
```markdown
Mini-Sprints are short-duration, tactical sprint bursts designed for urgent work that doesn't warrant a full sprint cycle. They are "tactical bursts" — typically 1 to 3 days — used for hotfixes, quick research, last-minute polish, or time-sensitive tasks.
```

### 3. Schema & API Reference
**Purpose:** Point to authoritative sources for data model and endpoints.

**Contents:**
- One line: **Entity Definition:** See [ERD.md](/docs/ERD.md) — [entity names]
- One line: **API Endpoints:** See [ENDPOINTS.md](/docs/ENDPOINTS.md) — [section anchor] for full endpoint documentation with `is_implemented` flags.

**Example:**
```markdown
**Entity Definition:** See [ERD.md](/docs/ERD.md) — MiniSprint, MiniSprintTask, and QuickCaptureBacklog entities.

**API Endpoints:** See [ENDPOINTS.md](/docs/ENDPOINTS.md) — Mini-Sprints section (`#mini-sprints`) for full endpoint documentation with `is_implemented` flags.
```

**Why this way?** When schema or API changes, only ERD.md or ENDPOINTS.md needs updating. All feature docs stay consistent by reference.

### 4. Frontend Views
**Purpose:** Document the user-facing views that the feature needs.

**Contents per view:**
- **Route:** The URL path (e.g., `/app/projects/:projectId/reports`)
- **Components:** List of UI components that make up the view
- **Behavior:** How the view behaves, what actions are available
- **Visual Design:** ASCII wireframe showing layout (when helpful)

**Example:**
```markdown
### Report Hub Main View

**Route:** `/app/projects/:projectId/reports`

**Components:**
- **ReportTypeTabs**: All | Sprint Reports | QA Audits | Tech Debt | Product Feedback
- **ReportCard**: Title, type badge, date, status, key metric preview
- **CreateReportButton**: Opens report type selector
- **QuickFilters**: Date range, creator, status

**Visual Design:**
┌─────────────────────────────────────────────────────────────────┐
│ Report Hub                                    [+ Create Report] │
├─────────────────────────────────────────────────────────────────┤
│ [All] [Sprint] [QA Audit] [Tech Debt] [Product Feedback]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 📊 Q2 2026 QA Audit                          Published    │  │
│ │    Created May 9, 2026 · 65% test coverage               │  │
│ │    [View Report] [Create Tasks]                            │  │
│ └───────────────────────────────────────────────────────────┘  │
```

**Cross-referencing UX.md:**
For complex navigation flows between views, reference [UX.md](/docs/UX.md):
```markdown
For navigation flow between project views, see [UX.md](/docs/UX.md) — "Project Views" section.
```

**⚠️ Critical: Project Features vs General Features — AppShell Context**

When documenting views, you MUST first determine whether the feature is a **Project Feature** or a **General Feature**:

| Feature Type | Route Pattern | AppShell? | Example |
|---|---|---|---|
| **Project Feature** | `/app/projects/:projectId/...` | ✅ Yes — AppShell wraps the view automatically | Board, Backlog, Sprints, Reports, Settings |
| **General Feature** | `/`, `/login`, `/app/projects`, `/app/projects/create` | ❌ No — standalone page | Landing, Login, Project Explorer |

**For Project Features:**
- The AppShell (TitleBar, ActivityBar, Explorer, Tabs, StatusBar) is **provided automatically** by the `$projectId` layout route — do NOT document or recreate these elements
- Your view spec only describes the **main content area** (what renders inside `<Outlet />`)
- Route examples: `/app/projects/:projectId/board`, `/app/projects/:projectId/reports`

**For General Features:**
- The page is standalone — it has no AppShell wrapper
- Document the full layout if it has unique chrome (nav, header, etc.)
- Route examples: `/`, `/login`, `/app/projects`

**Reference FRONTEND_ARCHITECTURE.md for the VS Code layout:**
See [FRONTEND_ARCHITECTURE.md](/docs/FRONTEND_ARCHITECTURE.md) — Section 5 "Layout Components — VS Code Pattern" and Section 15.1 "Realized Route Architecture" for which routes get AppShell.

### 5. Implementation Checklist
**Purpose:** Track what needs to be built.

**Format:** Markdown checklist with backend and frontend items.

**Example:**
```markdown
## Implementation Checklist

- [ ] Database migration for mini_sprints, mini_sprint_tasks, quick_capture_backlogs
- [ ] Backend: MiniSprintService CRUD
- [ ] Frontend: MiniSprintCard component
- [ ] Frontend: MiniSprintBoard view
- [ ] E2E tests for mini-sprint lifecycle
```

### 6. Notes (Optional)
**Purpose:** Additional context, constraints, or decisions that don't fit elsewhere.

**Example:**
```markdown
## Notes

- Mini-sprints should have distinct visual styling (amber/orange tones) to differentiate from regular sprints
- Duration should be strictly enforced (max 72 hours / 3 days)
```

---

## What NOT to Include

Feature docs should **NOT** contain:

| Instead of this | Use this |
|------------------|----------|
| Duplicate TypeScript interfaces | Reference ERD.md entity definition |
| SQL migrations | Reference ERD.md SQL section |
| Endpoint tables with method/URL/description | Reference ENDPOINTS.md |
| Backend service names and methods | Reference ENDPOINTS.md |
| Frontend component code | Reference AGENTS.md architecture |

**Rationale:** Duplication leads to desynchronization. When a schema changes, developers must remember to update multiple files. Reference-based docs stay consistent.

---

## Workflow for New Features

When creating a new feature doc, follow this process:

### Step 1 — Check what exists
Before writing anything, verify that the entities and endpoints the feature needs already exist in:
- **ERD.md** — entity definitions and relationships
- **ENDPOINTS.md** — API endpoints
- **UX.md** — navigation patterns and user flows

### Step 2 — If the feature needs something that doesn't exist
1. **Try to find an alternative** within the existing docs. Often there are generic entities (like "custom_fields" or "settings") that can accommodate new use cases.
2. **If no alternative exists**, modify the **DOCUMENTATION ONLY** — add the missing entity to ERD.md, the new endpoint to ENDPOINTS.md, or the navigation pattern to UX.md.
3. **Then reference it** from the feature doc as you would any established definition.

### Step 3 — Never create empty references
A feature doc should always link to something that exists. Do not document a feature that references non-existent entities or endpoints without first adding those to the central docs.

### Why this matters
The feature doc is the **what** — what the feature does, what views it needs, what data it works with. ERD, ENDPOINTS, and UX are the **how** — how the data is structured, how to access it, how the user navigates. The doc should never duplicate these — only reference them.

---

## Cross-Reference Guide

### ERD.md
Contains all entity definitions, relationships, and SQL schemas.
- **Use for:** Understanding data model, field types, relationships
- **Reference as:** `See [ERD.md](/docs/ERD.md) — [entity name] entity`

### ENDPOINTS.md
Contains all API endpoints with request/response examples and `is_implemented` flags.
- **Use for:** Understanding how to fetch and mutate data
- **Reference as:** `See [ENDPOINTS.md](/docs/ENDPOINTS.md) — [section name] section`

### UX.md
Contains user flows, navigation patterns, and ASCII wireframes for complex views.
- **Use for:** Understanding how views connect and what navigation paths exist
- **Reference as:** `See [UX.md](/docs/UX.md) — [relevant section]`

### FRONTEND_ARCHITECTURE.md
Contains high-level project structure, layout conventions, and how the AppShell (sidebar, header, main wrapper) is organized.
- **Use for:** Understanding the page structure, component hierarchy, routing patterns
- **Reference as:** `See [FRONTEND_ARCHITECTURE.md](/docs/FRONTEND_ARCHITECTURE.md) — [relevant section]`

### AGENTS.md
Contains AI-specific coding conventions, component rules, TypeScript patterns, and implementation standards for developers (and AI agents) working in the codebase.
- **Use for:** Understanding how to write code that matches existing conventions
- **Reference as:** `See [AGENTS.md](/docs/AGENTS.md) — [relevant section]`

---

## Feature Doc Template

Copy this template when creating a new feature doc:

```markdown
# [Feature Name]

**Status:** Planned

---

## Overview

[One paragraph: what the feature is and why it exists]

[Key principles or constraints, if any]

[Use cases, if feature is complex]

---

## Schema & API Reference

**Entity Definition:** See [ERD.md](/docs/ERD.md) — [entity names].

**API Endpoints:** See [ENDPOINTS.md](/docs/ENDPOINTS.md) — [section name] section for full endpoint documentation with `is_implemented` flags.

---

## Frontend Views

### [View Name]

**Route:** [URL path]

**Components:**
- [Component name]: [description]

**Behavior:**
- [How it behaves]
- [What actions are available]

**Visual Design:**
```
[ASCII wireframe if helpful]
```

---

## Implementation Checklist

- [ ] [Backend task]
- [ ] [Frontend task]
- [ ] [Test task]

---

## Notes

- [Additional context or constraints]
```

---

## File Naming

- Use `SCREAMING_SNAKE_CASE.md` for file names (e.g., `MINI_SPRINTS.md`, `REPORT_HUB.md`)
- The H1 title inside the file should use **Title Case** (e.g., `# Mini-Sprints`, `# Report Hub`)
- Match the file name to the `features/` directory name
- Place all feature docs in `docs/features/`

---

## Relationship Between Docs

```
                    ┌─────────────────────┐
                    │   UX.md             │
                    │   (navigation flows)│
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Feature Doc       │
                    │   (view specs)      │
                    └──────────┬──────────┘
                               │
      ┌────────────────────────┼────────────────────────┐
      │                        │                        │
┌─────▼──────────┐     ┌──────▼──────┐     ┌──────────▼────────┐
│    ERD.md      │     │ ENDPOINTS.md│     │  FRONTEND_ARCH    │
│   (data model) │     │    (API)    │     │ (page structure)  │
└───────────────┘     └─────────────┘     └────────┬─────────┘
                                                     │
                                            ┌────────▼─────────┐
                                            │    AGENTS.md     │
                                            │ (coding patterns)│
                                            └──────────────────┘
```

- **Feature doc** — what the user sees and does
- **ERD.md** — data model (entities, relationships, SQL)
- **ENDPOINTS.md** — how to talk to the backend (API)
- **FRONTEND_ARCHITECTURE.md** — page structure, AppShell layout, routing
- **AGENTS.md** — coding conventions, component rules, AI implementation standards
- **UX.md** — how views connect and user flows

---

## Status Values

| Value | Meaning |
|-------|---------|
| `Planned` | Not yet started, design in progress |
| `In Progress` | Currently being implemented |
| `Implemented` | Fully built and functional |

---

## Example: Mini-Sprints Feature Doc

For a complete example, see [MINI_SPRINTS.md](./features/MINI_SPRINTS.md).

Key elements to observe:
- Overview explains what mini-sprints are and how they differ from regular sprints
- Schema & API Reference points to ERD and ENDPOINTS without duplicating
- Frontend Views shows routes, components, and ASCII wireframes
- Implementation Checklist is a simple checklist (not a task manager)
- Notes captures visual styling constraints (amber/orange tones)