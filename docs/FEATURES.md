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

---

## Application Purpose

ScrumHub is a SCRUM project management tool that replaces tools like Jira and GitHub Projects.

**Core Philosophy:** All-in-one workspace where AI assists with planning, execution, and retrospectives.

---

## Features Overview

### Core Management

**Project Management**
- Create and manage multiple Scrum projects
- Each project has: name, description (markdown), color, status, members, custom sections
- Project members have SCRUM roles and admin permissions

**Task Management (Epic, User Story, Task, Subtask)**
- Single unified entity with `type` field distinguishing them
- All have: title, description, priority, status, assignees (multiple), due date, comments, attachments, acceptance criteria, dependencies
- Subtasks are tasks nested inside other tasks (recursive, no limit)
- Tasks support multi-assignee with cascade rule (parent assignees cascade to subtasks by default)

**Sprints**
- Group tasks into time-boxed sprints
- Sprint views: Kanban board, Calendar, Retrospectives
- Default view is current sprint, filterable to specific sprint or complete backlog

**Backlog**
- Complete backlog contains all tasks regardless of sprint
- Tasks can exist outside sprints (backlog-only)
- Sprint view shows tasks grouped by sprint

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

### Sprint Management
- Create sprints with description, start/end dates
- Assign tasks, epics, user stories, subtasks to sprints
- View sprint in Kanban, Calendar, or Retrospective

### Daily Standups
- Scheduled in Calendar view
- Held in dedicated "Daily" voice channel
- Automatically transcribed for AI context
- AI generates state summary, detects stoppers, expected latencies

### Workspaces (Future)
- Blank canvas for diagrams, sticky notes
- Similar to Miro/Whimsical
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

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Router & Query |
| Backend | Express (TypeScript), PostgreSQL, Supabase |
| AI | DeepSeek API |
| Real-time | WebSocket for chat and voice |

For detailed technical specifications, see **[TRUTH.md](./TRUTH.md)**.