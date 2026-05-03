---
description: This file is a TRUTH document for the AI development process. The AI must follow these instructions no matter what.
use: When you start a new task, always ask if it needs a planning phase, this phase will be documented in a separate file with the same name of the task and .md extension.
---
# TRUTH File
This file is the main base for all the documentation of the project. All the other documentation is based on this file.
If there are incongruences among the documentation files, this document is the true source of truth, and must be followed. The code and new implementations must follow this truth. If there's a change on architecture, the documentation must be updated too.

## Project Information
- Name: ScrumHub
- Description: A project management tool for teams using Scrum methodology.

### Features

**Project Management**
- Create and manage Multiple Scrum Projects
- Each project has: name, description (markdown), color, status, members, custom sections

**Work Views**
- Scrum, Kanban, and Hybrid work views
- Quest Tree view (game-like dynamic tree with notifications and progress bars)
- Calendar view showing sprints, tasks, epics, stories, subtasks per sprint
- List/Board view switchable per project

**Backlog**
- Complete backlog contains all tasks regardless of sprint
- Tasks can exist outside sprints (visible in "Complete backlog" view with filter)
- Sprint view shows tasks grouped by sprint

**Sprints**
- Group tasks and manage workflow
- Have their own views: Kanban boards, Calendar, Retrospectives
- Default view is current sprint, changeable via header filter to specific sprint or complete backlog
- Sprint creation: description (markdown), start date, due date, assignable tasks/epics/stories/subtasks

**Daily Standups**
- Daily standup scheduling with notifications
- Occurs in dedicated "Daily" channel (default, cannot be deleted)
- "Daily" channel has both voice and text chat
- Part of Calendar view integration
- **Always transcribed**: All Daily standups are automatically transcribed, stored, and used by AI agent in retrospectives and reports

**Tasks, Stories, Epics, Subtasks**
- Same entity with type property (epic, story, task)
- Subtask is a task nested inside another task (recursive, no limit)
- All have: title, description, type, priority, status, assignees (multiple), due date, create/update dates, comments, attachments, acceptance criteria, dependencies

**Kanban Boards**
- Boards represent status columns
- Filters by user, role, due date, sprint, status, priority
- See UI & UX section for detailed board behavior

**Retrospectives (Per Sprint)**
- Date, description (markdown), title
- Customizable sections (What went wrong, good, improved, changed)
- AI-assisted via Retrospective skills
- See Task Hierarchy section for structure details

**Chatroom (Per Project)**
- Discord-like UI with text and voice channels
- Message history, markdown support
- WebRTC voice, AI transcription on-demand
- "Transcribe & Create Task" feature
- "Daily" channel (default) for daily standups

**AI Assistant**
- Backlog Assistant, Chat Assistant
- Customizable prompts, personality, tone
- Per-project and general settings
- See Settings Architecture section for full detail

**AI Data Storage (RAG)**
- AI context and data stored as Retrieval-Augmented Generation (RAG) with vectorized databases
- Enables semantic search over chat history, transcriptions, task context
- Used by AI agent for context-aware responses in retrospectives, reports, and assistance

**Analytics & Reports**
- Per project: close tasks, due, completed, pending, overdue counts
- Pie charts, percentage completion bars
- Project overview with charts and statistics

**Project Overview**
- Current sprint status, task counts
- Customizable sections (project info, features, purpose)
- Default view is current sprint, filterable to specific sprint or complete backlog

**Quest Tree**
- Game-like dynamic quest tree with progress bars
- Priority (border color), state (background color), user shadow on incomplete tasks
- See UI & UX section for detailed behavior

**Settings**
- General and Per Project (customizable by project admin)
- Roles-based options, theme, colors, notifications, AI settings
- See Settings Architecture section for full detail

**Integrations**
- GitHub: issues, pull requests
- Web Services: Moodle, Canvas LMS
- Notifications: Email, Push, In-App

### User Roles & Permissions

#### SCRUM Roles (Per Project)
SCRUM roles define the user's UI/UX experience within the project, not task visibility. All users see all tasks, but their role customizes how they interact with and view the project.
- **Product Owner** — Backlog-centric view, priority management, acceptance criteria interface
- **Scrum Master** — Sprint facilitation tools, retrospective views, blocker management
- **Quality Assurance (QA)** — Acceptance criteria focus, testing workflow views
- **Developer** — Task execution view, coding-centric interface, may be specialized (Frontend, Backend, Database, AI, React, Node, etc.)
- **Tester** — Testing workflow view, test case management interface
- **DevOps** — CI/CD pipeline view, deployment status, GitHub integration focus
- **Tech Lead** — Overview dashboards, architecture views, code review tools

#### Admin Role (Per Project)
- Unrelated to SCRUM roles
- Created automatically when a user creates a project
- Permissions: Delete project, manage member permissions, invite users, manage project settings
- Can delegate admin rights to other project members

#### Role Separation Principle
- **SCRUM roles** affect: UI views, AI assistant responses, default filters, and interaction patterns
- **Admin role** affects: project configuration, member management, and deletion rights (separate from SCRUM roles)

### Task Hierarchy
All items (Epic, User Story, Task) share the same backend entity with a `type` property distinguishing them:
- **Epic** — `type: "epic"`. Top-level container. Groups multiple items. Marked complete only when all contained items are done.
- **User Story** — `type: "story"`. Mid-level item. May contain tasks. Has acceptance criteria.
- **Task** — `type: "task"`. Work item associated to an Epic (optionally to a User Story). Has acceptance criteria.
- **Subtask** — Not a separate type. A task nested inside another task via parent-child relationship. Can nest recursively without limit.

**Index System:**
- Each task has an `index` field (INT, 16-byte) representing its hierarchy level (1 to max)
- Higher index = more tasks above it in the hierarchy
- Index is used with ID relationships to determine parent-child traversal
- This enables NoSQL-like hierarchical queries on a SQL database

**Acceptance Criteria:**
- Elements associated to a task, managed by QA or assigned users
- Two states: Marked or Unmarked
- All criteria must be Marked for the task to transition to Done

**Cascade Rule:**
- By default, if a user is assigned to a parent task, they are implicitly assigned to all subtasks
- This can be overridden per subtask

**Task Dependencies:**
- Tasks can have dependencies on other tasks
- A task with a dependency cannot be started until the dependency task is started/completed
- Dependencies are directional (Task A depends on Task B)

### Kanban Boards
Boards are visual representations of **Status** entities. All tasks with a given status appear on that board.

**Board Entity:**
```
Board:
├── id
├── project_id
├── name
├── statuses: Status[]
├── filters_default: { user_id, role, due_date, sprint, priority }
└── is_collapsed: boolean (per user preference)
```

**Status Entity:**
```
Status:
├── id
├── project_id
├── name (e.g., "To Do", "In Progress", "Testing", "Done")
├── color
├── associated_role: SCRUM role that "owns" this status (e.g., "Testing" → QA)
├── order: number (for column ordering)
└── is_active: boolean
```

**Task Entity Relationship:**
- Each task has a `status_id` field linking to Status
- Board queries all tasks where `status_id` matches its status

**Board Item Display:**
Each card on the board shows:
- Title
- Priority (color-coded icon)
- Assignee(s) (avatar(s))
- Due date
- Item is collapsible to show/hide subtasks

**Drag & Drop Behavior:**
- Any item (Epic, User Story, Task, Subtask) can be dragged between boards
- When a parent task is dragged to a new board, **all its subtasks inherit that board's status**
- This ensures hierarchical state consistency

**Phantom Parent Pattern:**
When a subtask's status differs from its parent:
- **Single subtask differs**: Subtask appears as its own card on the appropriate board
- **Multiple subtasks differ**: Subtasks are nested under a "phantom" version of the parent card
  - Phantom parent is visually distinct (e.g., dashed border, muted colors)
  - Labeled as "[Parent] (state: X)" to indicate the actual parent is in a different status
  - Shows all subtasks that belong to a different status than the parent

### Chatroom
Per-project Discord-like chat interface with voice and text channels.

**Chatroom Entity:**
```
Chatroom:
├── id
├── project_id
├── name
├── channels: Channel[]
└── created_at
```

**Channel Entity:**
```
Channel:
├── id
├── chatroom_id
├── type: "text" | "voice"
├── name
├── order: number
└── is_active: boolean
```

**Text Channel Features:**
- Message history with timestamps
- Messages support markdown
- AI transcription on demand (not automatic) — if user requests, AI transcribes relevant messages and can create/update tasks from them

**Voice Channel Features:**
- WebRTC-based real-time voice communication
- Optional AI transcription (on-demand, triggered by user)
- Transcribed content can be used to auto-create or update tasks

**AI Integration:**
- "Transcribe & Create Task" button available in text/voice channels
- When triggered, AI analyzes messages and proposes task changes or creations
- User confirms before any task modification

### Subscription Plans & API Credits

| Plan | Price | Included Credits | API Access | Notes |
|------|-------|-----------------|------------|-------|
| **Free** | $0/month | $5/month (DeepSeek) | ScrumHub shared key only | Limited features, single user |
| **Starter** | $9/month | $20/month | Own API keys + fallback | 3 projects max |
| **Pro** | $29/month | $50/month | Own API keys + all models | Unlimited projects |
| **Enterprise** | Custom | Unlimited | All models + dedicated resources | SSO, SLA, priority support |

**Credit System:**
- Credits refresh monthly; unused credits do not roll over (except on Pro annual)
- Consumption beyond included credits is billed at provider rates
- Premium plans include first $20 of credits; beyond that is pay-as-you-go

**Subscription Entity:**
```
Subscription:
├── id
├── user_id
├── plan: "free" | "starter" | "pro" | "enterprise"
├── status: "active" | "cancelled" | "past_due"
├── current_period_start
├── current_period_end
├── credits_remaining: decimal
└── billing_cycle: "monthly" | "annual"
```

## UI & UX
- Visual Studio Code UI (sidebar, header, file structure, etc.)

### Global Sidebar (Leftmost, Never Disappears)
- Composed only of icons with hover tooltips on mouse over
- Icons for global views: Home (Overview), Backlog, Epics, Quest Tree, Chat, Reports, Settings (cogwheel)
- Views: Home, Backlog, Epics, Quest Tree, Chat, Reports, Settings

### Specific View Sidebar
- Located on the right side of the global sidebar, part of certain views only
- Can be hidden (collapsible)
- Examples:
    - **Settings view**: Navigation sidebar with sections (General Settings, Profile, Theme, Notifications, AI Assistant, Project Settings link)
    - **Backlog view**: Collapsible list of all sprints and sprint tasks

### Header
- **Options section** (left to right):
    - **Project selector dropdown**: Shows project name, redirects to overview on click, cards view if none selected, option to create new project
    - **Search bar** (centered): Input field with magnifying glass icon on right. On click, expands to show search suggestions and "Ask the AI" option. Acts as command palette (typing `>theme` opens theme settings). Searches project results inside project view, global results outside.
    - **Notifications button**: Expands to show notifications interface
    - **Settings button**: Always opens General Settings (header button, separate from sidebar cogwheel)
    - **User Profile dropdown**: Opens profile interface with profile settings and logout option
- **Tabs section**:
    - Tabs to change between project views or show list of projects
    - Tabs can be closed, reordered (drag and drop), pinned (pinned tabs stay left)
    - Task/story/epic/subtask detail views open as tabs

### View-Specific UI Elements

**Task Detail Tab:**
- Title (editable), Description (editable, markdown), Type selector (Task, User Story, Epic)
- Acceptance criteria checklist
- Parent relationship shown as breadcrumbs (e.g., Epic > User Story > Task)
- Assigned users (multi-select)
- Due date
- Dependencies (tasks that must be started/completed first)
- Subtasks list with quick-add capability
- Comments section with comment input
- AI Help button: Opens modal with text input to ask AI to edit task, create subtasks, explain, etc.

**Task Creation Overlay:**
- Same layout as Task Detail, minus comments section
- Subtask section allows quick task creation with name only

**Sprint Creation Overlay:**
- Sprint description (markdown)
- Start date, Due date
- Task selector: Assign tasks, epics, user stories, or subtasks to sprint

**Board Editing Modal:**
- Board name, Status management (add/edit/delete statuses)
- Status color picker (predetermined colors + custom)
- SCRUM role association per status

**Quest Tree View:**
- Icon in global sidebar with red dot notification (urgency indicator)
- Shows hierarchical tree of tasks
- Priority represented by border color, State represented by background color
- User's incomplete tasks have visible shadow
- On task click: Opens modal with task description, due date, state, acceptance criteria (comments hidden)
- "See more details" button opens full tab view

**Empty States:**
- **No projects**: Shows "No projects" + "Create project" button + AI input placeholder "Help me create a project..."
- **Empty boards**: Boards displayed with no tasks
- **No sprints (Backlog)**: Sidebar shows "No current sprints", view shows "Create an Epic" + "Ask the AI to start creating your first Sprint" suggestion
- **Tasks outside sprints**: Visible in complete backlog view with filter option
- **Home (no activity)**: Shows "Nothing to see, start creating sprints or epics"

## Instructions

- The application must be built with:
    - Frontend: React with Vite (TypeScript), Tailwind CSS and TANSTACK Router and Query.
    - Backend Mock: json server, used as mock for database management. (Only for Frontend Development and testing)
    - Backend: Express (TypeScript), PostgreSQL, Supabase (PostgreSQL) and pg Admin for database management.
    - AI: DeepSeek API for AI features.

### Multi-Assignee Model
- **Tasks**: Many-to-many relationship with users. A task can have multiple assignees, regardless of type.
- **Projects**: Many-to-many relationship with users. A user can belong to multiple projects. (Practical limit: ~1000 members per project)
- **User Profile**: Contains SCRUM role preferences (one-to-many, e.g., a user can be both Developer and QA)
- **Cascade Override**: Parent task assignees cascade to subtasks by default, but can be overridden per subtask

### Secure API Key Management
API keys are sensitive credentials that must be protected from unauthorized use.

**ApiKeyVault Entity:**
```
ApiKeyVault:
├── id
├── provider: "deepseek" | "openai" | "anthropic" | ...
├── encrypted_value: string (encrypted at rest, never stored in plaintext)
├── public_alias: string (user-defined name, shown in UI)
├── created_by_user_id
├── is_shared: boolean
├── allow_project_share: boolean (can project members use this key?)
├── max_credit_per_user: decimal (max credits a single user can expend when using shared key)
├── created_at
└── updated_at
```

**Security Principles:**
- **Encrypted at rest**: Keys are encrypted using a master key known only to the backend
- **Private key isolation**: The raw API key value never leaves the backend, never exposed to frontend
- **Frontend sees only aliases**: UI displays `public_alias`, not the actual key
- **Decryption happens server-side only**: When calling the AI API, backend decrypts the key internally

**Access Control:**
- **Per-user keys**: Created by individual users, only they can use them
- **Project-shareable keys**: Project admin can enable `allow_project_share`
- **Project API sharing with credit limits**: Project admin can share project's API key with project members. Admin configures `max_credit_per_user` limit to prevent any single user from consuming all credits
- **Key priority**: User key → Project shared key → ScrumHub plan credits (first available is used)

### Settings Architecture
Settings are stored as a polymorphic entity, enabling flexible override chains across different scopes.

**Settings Entity:**
```
Settings:
├── id
├── type: "general" | "project" | "user" | "user_project_override"
├── scope_id: integer | null (project_id or user_id, null for general)
├── name: string
├── config: JSON
└── created_at, updated_at
```

**Config Structure (JSON):**
```json
{
  "general": {
    "theme": "dark" | "light",
    "language": "en" | "es" | ...,
    "notifications": {
      "email": boolean,
      "push": boolean,
      "in_app": boolean
    }
  },
  "ai": {
    "default_model": "deepseek-chat",
    "models_per_capability": {
      "chat": "deepseek-chat",
      "code": "deepseek-coder",
      "analysis": "deepseek-chat"
    },
    "temperature": 0.7,
    "tone": "professional" | "casual" | "technical",
    "system_prompt": "...",
    "language": "en",
    "skills": ["retrospective", "backlog-optimization", "code-review"],
    "tools": ["web-search", "file-operations"],
    "permissions": {
      "can_delete_tasks": boolean,
      "can_manage_members": boolean,
      "can_export_data": boolean
    }
  },
  "agents": {
    "backlog-assistant": {
      "enabled": boolean,
      "system_prompt": "...",
      "model": "deepseek-chat",
      "temperature": 0.7,
      "skills": ["backlog-optimization"],
      "tools": ["web-search"]
    },
    "chat-assistant": { ... },
    "retrospective-agent": { ... }
  }
}
```

**Override Hierarchy (lowest to highest priority):**
1. **General Settings** (`type: "general"`, `scope_id: null`) — Defaults for all users and projects
2. **Project Settings** (`type: "project"`, `scope_id: project_id`) — Overrides general for all project members
3. **User Settings** (`type: "user"`, `scope_id: user_id`) — Overrides general for this user across all projects
4. **User-Project Override** (`type: "user_project_override"`, `scope_id: {user_id, project_id}`) — User's project-specific preferences

**Relationship Model:**
- **General Settings** ↔ **Projects**: Many-to-many (one general settings can apply to multiple projects if not overridden)
- **Project Settings** ↔ **Projects**: One-to-one (each project has one settings entity)
- **User Settings** ↔ **Users**: One-to-one (each user has one personal settings entity)
- **User-Project Override** ↔ **(User, Project)**: One-to-one per user per project

**AI Settings Override Chain:**
- When AI makes a decision, it resolves settings in priority order: user_project_override → user → project → general
- API keys follow: user key → project shared key → plan credits

## Structure
### Frontend
- `src/`
    - `App.tsx`:
        - Main component, responsible for the application structure.
    - `main.tsx`:
        - Entry point of the application, responsible for rendering the main component.
    - `services/`:
        - API calls to backend (Express).
    - `store/`:
        - Application state management.
    - `components/`:
        - Reusable dumb UI components (Across multiple features).
        - `layout/`:
            - Layout components. (Navigation bar, sidebar, footer, etc.)
        - `ui/`:
            - Generic UI components. (Buttons, inputs, etc.)
    - `hooks/`:
        - Reusable hooks (Across multiple features).
    - `utils/`:
        - Utility functions (Across multiple features).
    - `pages/`:
        - Pages components. (Using components, hooks, utils, etc. from other directories)
    - `routes/`:
        - Routes configuration. (Using pages directory, only routing logic here, no UI components)
    - `styles/`:
        - Global styles, tailwind custom config, etc.
    - `types/`:
        - Global TypeScript types definitions.
    - `features/`:
        - Feature-specific components, logic and styles.
            - `feature-name/`
                - `components/`:
                    - Feature-specific components.
                - `services/`:
                    - Feature-specific API calls.
                - `store/`:
                    - Feature-specific state management.
                - `types/`:
                    - Feature-specific TypeScript types definitions.
                - `hooks/`:
                    - Feature-specific hooks.
                - `utils/`:
                    - Feature-specific utility functions.
                - `styles/`:
                    - Feature-specific styles.
- `index.html`: Entry point of the application.
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.
- `tailwind.config.ts`: Tailwind CSS configuration.
- `vite.config.ts`: Vite configuration.

