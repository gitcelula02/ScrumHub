# UX.md — User Experience & Navigation

**This file owns:** Navigation flows, ActivityBar items, AI interactions, view behaviors.
**For styling:** See [STYLING.md](STYLING.md)
**For brand:** See [BRAND.md](./BRAND.md)
**Last updated:** 2026-05-15

---

## Global Layout

The interface is modeled after VS Code. All authenticated views live inside AppShell.

```
┌─────────────────────────────────────────────────────┐
│  TitleBar (ScrumHub logo, Command Palette, user)     │
├────┬────────────────────────────────────────────────┤
│    │  Tabs (Dashboard, Task #42, Epic #7...)         │
│ A  ├────────────────────────────────────────────────┤
│ c  │                                                 │
│ t  │  Main Content Area                              │
│ i  │  (child route via <Outlet />)                   │
│ v  │                                                 │
│ i  │                                                 │
│ t  │                                                 │
│ y  │                                                 │
│ B  │                                                 │
│ a  │                                                 │
│ r  │                                                 │
├────┴────────────────────────────────────────────────┤
│  StatusBar (branch, alerts, notifications bell, AI)  │
└─────────────────────────────────────────────────────┘
```

---

## ActivityBar Navigation

Vertical icon strip on the left, **never disappears**.

| Icon | View | Route Pattern | Project-Only |
|------|------|---------------|--------------|
| Home | Project Dashboard | `/app/projects/$projectId/dashboard` | Yes |
| FolderKanban | Projects list | `/app/projects` | No |
| ListTodo | Backlog | `/app/projects/$projectId/backlog` | Yes |
| Columns3 | Board (Kanban) | `/app/projects/$projectId/board` | Yes |
| Layers | Epics | `/app/projects/$projectId/epics` | Yes |
| Zap | Sprints | `/app/projects/$projectId/sprints` | Yes |
| Calendar | Calendar | `/app/projects/$projectId/calendar` | Yes |
| GitBranch | Quest Tree | `/app/projects/$projectId/quest-tree` | Yes |
| LayoutDashboard | Free Board | `/app/projects/$projectId/freeboard` | Yes |
| MessageSquare | Chat | `/app/projects/$projectId/chat` | Yes |
| Bot | AI Agent | `/app/projects/$projectId/ai` | Yes |
| BarChart3 | Reports | `/app/projects/$projectId/reports` | Yes |
| Shield | Settings | `/app/projects/$projectId/settings` | Yes |

**Active indicator:** Left border line in `--activity-bar-active` color.

---

## Backlog Selector

The **Backlog Selector** lives at the top of the Explorer sidebar when inside a project.

```
┌─────────────────────┐
│  Backlog: [▼]       │
│  ├─ All Backlogs    │
│  ├─ Development     │
│  ├─ QA/Testing      │
│  ├─ Strategic       │
│  └─ + New Backlog   │
└─────────────────────┘
```

| Scoped Views | Not Scoped |
|--------------|------------|
| Backlog Table | Overview/Dashboard |
| Board (Kanban) | Sprints |
| Epics | Free Board |
| Calendar | Chat |
| Quest Tree | Reports |
| AI Agent (toggleable) | Settings |

**Rules:**
- Changing backlog selector **immediately updates** all scoped views
- "All Backlogs" shows tasks from every backlog as unified list/board/tree
- Backlog-specific views show a tag badge on items indicating which backlog

---

## AI Interaction Patterns

Two modes, toggleable via switch in AI inputs:

### Mode 1: AI Fill (default)
User types → AI pre-fills form fields → user reviews/modifies → user clicks "Save"

### Mode 2: AI Auto
User types → AI fills AND auto-submits → creates everything end-to-end

---

## Global AI Elements

1. **Command Palette** (Ctrl+Shift+P) — Quick commands including AI:
   - "Create task with AI..."
   - "Summarize current view"
   - "Generate sprint report"

2. **AINotifications** — Bell icon in ActivityBar:
   - "I noticed 3 tasks are overdue"
   - "QA backlog has 10 untested items"

3. **AI Input Bar** — Every view has context-aware AI input

---

## View Routes & Behaviors

### Landing (`/`)
Public entry point for unauthenticated users.

### Login (`/login`)
Authenticate existing users. Redirects to `/app/projects` on success.

### Register (`/register`)
Create new account. Redirects to `/app/projects` on success.

### Projects List (`/app/projects`)
VS Code Explorer pattern. Personal folder tree, projects, pinned section.

### Project Dashboard (`/app/projects/$projectId/dashboard`)
Modular dashboard with reorderable sections. Entry point after project creation.

### Backlog (`/app/projects/$projectId/backlog`)
Table + tree representation. View toggle (Table/Tree). Filters, bulk actions.

### Board (`/app/projects/$projectId/board`)
Kanban with drag-and-drop. Phantom parent pattern for differing subtask statuses.

### Sprints (`/app/projects/$projectId/sprints`)
Sprint list, active sprint panel, mini-sprints section. Simultaneous sprints supported.

### Calendar (`/app/projects/$projectId/calendar`)
Month/Week/Day toggle. Sprint bars, task due dates, standup scheduling.

### Quest Tree (`/app/projects/$projectId/quest-tree`)
Game-like hierarchical tree. Priority = border color, State = background color.

### Chat (`/app/projects/$projectId/chat`)
Discord-like with text/voice channels. "Daily" channel for standups (always transcribed).

### Reports (`/app/projects/$projectId/reports`)
Sprint Reports (bound to sprint) and Project Reports (persistent).

### Settings (`/app/projects/$projectId/settings`)
Tabs: General, Members, Roles, Backlogs, Statuses, AI Settings, API Keys.

### Task Detail (`/app/projects/$projectId/tasks/$taskId`)
Opens as a tab. Title, description, metadata, acceptance criteria, subtasks, comments.

---

## Cross-View Data Flow

```
         Settings
            │
            ▼
┌──────────┐     ┌──────────────────┐     ┌───────────┐
│  Chat    │◄───►│  AI Agent (RAG)  │◄───►│  Reports  │
│  (voice) │     │                  │     │           │
└────┬─────┘     └────────┬─────────┘     └─────┬─────┘
     │                    │                    │
     ▼                    ▼                    ▼
┌──────────────────────────────────────────────┐
│              Backlog Selector                 │
│  All / Development / QA / Strategic / Custom  │
└────────┬──────────┬──────────┬────────────────┘
         │          │          │
         ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │Backlog │ │ Board  │ │ Epics  │
   └────────┘ └────────┘ └────────┘
         │          │          │
         └──────────┴──────────┘
                    │
                    ▼
            ┌──────────────┐
            │ Task Detail  │
            │     (Tab)    │
            └──────────────┘
                    │
         ┌─────────┴─────────┐
         ▼                   ▼
   ┌──────────┐       ┌──────────┐
   │ Sprints  │       │Quest Tree│
   └──────────┘       └──────────┘
```

---

## Empty States

| View | Message | Action |
|------|---------|--------|
| Projects | "No projects yet" | New Project button + AI input |
| Backlog | "This backlog is empty" | + New Task + AI input |
| Board | Shows empty columns | + New Task on column |
| Epics | "No epics yet" | + New Epic + AI input |
| Sprints | "No sprints yet" | + New Sprint + AI input |
| Calendar | "No calendar data" | + New Sprint |
| Quest Tree | "No tasks yet" | Go to Backlog |
| Chat | "No messages yet" | Send first message |
| Reports | "No reports yet" | + New Report |

---

## Error Handling

Every view must handle:
- **Loading state:** Skeleton/spinner while fetching
- **Error state:** Message + retry button
- **Empty state:** Descriptive message + action button

---

## Shell Components

### TitleBar
- Left: ScrumHub logo
- Center: Command palette trigger (Ctrl+Shift+P)
- Right: Notifications, Settings, User profile

### Explorer
- Context-sensitive sidebar
- No project selected: personal folder tree
- Project selected: Backlog Selector + context content
- Collapsible via toggle

### Tabs
- Dashboard always open, cannot close
- Task/Epic detail opens as tab
- Can be closed (except Dashboard)

### StatusBar
- Left: Git branch, alert count
- Right: Notifications bell, AI status