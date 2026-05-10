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

## Core Features (Summary)

For detailed feature documentation, see **[FEATURES.md](./FEATURES.md)** and **[features/](./features/)** folder.

**Project Management**
- Multiple Scrum projects per user
- Each project has: name, description, goal, icon, color, status, members, custom sections
- **Workspace Explorer**: VS Code-inspired file explorer for navigation (see [features/PROJECT_EXPLORER.md](./features/PROJECT_EXPLORER.md))
- **Project Templates**: Pre-built starting points (see [features/PROJECT_TEMPLATES.md](./features/PROJECT_TEMPLATES.md))
- **AI Project Creation**: Create projects via natural language

**Folder Organization**
- Personal per-user folder structure (not shared between users)
- Hierarchical folders containing projects
- Projects can be pinned for quick access
- Explorer state persisted locally

**Backlog Model**
- **Multi-Backlog Orchestration**: Projects support multiple specialized backlogs (Development, QA/Testing, Strategic Planning)
- Each backlog contains all tasks within that workflow context
- Tasks can exist outside sprints (backlog-only)
- See **[features/MULTI_BACKLOG.md](./features/MULTI_BACKLOG.md)**

**Sprint Model**
- **Simultaneous Sprints**: Multiple sprints can run in parallel within the same project
- Each task belongs to exactly one sprint
- **Mini-Sprints**: Short-duration (1-3 days) tactical sprints for hotfixes, research, or polish
- See **[features/SIMULTANEOUS_SPRINTS.md](./features/SIMULTANEOUS_SPRINTS.md)** and **[features/MINI_SPRINTS.md](./features/MINI_SPRINTS.md)**

**Task Hierarchy**
All items (Epic, User Story, Task, Subtask) share the same entity with `type` property:
- **Epic** — `type: "epic"`. Top-level container. Marked complete only when all contained items are done.
- **User Story** — `type: "story"`. Mid-level item. May contain tasks. Has acceptance criteria.
- **Task** — `type: "task"`. Work item associated to an Epic or User Story. Has acceptance criteria.
- **Subtask** — A task nested inside another task via parent-child relationship. Recursive, no limit.

**Index System:**
- Each task has an `index` field (INT) representing hierarchy level
- Higher index = more tasks above it in the hierarchy
- Enables NoSQL-like hierarchical queries on SQL database

**Task Properties:**
- title, description, type, priority, status, assignees (multiple), due date
- comments, attachments, acceptance criteria, dependencies
- Cascade Rule: Parent assignees cascade to subtasks by default (can be overridden)

### Work Views
- Scrum, Kanban, and Hybrid views
- Quest Tree (game-like dynamic tree)
- Calendar (sprints, tasks, standups)
- List/Board switchable per project

### Collaboration
- **Chatroom**: Per-project Discord-like UI with text/voice channels
- **Daily Standups**: Scheduled in dedicated "Daily" channel, always transcribed
- **AI Integration**: Event-driven monitoring, Inter-Backlog Automation

### AI as Virtual Team Member
- AI acts as proactive Backlog Refiner
- Event-driven: user conversations, task status changes, GitHub updates
- Manages Inter-Backlog triggers (automatic task creation across backlogs)
- See **[features/INTER_BACKLOG_AUTOMATION.md](./features/INTER_BACKLOG_AUTOMATION.md)**

### Reports
- **Report Hub**: Persistent project-wide reports (QA Audits, Tech Debt, Product Feedback)
- **Sprint Reports**: Bound to sprint lifecycle (Retrospectives, Summaries)
- Reports can spawn backlog items
- See **[features/REPORT_HUB.md](./features/REPORT_HUB.md)**

### Free Board (Visual Roadmap)
- Visual canvas bidirectionally linked to backlog items
- Elements change color when linked items change state
- See **[features/FREE_BOARD.md](./features/FREE_BOARD.md)**

---

## User Roles & Permissions

### SCRUM Roles (Per Project)
SCRUM roles define the user's UI/UX experience, not task visibility. All users see all tasks.

| Role | Description |
|------|-------------|
| **Product Owner** | Backlog-centric view, priority management, acceptance criteria |
| **Scrum Master** | Sprint facilitation, retrospective views, blocker management, AI-augmented |
| **Developer** | Task execution view; specializes in Frontend, Backend, AI, or Feature development |
| **QA** | Merged role (QA + Tester). Acceptance criteria focus, testing workflow |
| **DevOps** | CI/CD pipeline, deployment status, GitHub integration |
| **Tech Lead** | Overview dashboards, architecture views, code review |

### Admin Role (Per Project)
- Unrelated to SCRUM roles
- Created when a user creates a project
- Permissions: Delete project, manage members, invite users, manage settings

### Role Separation Principle
- **SCRUM roles**: Affect UI views, AI responses, default filters, interaction patterns
- **Admin role**: Affects project configuration, member management, deletion rights

---

## Kanban Boards

**Core Behavior:**
- Boards represent Status entities. All tasks with a given status appear on that board.
- Any item (Epic, Story, Task, Subtask) can be dragged between boards
- When parent task moves, all subtasks inherit that board's status

**Phantom Parent Pattern:**
When a subtask's status differs from parent:
- Single subtask differs: Appears as its own card
- Multiple subtasks differ: Nested under "phantom" parent (dashed border, muted colors)

**Board Item Display:** Title, priority icon, assignee avatars, due date, collapsible subtasks

---

## AI & RAG

**AI Context Storage:**
- AI data stored as Retrieval-Augmented Generation (RAG) with vectorized databases
- Semantic search over: chat history, transcriptions, task context
- Enables context-aware AI responses

**AI Event Triggers:**
- User conversations in chat
- Task status changes
- GitHub repository updates
- Trigger actions across backlogs automatically

---

## UI & UX

### Global Layout
- **Visual Studio Code-inspired UI**
- **Global Sidebar** (leftmost, never disappears): Icons for Home, Backlog, Epics, Quest Tree, Chat, Reports, Settings
- **Header**: Project selector, Search (command palette), Notifications, Settings, User profile
- **Tabs**: Project views, task detail tabs. Can be closed, reordered, pinned

### View-Specific UI

**Task Detail Tab:**
- Title, description (markdown), type selector
- Acceptance criteria checklist
- Parent relationship breadcrumbs
- Assignees, due date, dependencies
- Subtasks with quick-add
- Comments section
- AI Help button

**Sprint Creation:**
- Description (markdown), start/end dates
- Task selector for assignment

**Board Editing:**
- Name, status management (add/edit/delete)
- Status color picker, SCRUM role association

**Quest Tree View:**
- Hierarchical tree with priority (border) and state (background) colors
- User's incomplete tasks have shadow
- Click opens modal with details

**Empty States:**
- No projects: "Create project" + AI input
- Empty boards: Show columns
- No sprints: "Create Epic" + AI suggestion
- No activity: "Nothing to see, start creating"

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Router & Query |
| Backend Mock | JSON Server (for frontend development/testing) |
| Backend | Express (TypeScript), PostgreSQL, Supabase, pgAdmin |
| AI | DeepSeek API |
| Real-time | WebSocket for chat and voice |

---

## Multi-Assignee Model

- **Tasks ↔ Users**: Many-to-many. A task can have multiple assignees.
- **Projects ↔ Users**: Many-to-many via ProjectMember (~1000 members/project limit)
- **User Profile**: Contains SCRUM role preferences (one-to-many per user)
- **Cascade Override**: Parent assignees cascade to subtasks by default, can be overridden

---

## Secure API Key Management

**Security Principles:**
- Keys encrypted at rest using master key
- Raw key never leaves backend
- Frontend sees only aliases (public_alias)
- Decryption happens server-side only

**Access Control:**
- User key → Project shared key → Plan credits (first available used)
- Project admin can enable `allow_project_share`
- `max_credit_per_user` prevents single user consuming all shared credits

---

## Settings Architecture

Settings are polymorphic with override hierarchy (lowest to highest priority):

1. **General Settings** — Defaults for all users/projects
2. **Project Settings** — Overrides general for project members
3. **User Settings** — Overrides general for user across all projects
4. **User-Project Override** — User's project-specific preferences

**AI Settings Resolution:**
- user_project_override → user → project → general
- API keys: user key → project shared key → plan credits

---

## Architecture Migration Status

Completed **May 7, 2026**:
- Route-driven layout with AppShell decoupled via `<Outlet />`
- Project-scoped routing under `/app/projects/$projectId/`
- Feature-first organization in `src/features/`
- Hierarchical TanStack Query keys: `['project', projectId, ...]`

*Any future architecture changes must be reflected here.*

---

## Frontend Structure (TanStack Router)

```
src/
├── routeTree.gen.ts      # Auto-generated
├── router.tsx            # Router instance
├── routes/
│   ├── __root.tsx        # Root route
│   ├── index.tsx         # Landing (/)
│   ├── login.tsx         # /login
│   ├── register.tsx      # /register
│   └── app/
│       ├── route.tsx     # Auth guard
│       └── projects/
│           ├── index.tsx           # /app/projects
│           ├── create.tsx          # /app/projects/create
│           └── $projectId/
│               ├── route.tsx       # Project layout (AppShell + loader)
│               ├── dashboard.tsx    # /app/projects/$projectId/dashboard
│               ├── board.tsx       # /app/projects/$projectId/board
│               ├── backlog.tsx     # /app/projects/$projectId/backlog
│               ├── calendar.tsx    # /app/projects/$projectId/calendar
│               ├── sprints.tsx     # /app/projects/$projectId/sprints
│               ├── settings.tsx    # /app/projects/$projectId/settings
│               ├── tasks/$taskId.tsx
│               ├── epics/$epicId.tsx
│               └── chat/
│                   ├── index.tsx
│                   └── $sessionId.tsx
├── pages/                # Thin orchestrators
├── components/
│   ├── layout/           # AppShell, Sidebar, TopBar
│   └── ui/               # UI atoms
├── features/             # Feature modules (self-contained)
├── services/             # apiClient
├── store/                # AuthContext, ThemeRegistry
├── hooks/                # useEntityTheme, etc.
├── styles/               # globals.css
├── types/                # Global TypeScript types
└── utils/                # Pure utilities
```

### Entry Points

| File | Purpose |
|------|---------|
| `routes/__root.tsx` | Root route, providers, HTML shell |
| `routes/app/route.tsx` | Authenticated layout, redirects to /app/projects |
| `routes/app/projects/$projectId/route.tsx` | Project layout, wraps AppShell + Outlet |

### Project Layout Pattern

`$projectId/route.tsx`:
- Loader pre-fetches project via `projectQuery.ensureQueryData()`
- Renders `<AppShell><Outlet /></AppShell>`
- All child routes share AppShell

### Feature Module Structure

```
features/<name>/
├── components/     # Feature-specific components
├── hooks/          # use<Name>.ts
├── services/       # <name>Service.ts
├── types/          # <name>Types.ts
├── utils/          # <name>Utils.ts
├── styles/         # <name>.module.css
└── index.ts        # Barrel export
```

---

## Instructions

All implementations must follow:
- **Frontend**: React + Vite (TypeScript), Tailwind CSS, TanStack Router and Query
- **Backend**: Express (TypeScript), PostgreSQL, Supabase
- **AI**: DeepSeek API

For entity schemas and JSON examples, see **[ERD.md](./ERD.md)**.
For API endpoints, see **[ENDPOINTS.md](./ENDPOINTS.md)**.
For feature details, see **[features/](./features/)** folder.