# Inter-Backlog Automation

**Status:** Planned

---

## Overview

AI-driven triggers that link backlogs. When events occur in one backlog (e.g., task moves to "Testing"), AI automatically generates linked tasks in another backlog.

**Key Concepts:**
- **Trigger**: Event condition that fires automation
- **Action**: Result (create task, send notification)
- **Link**: Connection between tasks across backlogs

**Entity Definition:** See [domain/ERD.md](/docs/domain/ERD.md) — Trigger and TaskLink entities.

**API Endpoints:** See [api/ENDPOINTS.md](/docs/api/ENDPOINTS.md) — Triggers section.

---

## Frontend Views

### Trigger List View

**Route:** `/app/projects/:projectId/settings/automation`

**Components:**
- **TriggerCard**: Name, event type, source→target flow, stats
- **QuickToggle**: Enable/disable
- **CreateTriggerButton**

### Trigger Creation Wizard

**Step 1:** Name & Scope — source/target backlog selection
**Step 2:** Event — type selector (status change, task created, etc.)
**Step 3:** Action — type + template editor
**Step 4:** Review & Activate

### Task Link Visualization

**On TaskCard:**
- Link icon with count
- Tooltip preview

**On TaskDetail:**
- "Linked Tasks" section
- Source links (triggered this) / Target links (this triggered)
- Origin indicator (manual, automation, dependency)

---

## Routes

| View | Route |
|------|-------|
| Trigger List | `/app/projects/:projectId/settings/automation` |

---

## Notes

- Rate-limited: max 10 actions per trigger per minute
- Failed actions logged and user notified
- AI can suggest triggers based on patterns
- Links update if source task deleted (configurable)