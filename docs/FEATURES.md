# ScrumHub Features

This document describes all features of ScrumHub. For technical implementation, refer to other documentation files.

---

## Documentation Navigation

ScrumHub documentation is structured as a hierarchy. Start with **TRUTH.md** for any technical decision.

| Document | Purpose | When to Read |
|---------|---------|--------------|
| **[TRUTH.md](./TRUTH.md)** | Absolute source of truth. Architecture, entities, UI/UX, patterns | Always first. Any technical decision must follow this. |
| **[AGENTS.md](./AGENTS.md)** | AI assistant coding guide. Stack, conventions, patterns | Before writing code |
| **[ERD.md](./ERD.md)** | Entity relationships and data structures | When working on backend/data |
| **[ENDPOINTS.md](./ENDPOINTS.md)** | API endpoints specification | When working on API integrations |
| **[FEATURES.md](./FEATURES.md)** | Feature descriptions (this file) | Understanding what the app does |
| **[UX.md](./UX.md)** | User experience specifications | When designing UI/UX |
| **[BRAND_CONTEXT.md](./BRAND_CONTEXT.md)** | Visual design language | When designing UI components |
| **[CONCEPTS.md](./CONCEPTS.md)** | SCRUM methodology concepts | Understanding terminology |
| **[features/](./features/)** | Individual feature documentation | Detailed implementation specs per feature |

---

## Application Purpose

ScrumHub is a SCRUM project management tool that replaces tools like Jira and GitHub Projects.

**Core Philosophy:** All-in-one workspace where AI assists with planning, execution, and retrospectives.

---

## Features Overview

### Core Management

**Project Management**
- Create and manage multiple Scrum projects
- Each project has: name, description (markdown), goal, icon, color, status, members, custom sections
- Project members have SCRUM roles and admin permissions
- **Workspace Explorer**: VS Code-inspired file explorer for project navigation
- **Project Templates**: Pre-built templates for common project types
- **AI Project Creation**: Natural language project creation

**Task Management (Epic, User Story, Task, Subtask)**
- Single unified entity with `type` field distinguishing them
- All have: title, description, priority, status, assignees (multiple), due date, comments, attachments, acceptance criteria, dependencies
- Subtasks are tasks nested inside other tasks (recursive, no limit)
- Tasks support multi-assignee with cascade rule (parent assignees cascade to subtasks by default)

**Sprints**
- Group tasks into time-boxed sprints
- Sprint views: Kanban board, Calendar, Retrospectives
- Default view is current sprint, filterable to specific sprint or complete backlog
- **Simultaneous Sprints**: Multiple sprints can run in parallel, allowing different sub-teams to work on independent modules at the same time
- Each task belongs to exactly one sprint
- **Mini-Sprints**: Short-duration (1-3 days) tactical sprints for hotfixes, PO research, or last-minute polish

**Backlog**
- Complete backlog contains all tasks regardless of sprint
- Tasks can exist outside sprints (backlog-only)
- Sprint view shows tasks grouped by sprint
- **Multi-Backlog Orchestration**: Projects support multiple specialized backlogs (e.g., Development Backlog, QA/Testing Backlog, Strategic Planning Backlog)
- Backlogs can be switched between within the same project

### Views

**Kanban Boards**
- Boards represent status columns
- Drag-and-drop task movement
- Filters by user, role, due date, sprint, status, priority
- Status columns have custom names, colors, and SCRUM role associations

**Quest Tree View**
- Game-like hierarchical tree of tasks
- Priority = border color, State = background color
- User's incomplete tasks have visible shadow
- Red dot notification for urgency

**Calendar View**
- Shows sprints, tasks, epics, stories, subtasks per sprint
- Daily standup scheduling with notifications
- Daily standups occur in dedicated "Daily" channel

**Retrospectives (Per Sprint)**
- Date, description, title
- Customizable sections (What went wrong, good, improved, changed)
- AI-assisted via Retrospective skills

### Collaboration

**Chatroom (Per Project)**
- Discord-like UI with text and voice channels
- Message history with markdown support
- WebRTC voice, AI transcription on-demand
- "Transcribe & Create Task" feature
- "Daily" channel (default) for daily standups

### AI Features

**AI Assistant**
- Backlog Assistant, Chat Assistant
- Customizable prompts, personality, tone
- Per-project and general settings
- AI context stored as RAG with vectorized databases

**AI Data Storage (RAG)**
- AI context and data stored as Retrieval-Augmented Generation
- Enables semantic search over chat history, transcriptions, task context
- Used by AI agent for context-aware responses

**AI as Virtual Team Member**
- AI acts as a proactive Backlog Refiner that monitors work across backlogs
- Event-driven monitoring triggered by: user conversations, task status changes, GitHub repository updates
- Inter-Backlog Automation: AI can automatically create linked tasks across backlogs based on defined triggers (e.g., when a Developer moves a task to "Testing", AI generates a corresponding task in the QA Backlog)

### Reports

**Report Hub (Persistent)**
- Project-wide reports that persist across the project lifecycle
- Role-based visibility and creation permissions
- Types: QA Audits, Tech Debt reviews, Product Feedback, and more
- Can directly influence the Product Backlog by spawning new tasks/epics
- Always available (does not require an active sprint)

**Sprint Reports (Per Sprint)**
- Sprint-bound reports that are created during a sprint and conclude when the sprint ends
- Includes Sprint Retrospectives (process-focused) and Sprint Summaries (product-focused)
- Persisted in history but are tied to their originating sprint

### Workspaces (Visual Roadmap)

**Free Board**
- Visual canvas for sketching, diagrams, and schemes
- Bidirectionally linked to backlog items
- Visual elements change color when linked items change state (e.g., sketch element turns green when its related User Story is marked "Done")
- Similar to Miro/Whimsical, used as AI context for SCRUM planning

### Settings

**Settings Architecture**
- General and Per Project (customizable by project admin)
- Roles-based options, theme, colors, notifications, AI settings
- Settings are polymorphic: general → project → user → user_project_override

**Themes**
- VS Code-inspired UI
- Dark and Light modes with CSS variables
- User-defined entity colors via `--entity-*` CSS variables

### Integrations

- GitHub: issues, pull requests
- Web Services: Moodle, Canvas LMS
- Notifications: Email, Push, In-App

---

## Feature Details

### Workspace Explorer
- VS Code-inspired file explorer paradigm
- Hierarchical folder structure for project organization
- Folders are per-user (personal organization, not shared)
- Projects as file-like entries with icons and color indicators
- Pinned projects section for quick access
- Search with filtering (hides non-matching items)
- View size options: Compact, Medium, Big
- Context menus for folder and project actions
- AI integration in search bar for natural language project creation
- Explorer state persisted in localStorage

### Project Templates
- Pre-built templates for common project types (Sprint Planning, Research, Bug Tracker, Continuous Improvement)
- Custom user-created templates
- Templates include: backlogs with statuses, sample tasks, suggested sprints
- AI-assisted project creation from natural language
- Template usage tracking for popularity sorting

### Boards
- Custom boards per project representing task states
- Status columns: custom name, color, SCRUM role association
- Drag-and-drop task manipulation
- Board view shows all project boards in single view

### Backlog & Tree View
- List and tree representation of backlog
- Tree shows task hierarchy with dependencies
- Node colors represent task state
- Export to markdown for AI context

### Multi-Backlog Orchestration
- Create and manage multiple backlogs within a single project
- Backlog types: Development, QA/Testing, Strategic Planning, Custom
- Switch between backlogs via dedicated selector
- Each backlog maintains its own workflow zones (Dev Zone, QA Zone, PO Zone)
- Inter-backlog dependencies supported

### Inter-Backlog Automation
- AI-driven triggers that link backlogs
- Trigger types: Status change, Task creation, Task assignment, Comment added
- When a trigger fires, AI can automatically create linked tasks in another backlog
- Configurable per project by admin

### Sprint Management
- Create sprints with description, start/end dates
- Assign tasks, epics, user stories, subtasks to sprints
- View sprint in Kanban, Calendar, or Retrospective
- Run multiple sprints simultaneously for different sub-teams
- Sprint isolation: tasks from one sprint do not mix with another sprint's board

### Mini-Sprints
- Short-duration sprints (1-3 days) for tactical, time-sensitive work
- Types: Hotfix, Research, Polish, QA, Spike, Custom
- Lightweight creation with async setup (no full ceremony)
- Can run alongside regular sprints without capacity interference
- Optionally linked to parent regular sprint for context
- Quick Capture mode for rapidly adding tasks

### Daily Standups
- Scheduled in Calendar view
- Held in dedicated "Daily" voice channel
- Automatically transcribed for AI context
- AI generates state summary, detects stoppers, expected latencies

### Report Hub
- **Project Reports**: Persistent reports accessible from project menu
  - QA Audit: Testing coverage, defect density, test pass rates
  - Tech Debt Review: Code quality metrics, debt items, refactoring suggestions
  - Product Feedback: User feedback aggregation, sentiment analysis
- **Sprint Reports**: Created per sprint, conclude with sprint
  - Sprint Retrospective: Process reflection with AI insights
  - Sprint Summary: Velocity, completion rates, burndown
- Reports can spawn backlog items that directly affect the Product Backlog

### Workspaces (Visual Roadmap)
- Blank canvas for diagrams, sticky notes
- Bidirectional linking to backlog items
- Visual state sync: linked elements update when backlog items change
- Used as AI context for SCRUM planning

### Version Control (Backlog)
- Git-like snapshotting of backlog
- Revert to previous states
- View diffs between snapshots

### Statistics & Reports
- Sprint completion percentage
- Task counts by status
- Acceptance criteria completion rates
- AI-generated reports on delays, blockers

---

## User Roles & Permissions

ScrumHub supports 6 core SCRUM roles plus specialized Developer domains:

| Role | Description |
|------|-------------|
| **Product Owner** | Backlog-centric view, priority management, acceptance criteria interface |
| **Scrum Master** | Sprint facilitation, retrospective views, blocker management, AI-augmented facilitation |
| **Developer** | Task execution view; may specialize in Frontend, Backend, AI, or Feature development |
| **QA** | Merged role combining Quality Assurance and Testing workflows; acceptance criteria focus |
| **DevOps** | CI/CD pipeline view, deployment status, GitHub integration focus |
| **Tech Lead** | Overview dashboards, architecture views, code review tools |

**Admin Role** (separate from SCRUM roles):
- Created automatically when a user creates a project
- Permissions: Delete project, manage member permissions, invite users, manage project settings

For full role definitions, see **[TRUTH.md](./TRUTH.md)**.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Router & Query |
| Backend | Express (TypeScript), PostgreSQL, Supabase |
| AI | DeepSeek API |
| Real-time | WebSocket for chat and voice |

For detailed technical specifications, see **[TRUTH.md](./TRUTH.md)**.

---

## Feature Implementation Status

For detailed implementation documentation on each feature, see the **[features/](./features/)** folder. Each feature file contains:
- Feature overview and requirements
- Backend entities and database schema
- API endpoints specification
- Frontend views and UI components
- Implementation status (Planned / In Progress / Implemented)