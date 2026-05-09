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

## Backend Entities

### Trigger Entity

```typescript
Trigger {
  id: UUID
  project_id: UUID (FK)
  source_backlog_id: UUID (FK)
  target_backlog_id: UUID (FK)
  name: string
  description: string
  event_type: "status_change" | "task_created" | "task_assigned" | "comment_added" | "sprint_started" | "sprint_ended"
  conditions: JSON (flexible conditions based on event_type)
  action_type: "create_task" | "duplicate_task" | "send_notification" | "update_task"
  action_config: JSON (task template, notification content, etc.)
  is_active: boolean
  created_by: UUID (FK to users)
  created_at: timestamp
  updated_at: timestamp
}
```

### TriggerConditions Schema

```typescript
StatusChangeConditions {
  from_status_id?: UUID (optional - null means any status)
  to_status_id: UUID
  task_type?: "epic" | "story" | "task" | "subtask"
}

TaskCreatedConditions {
  task_type?: "epic" | "story" | "task" | "subtask"
  created_by_role?: Role
}

TaskAssignedConditions {
  assignee_role?: Role
  task_type?: "epic" | "story" | "task" | "subtask"
}
```

### TriggerActionConfig Schema

```typescript
CreateTaskAction {
  type: "create_task"
  template: {
    title: string (supports placeholders: {{task.title}}, {{task.type}}, {{user.name}})
    description: string
    type: "epic" | "story" | "task"
    priority: "low" | "medium" | "high" | "urgent"
    assignee_role?: Role (auto-assign based on role)
    backlog_id: UUID
  }
}

DuplicateTaskAction {
  type: "duplicate_task"
  target_backlog_id: UUID
  preserve_assignees: boolean
  reset_status: boolean (to "To Do" in target backlog)
}

SendNotificationAction {
  type: "send_notification"
  channel: "in_app" | "email" | "chat"
  recipients: "trigger_user" | "backlog_owner" | "specific_roles"
  message_template: string
}
```

### TaskLink Entity

```typescript
TaskLink {
  id: UUID
  source_task_id: UUID (FK)
  target_task_id: UUID (FK)
  trigger_id: UUID (FK, nullable - null if manual link)
  link_type: "automation_created" | "manual" | "dependency"
  created_at: timestamp
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/triggers` | List all triggers for project |
| POST | `/projects/:projectId/triggers` | Create a new trigger |
| GET | `/triggers/:triggerId` | Get trigger details |
| PATCH | `/triggers/:triggerId` | Update trigger |
| DELETE | `/triggers/:triggerId` | Delete trigger |
| POST | `/triggers/:triggerId/test` | Test trigger with sample event |
| GET | `/tasks/:taskId/links` | Get all links for a task |
| POST | `/tasks/:taskId/links` | Create manual link |
| DELETE | `/links/:linkId` | Remove task link |

### Request/Response Examples

**Create Trigger:**
```json
POST /projects/123/triggers
{
  "name": "Dev to QA Handoff",
  "source_backlog_id": "backlog-dev-uuid",
  "target_backlog_id": "backlog-qa-uuid",
  "event_type": "status_change",
  "conditions": {
    "to_status_id": "status-testing-uuid"
  },
  "action_type": "create_task",
  "action_config": {
    "template": {
      "title": "Test: {{task.title}}",
      "description": "QA verification for: {{task.title}}\n\nOriginal Description:\n{{task.description}}",
      "type": "task",
      "priority": "{{task.priority}}",
      "assignee_role": "qa",
      "backlog_id": "backlog-qa-uuid"
    }
  }
}
```

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

## Architecture Changes

### Database Migration

```sql
CREATE TABLE triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_backlog_id UUID REFERENCES backlogs(id),
  target_backlog_id UUID REFERENCES backlogs(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  action_type VARCHAR(50) NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE task_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  target_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  trigger_id UUID REFERENCES triggers(id) ON DELETE SET NULL,
  link_type VARCHAR(50) NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_triggers_project ON triggers(project_id);
CREATE INDEX idx_triggers_backlog ON triggers(source_backlog_id, target_backlog_id);
CREATE INDEX idx_task_links_source ON task_links(source_task_id);
CREATE INDEX idx_task_links_target ON task_links(target_task_id);
```

### Backend Changes

1. **TriggerService**: CRUD for triggers
2. **TaskLinkService**: Manage task relationships
3. **AutomationEngine**: Event processing and action execution
4. **EventBus**: Internal pub/sub for triggering automation
5. **GitHubWebhookHandler**: Process GitHub events

### Frontend Changes

1. **automationFeature**: New feature module
   - `features/automation/`
   - `components/TriggerList`
   - `components/TriggerWizard`
   - `components/TriggerCard`
   - `components/TaskLinkIndicator`
   - `hooks/useTriggers`
   - `hooks/useTaskLinks`

2. **New Components:**
   - TriggerListView
   - TriggerCreationWizard (multi-step form)
   - TriggerCard
   - TaskLinkBadge
   - LinkedTasksSidebar

3. **TaskDetail Updates:**
   - Add "Linked Tasks" section to sidebar
   - Show automation indicators

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