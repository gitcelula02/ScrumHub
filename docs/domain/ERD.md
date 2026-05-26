# Entity-Relationship Diagram

This document defines the pure data structure and relationships. No technology specified — SQL vs NoSQL is an implementation detail. JSON examples show API response format.

---

## Core Entities

### User

**Purpose:** Authentication and profile management

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| username | String | Unique, used for display |
| email | String | Unique |
| password_hash | String | Hashed password |
| avatar_url | String | Profile picture URL |
| default_language | String | User preference (e.g., "en", "es") |
| created_at | DateTime | Account creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Relationships:**
- One User can have many SCRUMRolePreferences (one-to-many)
- One User can belong to many Projects (many-to-many via ProjectMember)
- One User can create many ApiKeyVaults (one-to-many)
- One User can have one Subscription (one-to-one)
- One User can have many Notifications (one-to-many)

**JSON Example:**
```json
{
  "id": 1,
  "username": "john_dev",
  "email": "john@example.com",
  "avatar_url": "https://cdn.scrumhub.io/avatars/abc123.jpg",
  "default_language": "en",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-06-20T14:22:00Z"
}
```

---

### SCRUMRolePreference

**Purpose:** User's preferred SCRUM roles (one-to-many per user)

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| user_id | INT | Foreign Key → User |
| role_type | String | "product_owner" / "scrum_master" / "qa" / "developer" / "devops" / "tech_lead" |
| specialization | String | Optional (e.g., "frontend", "backend", "react", "node") |
| is_primary | Boolean | This is the user's main role for the project |

**JSON Example:**
```json
[
  { "id": 1, "user_id": 1, "role_type": "developer", "specialization": "frontend", "is_primary": true },
  { "id": 2, "user_id": 1, "role_type": "qa", "specialization": null, "is_primary": false }
]
```

---

### Project

**Purpose:** Container for all project data

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| name | String | Project name |
| description | String | Markdown description |
| goal | String | Markdown describing what the project aims to achieve |
| icon | String | Emoji or icon identifier for the project |
| color | String | User-defined hex color for entity theme |
| status | String | "active" / "archived" / "completed" |
| created_by_user_id | INT | Foreign Key → User (project creator = first admin) |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Relationships:**
- One Project has many ProjectMembers (one-to-many)
- One Project has many Tasks (one-to-many)
- One Project has many Sprints (one-to-many)
- One Project has one Chatroom (one-to-one)
- One Project has many Settings (one-to-many, polymorphic)
- One Project has many ProjectCustomSections (one-to-many)
- One Project has many UserFolderProjects (one-to-many)

**JSON Example:**
```json
{
  "id": 1,
  "name": "ScrumHub Frontend",
  "description": "# Project Overview\n\nBuilding the React frontend...",
  "goal": "Deliver a modern, AI-powered project management experience",
  "icon": "📘",
  "color": "#3B6D11",
  "status": "active",
  "created_by_user_id": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-06-20T14:22:00Z"
}
```

---

### UserFolder

**Purpose:** Personal folder organization per user. Each user has their own folder structure, independent of other users.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| user_id | INT | Foreign Key → User |
| parent_id | INT | Foreign Key → UserFolder (null for root folders) |
| name | String | Folder name (unique within same parent per user) |
| order_index | INT | Sorting order |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Constraints:**
- Maximum nesting depth: 5 levels
- Folder names unique within same parent per user

**Relationships:**
- One User belongs to one User (many-to-one)
- One UserFolder has many UserFolders (one-to-many, children)
- One UserFolder has many UserFolderProjects (one-to-many)

**JSON Example:**
```json
{
  "id": 1,
  "user_id": 5,
  "parent_id": null,
  "name": "AI Projects",
  "order_index": 0,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-06-20T14:22:00Z"
}
```

---

### ProjectCustomSection

**Purpose:** User-defined custom sections for project (vision, mission, goals, etc.). Feeds into project RAG context.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| user_id | INT | Foreign Key → User (who created) |
| key | String | Section key (e.g., "vision", "mission", "goal") |
| value | Text | Markdown content |
| order_index | INT | Display order |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Relationships:**
- One Project has many ProjectCustomSections (one-to-many)
- One User created many ProjectCustomSections (one-to-many)

**JSON Example:**
```json
{
  "id": 1,
  "project_id": 1,
  "user_id": 5,
  "key": "vision",
  "value": "Our vision is to create the most intuitive project management experience...",
  "order_index": 0,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-06-20T14:22:00Z"
}
```

---

### UserFolderProject

**Purpose:** Many-to-many relationship between UserFolders and Projects for folder membership. Allows each user to organize projects in their own folder structure.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| user_id | INT | Foreign Key → User |
| folder_id | INT | Foreign Key → UserFolder (nullable - null means root level) |
| project_id | INT | Foreign Key → Project |
| order_index | INT | Sorting within folder |
| is_pinned | Boolean | Appears in Pinned section |
| created_at | DateTime | Creation timestamp |

**Relationships:**
- One User has many UserFolderProjects (one-to-many)
- One UserFolder has many UserFolderProjects (one-to-many)
- One Project has many UserFolderProjects (one-to-many)

**JSON Example:**
```json
{
  "id": 1,
  "user_id": 5,
  "folder_id": 1,
  "project_id": 42,
  "order_index": 0,
  "is_pinned": false,
  "created_at": "2024-02-01T09:00:00Z"
}
```

---

### ProjectTemplate

**Purpose:** Pre-defined project templates for common use cases.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| name | String | Template name |
| description | String | Template description |
| icon | String | Emoji icon |
| category | String | "sprint_planning" / "research" / "bug_tracker" / "continuous" / "custom" |
| is_system | Boolean | True for built-in templates |
| created_by_user_id | INT | Foreign Key → User (null for system templates) |
| config | JSON | Template configuration (backlogs, statuses, sample tasks) |
| usage_count | INT | Usage counter for sorting/popularity |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Relationships:**
- One User has many ProjectTemplates (one-to-many, for custom templates)
- System templates have no user (created_by_user_id = null)

**JSON Example:**
```json
{
  "id": 1,
  "name": "Sprint Planning Starter",
  "description": "Perfect for feature development with sprint-based delivery",
  "icon": "🏃",
  "category": "sprint_planning",
  "is_system": true,
  "created_by_user_id": null,
  "config": {
    "backlogs": [...],
    "sample_tasks": [...],
    "suggested_sprints": [...]
  },
  "usage_count": 156,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

---

### ProjectMember

**Purpose:** Join table for User ↔ Project many-to-many relationship

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| user_id | INT | Foreign Key → User |
| scrum_role | String | User's role in this project |
| is_admin | Boolean | User is project admin (can manage settings, invite users) |
| joined_at | DateTime | When user joined the project |

**JSON Example:**
```json
{
  "id": 1,
  "project_id": 1,
  "user_id": 5,
  "scrum_role": "developer",
  "is_admin": false,
  "joined_at": "2024-02-01T09:00:00Z"
}
```

---

### Task

**Purpose:** Single unified entity for Epic, User Story, Task, and Subtask (distinguished by `type` field)

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| backlog_id | INT | Foreign Key → Backlog (nullable - task may exist outside backlogs) |
| parent_id | INT | Foreign Key → Task (null if no parent, enables subtasks) |
| sprint_id | INT | Foreign Key → Sprint (nullable, task may be backlog-only) |
| type | String | "epic" / "story" / "task" |
| title | String | Task title |
| description | String | Markdown description |
| priority | String | "low" / "medium" / "high" / "urgent" |
| status_id | INT | Foreign Key → Status |
| index | INT | Hierarchy level (16-byte INT for NoSQL-like traversal) |
| due_date | DateTime | Due date |
| created_by_user_id | INT | Foreign Key → User (creator) |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Relationships:**
- One Task has many TaskAssignees (one-to-many)
- One Task has many TaskDependencies (one-to-many, as the dependent task)
- One Task has many AcceptanceCriteria (one-to-many)
- One Task has many Comments (one-to-many)
- One Task has many Attachments (one-to-many)
- One Task belongs to one Status (many-to-one)
- One Task belongs to one Backlog (many-to-one) - optional
- One Task belongs to one Sprint (many-to-one) - optional
- One Task has many TaskLinks (as source or target)

**JSON Example:**
```json
{
  "id": 42,
  "project_id": 1,
  "parent_id": null,
  "sprint_id": 3,
  "type": "epic",
  "title": "User Authentication System",
  "description": "Implement complete auth flow including OAuth",
  "priority": "high",
  "status_id": 2,
  "index": 1,
  "due_date": "2024-07-15T00:00:00Z",
  "created_by_user_id": 1,
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-06-18T16:30:00Z"
}
```

---

### TaskAssignee

**Purpose:** Join table for Task ↔ User many-to-many. Supports cascade override for subtasks.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| task_id | INT | Foreign Key → Task |
| user_id | INT | Foreign Key → User |
| is_cascade_override | Boolean | True if explicitly assigned (not inherited from parent) |

**JSON Example:**
```json
{
  "id": 15,
  "task_id": 42,
  "user_id": 5,
  "is_cascade_override": false
}
```

---

### TaskDependency

**Purpose:** Task cannot start until dependency is completed

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| task_id | INT | Foreign Key → Task (the dependent task) |
| depends_on_task_id | INT | Foreign Key → Task (the blocking task) |
| dependency_type | String | "blocks_start" / "blocks_completion" |

**JSON Example:**
```json
{
  "id": 3,
  "task_id": 55,
  "depends_on_task_id": 42,
  "dependency_type": "blocks_start"
}
```

---

### Status

**Purpose:** Kanban board columns, user-customizable per project

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| name | String | Status name (e.g., "To Do", "In Progress", "Testing") |
| color | String | User-defined hex color |
| associated_role | String | SCRUM role that "owns" this status (e.g., "qa" for "Testing") |
| order | INT | Column ordering |
| is_active | Boolean | Soft delete flag |

**JSON Example:**
```json
{
  "id": 2,
  "project_id": 1,
  "name": "In Progress",
  "color": "#3B82F6",
  "associated_role": "developer",
  "order": 2,
  "is_active": true
}
```

---

### Sprint

**Purpose:** Time-boxed container for tasks. Supports simultaneous sprints (parallel sprints for different sub-teams).

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| name | String | Sprint name |
| description | String | Markdown description |
| goal | String | Markdown describing what the sprint aims to achieve |
| color | String | User-defined hex color |
| start_date | Date | Sprint start |
| end_date | Date | Sprint end |
| status | String | "planning" / "active" / "completed" / "cancelled" |
| is_parallel | Boolean | Default true - allows multiple sprints to run simultaneously |
| team_tag | String | Optional tag for sprint grouping (e.g., "frontend", "backend") |
| created_by_user_id | INT | Foreign Key → User |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Relationships:**
- One Sprint has many Tasks (one-to-many)
- One Sprint has many Reports (one-to-many) - Sprint Reports
- One Sprint has one Retrospective (one-to-one) - Legacy for backward compatibility
- One Sprint has many DailyStandups (one-to-many)
- One Sprint has many MiniSprints (one-to-many, optional)

**JSON Example:**
```json
{
  "id": 3,
  "project_id": 1,
  "name": "Sprint 4",
  "description": "Focus on auth and user settings",
  "color": "#8B5CF6",
  "start_date": "2024-06-17",
  "end_date": "2024-06-28",
  "created_by_user_id": 1,
  "created_at": "2024-06-10T10:00:00Z",
  "updated_at": "2024-06-10T10:00:00Z"
}
```

---

### AcceptanceCriteria

**Purpose:** QA-managed checklist items required for task completion

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| task_id | INT | Foreign Key → Task |
| description | String | Criterion description |
| is_marked | Boolean | QA has marked this complete |
| created_by_user_id | INT | Foreign Key → User |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**JSON Example:**
```json
{
  "id": 8,
  "task_id": 42,
  "description": "OAuth2 flow completes successfully",
  "is_marked": true,
  "created_by_user_id": 3,
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-06-15T11:30:00Z"
}
```

---

### Comment

**Purpose:** Task discussion

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| task_id | INT | Foreign Key → Task |
| user_id | INT | Foreign Key → User |
| content | String | Comment content (markdown) |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**JSON Example:**
```json
{
  "id": 12,
  "task_id": 42,
  "user_id": 5,
  "content": "I've started working on the OAuth integration. Should be ready by Thursday.",
  "created_at": "2024-06-18T09:15:00Z",
  "updated_at": "2024-06-18T09:15:00Z"
}
```

---

### Attachment

**Purpose:** Task files

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| task_id | INT | Foreign Key → Task |
| user_id | INT | Foreign Key → User (uploader) |
| filename | String | Original filename |
| url | String | Storage URL |
| mime_type | String | MIME type |
| size_bytes | INT | File size |
| created_at | DateTime | Upload timestamp |

**JSON Example:**
```json
{
  "id": 4,
  "task_id": 42,
  "user_id": 5,
  "filename": "wireframe-v2.png",
  "url": "https://storage.scrumhub.io/attachments/xyz789.png",
  "mime_type": "image/png",
  "size_bytes": 245632,
  "created_at": "2024-06-17T14:20:00Z"
}
```

---

## Chatroom Entities

### Chatroom

**Purpose:** Project's Discord-like chat interface

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project (one-to-one) |
| name | String | Chatroom name |
| created_at | DateTime | Creation timestamp |

**Relationships:**
- One Chatroom has many Channels (one-to-many)
- One Chatroom has one DailyStandup (one-to-one, the default "Daily" channel)

**JSON Example:**
```json
{
  "id": 1,
  "project_id": 1,
  "name": "ScrumHub Frontend Chat",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Channel

**Purpose:** Text or voice channel within a chatroom

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| chatroom_id | INT | Foreign Key → Chatroom |
| type | String | "text" / "voice" |
| name | String | Channel name |
| order | INT | Display order |
| is_default | Boolean | True if this is the "Daily" standup channel |
| is_active | Boolean | Soft delete flag |

**JSON Example:**
```json
{
  "id": 5,
  "chatroom_id": 1,
  "type": "voice",
  "name": "Daily",
  "order": 0,
  "is_default": true,
  "is_active": true
}
```

---

### Message

**Purpose:** Text channel messages

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| channel_id | INT | Foreign Key → Channel |
| user_id | INT | Foreign Key → User (sender) |
| content | String | Message content (markdown) |
| created_at | DateTime | Sent timestamp |

**JSON Example:**
```json
{
  "id": 1024,
  "channel_id": 3,
  "user_id": 5,
  "content": "Quick update: OAuth flow is 80% done, should finish tomorrow morning.",
  "created_at": "2024-06-18T10:30:00Z"
}
```

---

### VoiceSession

**Purpose:** Real-time voice call in a channel

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| channel_id | INT | Foreign Key → Channel |
| status | String | "active" / "ended" |
| started_at | DateTime | Call start |
| ended_at | DateTime | Call end (nullable if active) |

**Relationships:**
- One VoiceSession has many VoiceSessionParticipants (one-to-many)

**JSON Example:**
```json
{
  "id": 7,
  "channel_id": 5,
  "status": "ended",
  "started_at": "2024-06-18T09:00:00Z",
  "ended_at": "2024-06-18T09:25:00Z"
}
```

---

### VoiceSessionParticipant

**Purpose:** Track who joined a voice session

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| voice_session_id | INT | Foreign Key → VoiceSession |
| user_id | INT | Foreign Key → User |
| joined_at | DateTime | When user joined |
| left_at | DateTime | When user left (nullable if still in call) |

**JSON Example:**
```json
{
  "id": 22,
  "voice_session_id": 7,
  "user_id": 5,
  "joined_at": "2024-06-18T09:00:00Z",
  "left_at": "2024-06-18T09:25:00Z"
}
```

---

## AI & Settings Entities

### Settings

**Purpose:** Polymorphic settings entity. One row per scope context.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| type | String | "general" / "project" / "user" / "user_project_override" |
| scope_id | INT | project_id or user_id or {user_id,project_id} depending on type |
| name | String | Settings name/identifier |
| config | JSON | Full configuration object |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**Config JSON Structure:**
```json
{
  "general": {
    "theme": "dark",
    "language": "en",
    "notifications": { "email": true, "push": true, "in_app": true }
  },
  "ai": {
    "default_model": "deepseek-chat",
    "models_per_capability": { "chat": "deepseek-chat", "code": "deepseek-coder" },
    "temperature": 0.7,
    "tone": "professional",
    "system_prompt": "You are a helpful Scrum assistant...",
    "language": "en",
    "skills": ["retrospective", "backlog-optimization"],
    "tools": ["web-search"]
  },
  "agents": {
    "backlog-assistant": {
      "enabled": true,
      "system_prompt": "You help manage backlogs...",
      "model": "deepseek-chat",
      "temperature": 0.7
    }
  }
}
```

**JSON Example (Project Settings):**
```json
{
  "id": 10,
  "type": "project",
  "scope_id": 1,
  "name": "Project AI Settings",
  "config": {
    "ai": {
      "default_model": "deepseek-chat",
      "temperature": 0.5,
      "tone": "technical"
    }
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-06-01T08:00:00Z"
}
```

---

### ApiKeyVault

**Purpose:** Secure storage for encrypted API keys

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| user_id | INT | Foreign Key → User (creator) |
| provider | String | "deepseek" / "openai" / "anthropic" |
| encrypted_value | String | Encrypted key value (never stored plaintext) |
| public_alias | String | User-defined name (shown in UI) |
| is_shared | Boolean | Key is shared with other users |
| allow_project_share | Boolean | Project admin can share with project members |
| max_credit_per_user | Decimal | Max credits a single user can expend when using shared key |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**JSON Example:**
```json
{
  "id": 1,
  "user_id": 1,
  "provider": "deepseek",
  "encrypted_value": "enc_a7f8b2c3...",
  "public_alias": "My DeepSeek Key",
  "is_shared": true,
  "allow_project_share": true,
  "max_credit_per_user": 10.00,
  "created_at": "2024-03-01T12:00:00Z",
  "updated_at": "2024-03-01T12:00:00Z"
}
```

---

### Subscription

**Purpose:** User's plan and credit tracking

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| user_id | INT | Foreign Key → User (one-to-one) |
| plan | String | "free" / "starter" / "pro" / "enterprise" |
| status | String | "active" / "cancelled" / "past_due" |
| credits_remaining | Decimal | Available credits |
| billing_cycle | String | "monthly" / "annual" |
| current_period_start | Date | Billing period start |
| current_period_end | Date | Billing period end |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**JSON Example:**
```json
{
  "id": 1,
  "user_id": 1,
  "plan": "pro",
  "status": "active",
  "credits_remaining": 42.50,
  "billing_cycle": "monthly",
  "current_period_start": "2024-06-01T00:00:00Z",
  "current_period_end": "2024-06-30T23:59:59Z",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-06-15T14:00:00Z"
}
```

---

### NotificationPreference

**Purpose:** User notification settings (separate from general Settings)

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| user_id | INT | Foreign Key → User |
| type | String | "email" / "push" / "in_app" |
| enabled | Boolean | Notification type enabled |

**JSON Example:**
```json
[
  { "id": 1, "user_id": 1, "type": "email", "enabled": true },
  { "id": 2, "user_id": 1, "type": "push", "enabled": true },
  { "id": 3, "user_id": 1, "type": "in_app", "enabled": true }
]
```

---

### Notification

**Purpose:** User notification records

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| user_id | INT | Foreign Key → User |
| type | String | Notification type |
| title | String | Notification title |
| message | String | Notification body |
| read | Boolean | Has user read this |
| link | String | Optional deep link URL |
| created_at | DateTime | Creation timestamp |

**JSON Example:**
```json
{
  "id": 100,
  "user_id": 5,
  "type": "in_app",
  "title": "Task assigned to you",
  "message": "You have been assigned to 'Implement OAuth flow' in ScrumHub Frontend",
  "read": false,
  "link": "/projects/1/tasks/42",
  "created_at": "2024-06-18T10:00:00Z"
}
```

---

### ProjectAiUsage

**Purpose:** Tracks AI API spending per project, broken down by API provider and billing period. Enables project-level cost attribution and budget monitoring.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| api_key_id | INT | Foreign Key → ApiKeyVault |
| provider | String | "deepseek" / "openai" / "anthropic" |
| cost | Decimal | Total cost for the period |
| period_start | Date | Billing period start |
| period_end | Date | Billing period end |
| created_at | DateTime | Creation timestamp |

**Relationships:**
- Project → ProjectAiUsage: One-to-many (per billing period and provider)

**JSON Example:**
```json
{
  "id": 1,
  "project_id": 1,
  "api_key_id": 5,
  "provider": "deepseek",
  "cost": 2.45,
  "period_start": "2026-05-01",
  "period_end": "2026-05-31",
  "created_at": "2026-05-10T12:00:00Z"
}
```

---

## AI Conversation & RAG Entities

### AIChatSession

**Purpose:** AI conversation context, scoped per project for per-user spending tracking

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| user_id | INT | Foreign Key → User (who initiated) |
| project_id | INT | Foreign Key → Project (nullable for global) |
| agent_type | String | "backlog-assistant" / "chat-assistant" / "retrospective-agent" |
| created_at | DateTime | Session start |
| updated_at | DateTime | Last message |

**Relationships:**
- One AIChatSession has many AIChatMessages (one-to-many)

**JSON Example:**
```json
{
  "id": 50,
  "user_id": 5,
  "project_id": 1,
  "agent_type": "backlog-assistant",
  "created_at": "2024-06-18T09:00:00Z",
  "updated_at": "2024-06-18T09:30:00Z"
}
```

---

### AIChatMessage

**Purpose:** Individual message in AI conversation (for RAG vectorization)

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| session_id | INT | Foreign Key → AIChatSession |
| role | String | "user" / "assistant" |
| content | String | Message content |
| model | String | Model used for this message |
| tokens_used | INT | Token consumption |
| created_at | DateTime | Timestamp |

**JSON Example:**
```json
{
  "id": 500,
  "session_id": 50,
  "role": "user",
  "content": "Create a subtask for implementing the login form UI",
  "model": "deepseek-chat",
  "tokens_used": 45,
  "created_at": "2024-06-18T09:05:00Z"
}
```

---

### AITranscription

**Purpose:** Voice transcription records (RAG-stored for AI context)

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| voice_session_id | INT | Foreign Key → VoiceSession (nullable if manual) |
| daily_standup_id | INT | Foreign Key → DailyStandup (nullable) |
| user_id | INT | Foreign Key → User |
| project_id | INT | Foreign Key → Project |
| text | String | Transcribed text |
| created_at | DateTime | Transcription timestamp |

**JSON Example:**
```json
{
  "id": 30,
  "voice_session_id": 7,
  "daily_standup_id": 2,
  "user_id": 5,
  "project_id": 1,
  "text": "Yesterday I worked on the OAuth integration. Today I'll finish the callback handler and start on the token refresh logic. No blockers.",
  "created_at": "2024-06-18T09:25:00Z"
}
```

---

## Standup & Retrospective Entities

### DailyStandup

**Purpose:** Daily standup scheduling and tracking (always transcribed for AI)

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| channel_id | INT | Foreign Key → Channel (the "Daily" voice channel) |
| scheduled_at | DateTime | Scheduled time |
| voice_session_id | INT | Foreign Key → VoiceSession (nullable until held) |
| state_summary | String | AI-generated summary of current state |
| stoppers_detected | JSON | Array of detected blockers |
| expected_latencies | JSON | Array of expected delays |
| notes | String | Additional AI notes |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

**JSON Example:**
```json
{
  "id": 2,
  "project_id": 1,
  "channel_id": 5,
  "scheduled_at": "2024-06-19T09:00:00Z",
  "voice_session_id": null,
  "state_summary": "Team is on track. OAuth feature at 80% completion.",
  "stoppers_detected": [],
  "expected_latencies": [],
  "notes": "No major blockers reported.",
  "created_at": "2024-06-18T20:00:00Z",
  "updated_at": "2024-06-18T20:00:00Z"
}
```

---

### Report Entity (Base for Project and Sprint Reports)

**Purpose:** Unified report entity supporting both Project Reports (persistent, project-wide) and Sprint Reports (sprint-bound, ephemeral in active form but persisted in history).

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project (required) |
| sprint_id | INT | Foreign Key → Sprint (nullable - null = Project Report, set = Sprint Report) |
| title | String | Report title |
| description | String | Markdown description |
| type | String | "sprint_retrospective" / "sprint_summary" / "qa_audit" / "tech_debt_review" / "product_feedback" / "velocity_report" / "custom" |
| status | String | "draft" / "published" / "archived" |
| is_active | Boolean | Soft delete flag |
| created_by | INT | Foreign Key → User |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |
| published_at | DateTime | When report was published |

**Relationships:**
- One Project has many Reports (one-to-many)
- One Sprint has many Reports (one-to-many) — Sprint can have multiple reports of different types (e.g., retrospective + summary + qa_audit all in same sprint)
- Report types extend this base (SprintRetrospective, QAAudit, TechDebtReview, etc.)

**JSON Example:**
```json
{
  "id": 1,
  "project_id": 1,
  "sprint_id": null,
  "title": "Q2 2026 QA Audit",
  "description": "Testing coverage report for Q2",
  "type": "qa_audit",
  "status": "published",
  "is_active": true,
  "created_by": 5,
  "created_at": "2026-05-09T12:00:00Z",
  "updated_at": "2026-05-09T12:00:00Z",
  "published_at": "2026-05-09T14:00:00Z"
}
```

---

### SprintRetrospective Extension

**Purpose:** Sprint retrospective with customizable sections and AI insights.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| report_id | INT | Foreign Key → Report (one-to-one) |
| sprint_id | INT | Foreign Key → Sprint |
| sections | JSON | {what_went_well, what_could_improve, action_items, team_acknowledgments} |
| ai_insights | String | AI-generated insights |
| participants | UUID[] | Users who participated |

---

### QAAudit Extension

**Purpose:** Testing coverage and defect analysis for a sprint or project.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| report_id | INT | Foreign Key → Report (one-to-one) |
| scope | String | "project" / "backlog" / "sprint" |
| scope_id | INT | ID of the scoped entity |
| metrics | JSON | {total_test_cases, passed, failed, blocked, pass_rate, test_coverage_percentage} |
| findings | JSON | Array of {severity, category, description, affected_tasks, recommendation} |
| ai_recommendations | String | AI-generated recommendations |

---

### TechDebtReview Extension

**Purpose:** Technical debt tracking and prioritization.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| report_id | INT | Foreign Key → Report (one-to-one) |
| scope | String | "project" / "backlog" |
| scope_id | INT | ID of the scoped entity |
| debt_items | JSON | Array of {task_id, category, title, description, estimated_hours, severity, status} |
| metrics | JSON | {total_debt_items, critical_count, estimated_total_hours, debt_ratio} |
| ai_insights | String | AI-generated prioritization insights |

---

### ProductFeedback Extension

**Purpose:** User feedback aggregation and sentiment analysis.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| report_id | INT | Foreign Key → Report (one-to-one) |
| feedback_sources | String[] | ["github_issues", "user_feedback", "chat_transcriptions", "surveys"] |
| sentiment_analysis | JSON | {positive, neutral, negative} percentages |
| themes | JSON | Array of {theme, frequency, representative_quotes} |
| backlog_impact | JSON | Array of {suggested_epic_title, priority, related_theme} |

---

### ReportBacklogItem Entity

**Purpose:** Suggested backlog items generated from reports that can be converted to tasks.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| report_id | INT | Foreign Key → Report |
| task_id | INT | Foreign Key → Task (nullable - null if not yet created) |
| suggested_title | String | Proposed task title |
| suggested_type | String | "epic" / "story" / "task" |
| suggested_description | String | Proposed task description |
| priority | String | "low" / "medium" / "high" / "urgent" |
| status | String | "suggested" / "approved" / "rejected" / "created" |
| created_by | INT | Foreign Key → User |
| created_at | DateTime | Creation timestamp |
| converted_at | DateTime | When task was created |

---

### Backlog Entity

**Purpose:** Multiple backlogs per project for different workflows (Development, QA, Strategic Planning).

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| name | String | Backlog name |
| description | String | Markdown description |
| type | String | "development" / "qa_testing" / "strategic" / "custom" |
| color | String | User-defined hex color |
| order_index | INT | Display order |
| is_default | Boolean | Default backlog for the project |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

---

### MiniSprint Entity

**Purpose:** Short-duration (1-3 days) tactical sprints for hotfixes, research, or polish.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| parent_sprint_id | INT | Foreign Key → Sprint (optional, links to parent regular sprint) |
| name | String | Sprint name |
| description | String | Markdown description |
| goal | String | What this mini-sprint aims to achieve |
| type | String | "hotfix" / "research" / "polish" / "qa" / "spike" / "custom" |
| start_date | Date | Sprint start |
| end_date | Date | Sprint end (max 3 days from start) |
| duration_hours | Int | Calculated from start/end (max 72) |
| status | String | "planning" / "active" / "completed" / "cancelled" |
| color | String | User-defined hex color |
| auto_complete | Boolean | Auto-complete when end_date reached |
| priority | String | "low" / "medium" / "high" / "critical" |
| created_by | INT | Foreign Key → User |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

---

### MiniSprintTask Entity

**Purpose:** Task assignments to mini-sprints.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| mini_sprint_id | INT | Foreign Key → MiniSprint |
| task_id | INT | Foreign Key → Task |
| source | String | "moved_from_backlog" / "moved_from_sprint" / "created_directly" |
| notes | String | Optional notes on why task was added |
| assigned_at | DateTime | Assignment timestamp |

---

### Trigger Entity

**Purpose:** Inter-Backlog Automation triggers that fire on events and execute actions.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| source_backlog_id | INT | Foreign Key → Backlog (nullable) |
| target_backlog_id | INT | Foreign Key → Backlog |
| name | String | Trigger name |
| description | String | Trigger description |
| event_type | String | "status_change" / "task_created" / "task_assigned" / "comment_added" / "sprint_started" / "sprint_ended" |
| conditions | JSON | Flexible conditions based on event_type |
| action_type | String | "create_task" / "duplicate_task" / "send_notification" / "update_task" |
| action_config | JSON | Action configuration (task template, notification content, etc.) |
| is_active | Boolean | Trigger active flag |
| created_by | INT | Foreign Key → User |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

---

### TaskLink Entity

**Purpose:** Links between tasks for cross-backlog relationships and automation tracking.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| source_task_id | INT | Foreign Key → Task (the source) |
| target_task_id | INT | Foreign Key → Task (the target) |
| trigger_id | INT | Foreign Key → Trigger (nullable - null if manual link) |
| link_type | String | "automation_created" / "manual" / "dependency" |
| created_at | DateTime | Creation timestamp |

---

### Canvas Entity

**Purpose:** Free Board visual canvas workspace for diagrams and schemes.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| name | String | Canvas name |
| description | String | Canvas description |
| viewport | JSON | {x, y, zoom} |
| settings | JSON | {grid_enabled, snap_to_grid, background_color} |
| created_by | INT | Foreign Key → User |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

---

### CanvasElement Entity

**Purpose:** Elements on a canvas (shapes, text, task cards, etc.).

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| canvas_id | INT | Foreign Key → Canvas |
| type | String | "rectangle" / "circle" / "arrow" / "text" / "sticky_note" / "image" / "task_card" / "connector" |
| position | JSON | {x, y} |
| size | JSON | {width, height} |
| rotation | Int | Degrees |
| style | JSON | {fill_color, stroke_color, stroke_width, opacity, border_radius, font_size} |
| content | String | Text content for text/sticky_note types |
| z_index | Int | Layering order |
| locked | Boolean | Locked for editing |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

---

### CanvasElementTaskLink Entity

**Purpose:** Bidirectional links between canvas elements and tasks.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| element_id | INT | Foreign Key → CanvasElement |
| task_id | INT | Foreign Key → Task |
| link_type | String | "visual_state" / "navigation" / "reference" |
| state_binding | JSON | {sync_direction, status_mappings} |
| created_at | DateTime | Creation timestamp |

---

### SprintGroup Entity

**Purpose:** Groups of related sprints for organization.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary Key |
| project_id | INT | Foreign Key → Project |
| name | String | Group name |
| description | String | Group description |
| created_at | DateTime | Creation timestamp |

---

### SprintGroupMembership Entity

**Purpose:** Many-to-many relationship between sprints and groups.

**Attributes:**
| Field | Type | Description |
|-------|------|-------------|
| sprint_id | INT | Foreign Key → Sprint |
| group_id | INT | Foreign Key → SprintGroup |
| joined_at | DateTime | When sprint was added to group |

---

## Entity Relationship Summary

```
User
├── SCRUMRolePreference (1→many)
├── ProjectMember (1→many)
├── ApiKeyVault (1→many)
├── Subscription (1→1)
├── Notification (1→many)
├── NotificationPreference (1→many)
├── AIChatSession (1→many)
│   └── AIChatMessage (1→many)
├── AITranscription (1→many)
├── UserFolder (1→many)
│   └── UserFolderProject (1→many)
├── ProjectTemplate (1→many, for custom templates)
└── ProjectCustomSection (1→many)

Project
├── ProjectMember (1→many)
├── Task (1→many)
├── Sprint (1→many)
│   └── Report (1→many) ← Sprint Report
├── Report (1→many) ← Project Report (sprint_id = null)
├── Backlog (1→many)
├── Chatroom (1→1)
│   ├── Channel (1→many)
│   │   ├── Message (1→many)
│   │   ├── VoiceSession (1→many)
│   │   │   └── VoiceSessionParticipant (1→many)
│   │   └── DailyStandup (1→1)
│   │       └── AITranscription (1→many)
├── Settings (1→many, polymorphic)
├── ProjectCustomSection (1→many)
├── UserFolderProject (1→many)
├── Canvas (1→many)
│   └── CanvasElement (1→many)
│       └── CanvasElementTaskLink (1→many)
├── Trigger (1→many)
└── AITranscription (1→many)

UserFolder
├── UserFolder (1→many, children)
└── UserFolderProject (1→many)

Sprint
├── Task (1→many)
├── MiniSprint (1→many, optional)
├── Report (1→many) ← Sprint Report types
└── Retrospective (1→1) ← Legacy, for backward compat

Task
├── TaskAssignee (1→many)
├── TaskDependency (1→many, as dependent)
├── TaskDependency (1→many, as blocker)
├── AcceptanceCriteria (1→many)
├── Comment (1→many)
├── Attachment (1→many)
└── TaskLink (1→many, as source or target)
```

---

## Implementation Notes

### On SQL vs NoSQL
- **SQL approach**: Use `parent_id` with recursive CTEs or closure table for task hierarchy
- **NoSQL approach**: Use `index` field with array-style traversal (as defined in TRUTH.md)
- **Hybrid**: Tasks stored in SQL with `index` field for hierarchical queries

### On RAG Vectorization
- AIChatMessage.content → vectorized for semantic search
- AITranscription.text → vectorized for context retrieval
- Task.description, AcceptanceCriteria.description → vectorized for AI context
- Report sections → vectorized for report generation

### On Settings Polymorphism
Settings.type determines interpretation:
- `general`: project_id = NULL, user_id = NULL
- `project`: project_id = project_id, user_id = NULL
- `user`: project_id = NULL, user_id = user_id
- `user_project_override`: both project_id and user_id are set

### On Report Relationships
- **Project Report**: `sprint_id = NULL`, directly associated to project
- **Sprint Report**: `sprint_id` set, associated to that sprint
- A Sprint can have **multiple reports** of any type (QA audit, PO feedback, etc.)
- Reports linked to tasks transitively through task links (not direct FK)

### On Mini-Sprints
- Mini-Sprints do NOT have full reports — only lightweight "Mini-Sprint Notes"
- Mini-Sprints can optionally link to a parent regular Sprint
- Mini-Sprints can run concurrently with regular sprints without capacity interference

### Helper function for nested folder depth check
```sql
CREATE OR REPLACE FUNCTION nest_level(user_id_param INTEGER, parent_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  level INTEGER := 0;
  current_parent_id INTEGER := parent_id_param;
BEGIN
  IF parent_id_param IS NULL THEN
    RETURN 0;
  END IF;
  
  WHILE current_parent_id IS NOT NULL LOOP
    level := level + 1;
    SELECT parent_id INTO current_parent_id
    FROM user_folders
    WHERE id = current_parent_id AND user_id = user_id_param;
  END LOOP;
  
  RETURN level;
END;
$$ LANGUAGE plpgsql;
```