# Inter-Backlog Automation

**Status: Planned**

---

## Overview

Inter-Backlog Automation enables AI-driven triggers that link backlogs together. When specific events occur in one backlog (e.g., a task moves to "Testing"), the AI can automatically generate linked tasks in another backlog (e.g., the QA Backlog).

**Key Concepts:**
- **Trigger**: An event condition that fires automation
- **Action**: The result of a triggered automation (e.g., create task, send notification)
- **Link**: Connection between tasks across backlogs

---

## Schema & API Reference

**Entity Definition:** See [ERD.md](/docs/ERD.md) — Trigger and TaskLink entities.

**API Endpoints:** See [ENDPOINTS.md](/docs/ENDPOINTS.md) — Triggers (Inter-Backlog Automation) section for full endpoint documentation with `is_implemented` flags.

---

## Frontend Views

### Trigger List View

**Route:** `/app/projects/:projectId/settings/automation` (under project settings)

**Components:**
- **TriggerCard**: Shows trigger name, event type icon, source→target backlog flow
- **TriggerStats**: Execution count, last triggered, success rate
- **QuickToggle**: Enable/disable trigger
- **CreateTriggerButton**: Opens creation wizard

**Visual Design:**
```
┌──────────────────────────────────────────────────────────┐
│ Inter-Backlog Automation                                 │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🔄 Dev to QA Handoff                    [Enabled ✓] │  │
│ │    When task moves to Testing                   [⋮] │  │
│ │    Development Backlog → QA/Testing Backlog      │  │
│ │    Last triggered: 2 hours ago                   │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🔄 Bug Triage Auto-Assign               [Enabled ✓] │  │
│ │    When bug is created                          [⋮] │  │
│ │    Any Backlog → Bug Backlog                      │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ + Create New Trigger                                     │
└──────────────────────────────────────────────────────────┘
```

### Trigger Creation Wizard

**Step 1 - Name & Scope:**
- Trigger name
- Source backlog selection
- Target backlog selection

**Step 2 - Event Configuration:**
- Event type selector (radio buttons with icons)
- Dynamic form based on event type
- Preview of condition in plain English

**Step 3 - Action Configuration:**
- Action type selector
- Template editor with placeholder hints
- Test with sample data option

**Step 4 - Review & Activate:**
- Summary of trigger configuration
- Toggle to enable immediately
- Create button

### Task Link Visualization

**On TaskCard:**
- Small link icon showing linked task count
- Tooltip preview of linked tasks

**On TaskDetail Sidebar:**
- "Linked Tasks" section
- Shows source links (tasks that triggered this) and target links (tasks this triggered)
- Click to navigate to linked task
- Visual indicator of link origin (manual, automation, dependency)

### Linked Task Indicator

**Visual Design:**
```
┌─────────────────────────────┐
│ ██ Task Title                │
│                             │
│ 🔗 Linked: 3 tasks          │
│                             │
│ ─────────────────────────── │
│ 🔗 [Auto] Test: Parent Task │
│    → Created by automation  │
│ 🔗 [Manual] Related Bug     │
│    → Created manually      │
└─────────────────────────────┘
```

---

## AI Integration

### Event-Driven Architecture

The AI monitors events through:

1. **Direct API Events**: Task create/update/delete, status changes
2. **Chat Interactions**: When user mentions AI in chat with specific keywords
3. **GitHub Webhooks**: Repository updates, PR merges, issue changes
4. **Scheduled Checks**: Periodic scans for time-based triggers

### AI Processing Flow

```
Event occurs
    ↓
Event validated and categorized
    ↓
Matching triggers queried (by backlog_id + event_type)
    ↓
Conditions evaluated against event data
    ↓
For each matching trigger:
    ↓
Action executed (create task, send notification, etc.)
    ↓
Task link created
    ↓
User notified of automation execution
```

### AI "Virtual Team Member" Behavior

When AI acts as Backlog Refiner:
- **Proactive Monitoring**: AI periodically reviews task status across backlogs
- **Smart Suggestions**: AI suggests backlog improvements based on team patterns
- **Cross-Backlog Insights**: AI identifies gaps between development and QA progress
- **Alert on Blockers**: AI notifies relevant parties when tasks are blocked

---

## Implementation Checklist

- [ ] Database migration for triggers and task_links tables
- [ ] Backend: TriggerService CRUD
- [ ] Backend: TaskLinkService
- [ ] Backend: AutomationEngine (event processing)
- [ ] Backend: EventBus setup
- [ ] Backend: GitHub webhook handler
- [ ] Frontend: automation feature module
- [ ] Frontend: TriggerListView
- [ ] Frontend: TriggerCreationWizard
- [ ] Frontend: TaskLinkBadge component
- [ ] Frontend: Linked Tasks sidebar section
- [ ] Frontend: TaskDetail updates
- [ ] E2E tests for trigger creation and execution
- [ ] Documentation update (ERD.md, ENDPOINTS.md, TRUTH.md)

---

## Notes

- Trigger actions should be rate-limited to prevent spam (max 10 actions per trigger per minute)
- Failed trigger actions should be logged and user notified
- AI can suggest trigger creation based on detected patterns
- Links between tasks should update if source task is deleted (cascade behavior configurable)