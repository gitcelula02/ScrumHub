# ScrumHub UX

Complete user experience specification for ScrumHub — a VS Code-inspired, AI-augmented SCRUM project management tool.
Every view, component, modal, and interaction pattern is documented here so AI models can generate accurate frontend code.

---

## Design Principles

- **Familiar landing page** — users immediately understand what the product does.
- **All navigation visible** — the ActivityBar (VS Code-style) never disappears. Every major view is one click away.
- **Modular interface** — panels can be hidden, shown, resized, and reorganized.
- **Responsive** — mobile and desktop adaptive. Layout collapses gracefully.
- **Accessible** — unregistered users see only docs/landing. Registered users access the app.
- **Customizable** — font size, color scheme (dark/light), layout (panel positions).
- **Every interactive element has a title attribute** — buttons, inputs, selects, icons, tooltips, modals, tables, charts, links. No exceptions.
- **AI-augmented everything** — every view has an AI input. AI fills forms (user confirms) or auto-creates (user toggles mode).

---

## Global Layout Architecture

The interface is modeled after VS Code. Every authenticated view lives inside the AppShell.

```
┌─────────────────────────────────────────────────────┐
│  TitleBar (ScrumHub logo, Command Palette, user)     │
├────┬────────────────────────────────────────────────┤
│    │  Tabs (Dashboard, Task #42, Epic #7...)         │
│ A  ├────────────────────────────────────────────────┤
│ c  │                                                 │
│ t  │  Main Content Area                             │
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

### Shell Components

#### TitleBar (`src/components/layout/TitleBar.tsx`)
- **Left**: ScrumHub logo + brand name
- **Center**: Global search / command palette trigger ("ScrumHub — buscar tareas, ejecutar comandos IA…")
- **Right**: App version, user avatar with initials
- **Always visible** in all authenticated views.

#### ActivityBar (`src/components/layout/ActivityBar.tsx`)
- Vertical icon strip on the left, **never disappears**.
- Icons switch the main view. Active view has a left border indicator.
- Bottom section: Export PDF (download icon), AINotifications (bell with badge), Settings (gear).

| Icon | View | Route Pattern | Project-Only |
|------|------|---------------|--------------|
| FolderKanban | Projects list | `/app/projects` | No |
| ListTodo | Backlog | `/app/projects/$projectId/backlog` | Yes |
| Columns3 (new) | Board (Kanban) | `/app/projects/$projectId/board` | Yes |
| Layers | Epics | `/app/projects/$projectId/epics` | Yes |
| Zap | Sprints | `/app/projects/$projectId/sprints` | Yes |
| Calendar (new) | Calendar | `/app/projects/$projectId/calendar` | Yes |
| GitBranch | Quest Tree | `/app/projects/$projectId/quest-tree` | Yes |
| LayoutDashboard (new) | Free Board | `/app/projects/$projectId/freeboard` | Yes |
| MessageSquare (new) | Chat | `/app/projects/$projectId/chat` | Yes |
| Bot (new) | AI Agent | `/app/projects/$projectId/ai` | Yes |
| BarChart3 (new) | Reports | `/app/projects/$projectId/reports` | Yes |
| Shield | Settings (Permissions) | `/app/projects/$projectId/settings` | Yes |

#### Explorer Sidebar (`src/features/workspace/components/Explorer.tsx`)
- Context-sensitive side panel.
- When **no project is selected**: Shows the personal folder/project tree (VS Code file explorer).
- When **a project is selected**: Shows the **Backlog Selector** at top, then context-sensitive content (project files, task tree, sprint list, etc.).
- Collapsible via toggle in TitleBar or ActivityBar.
- **Persistent state** — panel widths and visibility stored in localStorage.

#### Tabs (`src/features/workspace/components/Tabs.tsx`)
- VS Code-style tab bar below TitleBar.
- "Dashboard" tab is always present and cannot be closed.
- Task/Epic detail views open as new tabs (e.g., "Task #42", "Epic #7").
- Tabs can be closed (except Dashboard), reordered (future).
- Active tab highlights the corresponding main content.

#### StatusBar (`src/components/layout/StatusBar.tsx`)
- Bottom bar, always visible.
- Left: Git branch name, alert count.
- Right: Notifications bell icon, palette shortcut hint, AI status indicator.

### Backlog Scope System

The **Backlog Selector** lives at the top of the Explorer sidebar when inside a project.

```
┌─────────────────────┐
│  Backlog: [▼]       │  ← Dropdown at top of Explorer
│  ├─ All Backlogs    │     ("All" = unified view of all backlogs)
│  ├─ Development     │
│  ├─ QA/Testing      │
│  ├─ Strategic       │
│  └─ + New Backlog   │     → Opens Create Backlog modal
└─────────┬───────────┘
          │ filters
          ▼
    Scoped views change content:
    ┌─────────────────────────────────────┐
    │ Backlog Table  │ only this backlog  │
    │ Board (Kanban) │ only this backlog  │
    │ Epics          │ only this backlog  │
    │ Calendar       │ only this backlog  │
    │ Quest Tree     │ only this backlog  │
    │ AI Agent       │ toggleable scope   │
    └─────────────────────────────────────┘

    NOT scoped (show everything):
    ┌─────────────────────────────────────┐
    │ Overview/Dashboard  │ project-wide  │
    │ Sprints             │ cross-backlog │
    │ Free Board          │ cross-backlog │
    │ Chat                │ per-channel   │
    │ Reports             │ project-wide  │
    │ Settings            │ project-wide  │
    └─────────────────────────────────────┘
```

**Rules:**
- Changing the backlog selector **immediately updates** all scoped views.
- "All Backlogs" shows tasks from every backlog as a unified list/board/tree.
- Backlog-specific views show a tag/badge on items indicating which backlog they belong to.
- The backlog selector is **disabled** (hidden) when no project is selected.

### AI Interaction Patterns

Two modes, toggleable via a small switch in any AI input:

#### Mode 1: AI Fill (default)
User types a natural language command → AI pre-fills all form fields in the UI → user reviews/modifies → user clicks "Save"/"Create".

Example flow:
```
User: "Create a project called SprintMaster with 3 dev epics and 1 QA backlog"

  ↓ AI fills fields in the form (but does NOT submit):

  ┌────────────────────────────────────────────┐
  │  Project Name: [SprintMaster           ]   │
  │  Description: [A project for managing...]   │
  │  Epics:                                     │
  │  ├─ [Backend API] [Frontend UI] [DevOps]    │
  │  Backlogs: [Development ✓] [QA ✓]           │
  │                                             │
  │  [✗ Cancel]  [✓ Accept & Save]              │
  └────────────────────────────────────────────┘

  User tweaks fields, then clicks Save.
```

#### Mode 2: AI Auto
User types a command → AI fills fields AND auto-submits → creates everything end-to-end (project, epics, tasks, roles, backlogs) in one action.

Toggle switch is present in:
- The global command palette
- Every AI input bar on form views
- The AI Agent view

### Global AI Elements (present in all views)

1. **Command Palette** (Ctrl+Shift+P) — VS Code-style quick command menu. Includes AI commands:
   - "Create task with AI..."
   - "Summarize current view"
   - "Generate sprint report"
   - "Ask AI anything..."

2. **AINotifications Panel** — Bell icon in ActivityBar. Shows proactive AI suggestions.
   - "I noticed 3 tasks are overdue. Want me to reschedule them?"
   - "The QA backlog has 10 untested items. Start a QA Mini-Sprint?"
   - "Sprint velocity dropped 20%. Analyze?"

3. **AI Input Bar** — Every view has a context-aware AI input. It knows what view it's on:
   - Backlog view AI = backlog refinement
   - Board view AI = card suggestions
   - Calendar AI = scheduling help
   - Global AI = general-purpose

---

## View-by-View Breakdown

### View Legend

Each view is documented with:
- **Route**: The URL path
- **ActivityBar**: Which icon activates it
- **Backlog Scope**: Whether the backlog selector filters this view
- **AI Mode**: Which AI capabilities are present
- **Elements**: All UI components on the page
- **Sub-views**: Tabs/navigation inside the view
- **Overlays**: Modals triggered from this view
- **Relationships**: How this view connects to others
- **Empty State**: What shows when there's no data
- **Error State**: What shows when data fails to load

---

### 1. Landing Page

| Field | Value |
|-------|-------|
| **Route** | `/` |
| **ActivityBar** | N/A (external) |
| **Backlog Scope** | N/A |
| **Auth Required** | No |

**Purpose**: Public entry point for unauthenticated users. Designed for conversion.

**Elements:**
- **Navigation Bar**: Logo, "Home", "Docs", "Blog", "Sign Up" button, "Login" button.
- **Hero Section**: Main value proposition headline + sub-headline.
- **Primary CTA**: "Get started for free" button → redirects to `/register`.
- **AI Preview Component**: Embedded demo of AI-assisted backlog creation. A mock interaction showing "AI: Create a project with..." → "ScrumHub: Here's your backlog".

**AI Integration**: The AI Preview is a static demo/mockup. No live AI.

**Relationships**: Links to `/login` and `/register`.

---

### 2. Login

| Field | Value |
|-------|-------|
| **Route** | `/login` |
| **ActivityBar** | N/A (external) |
| **Backlog Scope** | N/A |
| **Auth Required** | No |

**Purpose**: Authenticate existing users.

**Elements:**
- **Brand Header**: ScrumHub logo.
- **Input Fields**: Email, Password.
- **Actions**: "Login" button. "Don't have an account? Sign up" link.
- **Error State**: Invalid credentials message, field-level validation errors.
- **Redirect**: After login, redirects to `/app/projects` (or the page the user was trying to access).

**Relationships**: Links to `/register`. On success → `/app/projects`.

---

### 3. Register

| Field | Value |
|-------|-------|
| **Route** | `/register` |
| **ActivityBar** | N/A (external) |
| **Backlog Scope** | N/A |
| **Auth Required** | No |

**Purpose**: Create a new account.

**Elements:**
- **Brand Header**: ScrumHub logo.
- **Input Fields**: Name, Email, Password, Confirm Password.
- **Actions**: "Create account" button. "Already have an account? Login" link.
- **Error State**: Duplicate email, password mismatch, weak password.

**Relationships**: Links to `/login`. On success → `/app/projects`.

---

### 4. Projects List

| Field | Value |
|-------|-------|
| **Route** | `/app/projects` |
| **ActivityBar** | FolderKanban (Projects) |
| **Backlog Scope** | N/A (no project selected) |
| **Auth Required** | Yes |

**Purpose**: Browse, create, and organize all projects. Uses VS Code Explorer for folder-based organization.

**Elements:**
- **Explorer Sidebar** (visible): Personal folder tree. Each folder can contain projects. Root level shows uncategorized projects.
- **Main Content**: Welcome/landing content when no project is selected. "Select a project from the sidebar or create a new one."
- **Creation Action**: "New Project" button → `/app/projects/create`.
- **Folder Management**: Right-click context menu on folders → "New Folder", "Rename", "Delete".
- **Pin System**: Projects can be pinned. Pinned projects appear at the top of the tree.
- **AI Project Creation**: AI input in the command palette → "Create a project called X with..." → fills creation form.

**Empty State**: "No projects yet. Create your first project to get started!" + AI input.

**Overlays:**
- Folder Creation (modal)
- Project Quick-Create (modal, simple name + description)
- Command Palette (Ctrl+Shift+P)

**Relationships**: Clicking a project → navigates to `/app/projects/$projectId/dashboard`.

---

### 5. Project Creation

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/create` |
| **ActivityBar** | FolderKanban (Projects) |
| **Backlog Scope** | N/A |
| **Auth Required** | Yes |

**Purpose**: Full-page project creation with AI-assisted setup.

**Elements:**
- **Header**: "Create New Project" with breadcrumb.
- **Project Form**: Name, Description (markdown), Goal, Icon (emoji picker), Color (color picker).
- **Template Selector**: Optional — pick from system templates or user-created templates.
- **Backlog Configuration**: Pre-configure backlogs (Development, QA, Strategic, Custom).
- **Members Section**: Invite team members by email, assign SCRUM roles.
- **AI Integration**:
  - **AI Input Bar**: "Describe your project and I'll set it up..."
  - **AI Fill** (default): Fills form fields, user reviews.
  - **AI Auto** (toggle): Creates everything in one click.
  - AI can also create initial epics, stories, tasks, and sprint suggestions.

**Actions:** "Create Project" button, "Create with AI" (auto-mode button).

**Empty State**: Not applicable (creation form is always fresh).

**Relationships**: On success → `/app/projects/$projectId/dashboard`.

---

### 6. Overview / Project Dashboard

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/dashboard` |
| **ActivityBar** | Overview (new icon needed) |
| **Backlog Scope** | No (project-wide) |
| **Auth Required** | Yes |

**Purpose**: IDE-inspired project landing page. Modular dashboard with reorderable sections.

**Elements:**
- **Project Header**: Editable icon, name, description (markdown).
- **Metadata Pills**: Git branch, active sprints count, AI cost (in dollars), member count.
- **Summary Metrics Grid**: Backlogs count, tasks total, completion %, unread messages, reports count, members count.
- **Members Section**: List of team members with editable role dropdowns.
- **Custom Sections System**: Each section is a card with markdown content. Sections can be added, removed, reordered, collapsed.
  - Available widgets: AI Insights, Sprint Health, Activity Feed, Burndown Chart, Member Velocity.
- **AI Integration**:
  - AI Insights panel (widget): AI-generated summary of project health.
  - AI Input Bar: "Summarize project status", "What needs attention?"

**Sub-views**: (None — this is the landing view for a project)

**Overlays:**
- Task Detail (opens as a new tab)
- Epic Detail (opens as a new tab)
- Sprint Quick-View (modal)
- Report Creation (modal)

**Empty State**: All metrics show 0. "Set up your project by creating backlogs and epics."

**Relationships**: Entry point after project creation. Links to all other project views via ActivityBar.

---

### 7. Backlog

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/backlog` |
| **ActivityBar** | ListTodo (Backlog) |
| **Backlog Scope** | **Yes** — filtered by backlog selector |
| **Auth Required** | Yes |

**Purpose**: Main task management view. Table + tree representation of backlog items. Create, edit, organize, and prioritize tasks.

**Elements:**
- **View Toggle**: "Table" / "Tree" tabs at top of content area.
  - **Table View**: Sortable columns — Title, Type, Priority, Status, Assignee, Sprint, Due Date.
  - **Tree View**: Hierarchical tree showing parent-child relationships (Epic > Story > Task > Subtask). Indentation shows depth.
- **Filters Bar**: Filter by status, priority, assignee, type (epic/story/task), sprint.
- **Search**: Quick text search within the visible backlog.
- **Bulk Actions**: Select multiple items → batch status change, assign, move to sprint, delete.
- **Backlog Badge**: Each item shows a small colored badge indicating which backlog it belongs to (when "All Backlogs" is selected).
- **Actions**: "+ New Task" button. "+ New Epic" button.
- **AI Integration**:
  - **AI Backlog Refiner Input**: "Suggest priority reordering", "Find gaps in coverage", "Generate acceptance criteria for X".
  - AI Fill mode: Type "Create 5 tasks for the login feature" → AI fills form fields for each task.
  - AI Auto mode: Direct creation.

**Overlays:**
- Task Creation (modal) — with AI fill/auto.
- Epic Creation (modal).
- Task Detail (opens as tab).
- Epic Detail (opens as tab).
- Bulk Edit (modal).

**Empty State**: "This backlog is empty. Create your first task or ask AI to generate suggestions."

**Error State**: "Failed to load backlog. Retry" + retry button.

**Relationships**:
- Task Detail opens as a tab (stays open when switching views).
- Backlog selector in Explorer sidebar controls which backlogs appear.
- Board view shows the same tasks as cards in columns.
- Epics view shows the epic hierarchy.

---

### 8. Board (Kanban)

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/board` |
| **ActivityBar** | Columns3 (new icon) |
| **Backlog Scope** | **Optional** — can be backlog-specific or general (toggle) |
| **Auth Required** | Yes |

**Purpose**: Visual Kanban board with drag-and-drop task movement across status columns.

**Elements:**
- **Columns**: Status columns (To Do, In Progress, Testing, Done). Each column shows tasks cards.
  - Column header: Status name + color (from entity themes) + task count.
  - Columns can be backlog-specific (only show tasks from selected backlog) or general (show all project tasks).
- **Task Cards**: Title, priority icon, assignee avatars, due date badge.
  - Collapsible subtask list under parent cards.
  - Phantom Parent pattern: When subtask status differs from parent, it appears as a separate card.
- **Drag-and-Drop**: Move cards between columns. Parent moves cascade status to subtasks.
- **Filters**: Filter by assignee, sprint, priority, backlog.
- **Actions**: "+ New Column" (create status), "+ New Task" button.
- **AI Integration**:
  - AI Input: "Suggest optimal column arrangement", "Move all high-priority tasks to In Progress", "Identify blocked items".
  - AI can auto-assign cards to columns based on rules.

**Overlays:**
- Status/Column Creation (modal): Name, color, associated SCRUM role.
- Task Detail (opens as tab).
- Task Quick-Create (modal).

**Empty State**: Shows empty columns. "Drag tasks here from the backlog or create new ones."

**Relationships**: Same tasks as Backlog view, just displayed as cards in columns. Status changes here reflect in Backlog.

---

### 9. Epics

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/epics` |
| **ActivityBar** | Layers (Epics) |
| **Backlog Scope** | **Yes** — filtered by backlog selector |
| **Auth Required** | Yes |

**Purpose**: Manage the epic hierarchy. Create, organize, and track large bodies of work.

**Elements:**
- **Epic List**: Hierarchical list of epics. Each epic shows: title, progress bar (% of stories/tasks completed), priority, assignee, due date.
- **Epic Detail** (opens as tab): Full epic view.
  - Header: Epic name, description (markdown), color theme.
  - Child Stories/Tasks list (nested).
  - Progress indicator.
  - Comments section.
  - "Add Story" / "Add Task" buttons.
- **Actions**: "+ New Epic" button.
- **AI Integration**:
  - AI Input: "Break down this epic into stories", "Generate tasks for epic X", "Suggest epic prioritization".
  - AI Fill: Type "Create epic for user auth with 5 stories" → fills epic + stories fields.
  - AI Auto: Creates epic + all children.

**Overlays:**
- Epic Creation (modal).
- Story Creation (modal).
- Story/Task Detail (opens as tab).

**Empty State**: "No epics yet. Create an epic to organize your work."

**Relationships**: Epics are type:epic tasks that appear in Backlog view too. Changes here reflect in Backlog.

---

### 10. Sprints (including Mini-Sprints)

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/sprints` |
| **ActivityBar** | Zap (Sprints) |
| **Backlog Scope** | No (cross-backlog — sprints can contain tasks from any backlog) |
| **Auth Required** | Yes |

**Purpose**: Manage regular sprints and mini-sprints. Create, activate, complete sprints. Assign tasks.

**Elements:**
- **Sprint List**: Shows all sprints with status (Planning/Active/Completed/Cancelled), dates, progress.
- **Active Sprint Panel**: Large focus on the currently active sprint(s). Shows burndown, task list, progress.
- **Simultaneous Sprints**: Multiple active sprints shown as separate panels/cards. Each tagged with team_tag (e.g., "Frontend", "Backend").
- **Mini-Sprints Section**: Separate section for short (1-3 day) tactical sprints. Types: Hotfix, Research, Polish, QA, Spike, Custom.
  - Mini-sprints have a lightning bolt indicator.
  - Quick Capture mode: Rapidly add tasks to a mini-sprint.
- **Sprint Detail**: Name, description, goal, dates, task list, team tag, progress.
- **Actions**: "+ New Sprint", "+ New Mini-Sprint" buttons.
- **AI Integration**:
  - AI Input: "Plan the next sprint based on backlog priority", "Suggest sprint goal", "Optimize sprint scope".
  - AI Sprint Planning: Suggest tasks for the sprint based on velocity and priority.
  - AI Auto: Creates sprint with tasks already assigned.

**Overlays:**
- Sprint Creation (modal): Name, description, goal, start/end dates, team tag, task selector.
- Mini-Sprint Creation (modal): Name, type, goal, dates (max 3 days), task selector.
- Quick Capture (lightweight modal for mini-sprints).
- Sprint Report Creation (modal).
- Task Detail (opens as tab).

**Empty State**: "No sprints yet. Create your first sprint to start organizing work into time-boxed iterations."

**Relationships**: Sprints pull tasks from all backlogs. Sprint completion triggers report creation. Active sprints show in Overview dashboard.

---

### 11. Calendar

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/calendar` |
| **ActivityBar** | Calendar (new icon) |
| **Backlog Scope** | **Yes** — filtered by backlog selector |
| **Auth Required** | Yes |

**Purpose**: Timeline view of sprints, tasks, epics, and daily standups.

**Elements:**
- **Calendar Grid**: Month/Week/Day toggle. Shows:
  - Sprint bars (colored, spanning start→end dates).
  - Task due dates (dots/cards on dates).
  - Epic milestones (diamond markers).
  - Daily standup icons (on scheduled days).
- **Daily Standup Scheduling**: Click a date → schedule or join a standup.
  - Standups occur in the "Daily" voice channel.
  - AI transcription is automatic.
  - AI generates state summary, detects stoppers, expected latencies.
- **Filter Toggle**: Show/hide task types, sprints, standups.
- **AI Integration**:
  - AI Input: "Reschedule overdue tasks to next week", "Suggest optimal sprint dates", "Find scheduling conflicts".
  - AI Auto: Adjust dates across tasks/sprints.

**Overlays:**
- Task Detail (opens as tab).
- Sprint Quick-Edit (modal).
- Daily Standup Panel (modal/side panel).

**Empty State**: "No calendar data. Create sprints and tasks to see them on the timeline."

**Relationships**: Connected to Sprints, Backlog, and Chat (standup links to Daily channel).

---

### 12. Quest Tree

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/quest-tree` |
| **ActivityBar** | GitBranch (new icon) |
| **Backlog Scope** | **Yes** — filtered by backlog selector |
| **Auth Required** | Yes |

**Purpose**: Game-like hierarchical tree visualization of tasks. Helps users see the "quest" structure of their work.

**Elements:**
- **Interactive Tree**: Force-directed or hierarchical layout.
  - Node = task. Priority → border color. Status → background color.
  - User's incomplete tasks have a visible shadow/glow effect.
  - Red dot notification for urgency (high priority + close to due).
- **Zoom/Pan**: Free navigation. Zoom in/out buttons.
- **Click Interaction**: Click a node → opens task detail (tab).
- **Visual Legend**: Shows what colors mean (priority, status).
- **AI Integration**:
  - AI Input: "Highlight blocked tasks", "Show critical path", "Find bottlenecks".

**Overlays:**
- Task Detail (opens as tab).

**Empty State**: "No tasks yet. Create tasks to see them in the quest tree."

**Relationships**: Same task data as Backlog view. Task changes here reflect everywhere.

---

### 13. Free Board (Visual Roadmap)

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/freeboard` |
| **ActivityBar** | LayoutDashboard (new icon) |
| **Backlog Scope** | No (cross-backlog — visual canvas) |
| **Auth Required** | Yes |

**Purpose**: Visual canvas for diagrams, schemes, and roadmaps. Similar to Miro/Whimsical. Bidirectionally linked to backlog items.

**Elements:**
- **Canvas**: Infinite scroll/zoom canvas.
  - Grid background (toggleable). Snap-to-grid option.
- **Element Types**:
  - Shapes: Rectangle, Circle, Arrow, Connector.
  - Text: Labels, sticky notes.
  - Images: Upload or paste.
  - Task Cards: Drag a task from sidebar → creates a linked element that reflects task state.
- **Backlink System**: Canvas elements can be linked to backlog tasks.
  - Linked elements change appearance when task state changes (e.g., border turns green when "Done").
  - Right-click element → "Link to task" → search and select task.
  - Elements show a small linked-chain icon.
- **Layers Panel**: Z-order management. Lock/unlock elements.
- **Multi-Canvas**: Tab bar for multiple canvases within a project.
- **AI Integration**:
  - AI Input: "Generate a system architecture diagram", "Create a roadmap based on current epics", "Turn this discussion into a diagram".
  - AI Auto: Generates canvas elements directly.

**Overlays:**
- Canvas Element Edit (side panel).
- Task Link Search (modal).

**Empty State**: "Start with a blank canvas or ask AI to generate a diagram."

**Relationships**: Task state changes in Backlog/Board update linked canvas elements in real-time. Canvas is part of AI context for planning.

---

### 14. Chat

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/chat` |
| **ActivityBar** | MessageSquare (new icon) |
| **Backlog Scope** | No (per-channel — channels can optionally be associated with a backlog) |
| **Auth Required** | Yes |

**Purpose**: Discord-like communication hub. Text + voice channels. Team collaboration + AI integration.

**Elements:**
- **Channel Sidebar**: List of channels grouped by category.
  - Default channels: "General", "Daily" (for standups).
  - Backlog-specific channels: "Dev-Backlog", "QA-Backlog" (optionally linked to a backlog).
  - Voice channels have a speaker icon.
  - Unread message badge per channel.
- **Message Area**: Main chat area.
  - Messages support markdown rendering.
  - Message actions: Edit, Delete, Reply, "Create Task" (convert message to task).
  - AI messages are highlighted differently.
- **Message Input**: Rich text with markdown support, file upload, emoji picker.
  - AI Input button: Ask AI for suggestions, summaries, or task creation from conversation.
- **Voice/Video**: Join voice channel → WebRTC call.
  - AI transcription on-demand.
  - "Transcribe & Create Task" feature.
- **AI Integration**:
  - AI Chat Assistant: Present in every channel. Type "/ai" or mention @AI.
  - AI can create tasks from conversation: "Create a task from this discussion" → AI extracts details.
  - AI transcription of voice calls → creates action items.
  - AI can summarize unread messages.

**Sub-views:**
- Chat Session (`/app/projects/$projectId/chat/$sessionId`): Persistent chat thread/message detail.

**Overlays:**
- Task Creation from Message (modal).
- Voice Call Controls (in-call UI).
- AI Transcription Panel.

**Empty State**: "No messages yet. Start the conversation!"

**Relationships**: AI chat context feeds into project AI context (RAG). "Create Task" from message creates tasks in the linked backlog. Daily standups here → Calendar view.

---

### 15. AI Agent

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/ai` |
| **ActivityBar** | Bot (new icon) |
| **Backlog Scope** | Toggleable — per-backlog or project-wide |
| **Auth Required** | Yes |

**Purpose**: Full AI agent interface. Proactive backlog refiner, automation manager, and conversation hub.

**Elements:**
- **Agent Status**: Online/Idle/Processing indicator. Model selector (DeepSeek, OpenAI, etc.).
- **Session List**: Sidebar with past AI conversations (scoped to project or backlog).
- **Chat Area**: Full conversation with AI.
  - AI responses can include rich content: task suggestions, report previews, diagram generation.
  - AI proactive notifications: "I noticed the QA backlog has 10 untested items. Start a Mini-Sprint?"
- **Backlog Scope Toggle**: Switch between "Project-wide" and "Current Backlog" context.
  - Project-wide: AI sees all project data.
  - Backlog-scoped: AI only sees data from the selected backlog.
- **Inter-Backlog Automation Panel**: Manage AI-driven triggers between backlogs.
  - List of active triggers.
  - Create trigger: "When status changes to Testing in Dev Backlog → Create task in QA Backlog".
  - Trigger history log.
- **Capability Cards**: Visual cards showing what AI can do:
  - "Backlog Refinement", "Sprint Planning", "Report Generation", "Task Analysis", "Code Review", "Team Insights".
- **Settings**: Prompt customization, tone, personality, model, temperature.
- **AI Integration**: This IS the AI view. Everything here is AI.

**Overlays:**
- Trigger Creation (modal).
- AI Settings (modal).
- Prompt Editor (modal).

**Empty State**: "Start a conversation with ScrumHub AI. Ask me anything about your project."

**Relationships**: AI context spans all project data. Changes made by AI (tasks, reports) reflect in all other views. AI agent state is shared with AINotifications panel.

---

### 16. Reports

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/reports` |
| **ActivityBar** | BarChart3 (new icon) |
| **Backlog Scope** | No (project-wide) |
| **Auth Required** | Yes |

**Purpose**: Report hub for all project-wide and sprint-bound reports.

**Elements:**
- **Report Type Tabs**: "Sprint Reports" / "Project Reports".
- **Sprint Reports** (bound to sprint lifecycle):
  - Sprint Retrospective: Customizable sections (what went well, improvements, action items). AI-assisted.
  - Sprint Summary: Velocity, completion rates, burndown chart.
  - Reports conclude when the sprint ends (archived in history).
- **Project Reports** (persistent, cross-sprint):
  - QA Audit: Testing coverage, defect density, test pass rates.
  - Tech Debt Review: Code quality metrics, debt items.
  - Product Feedback: User feedback aggregation, sentiment analysis.
  - Custom Reports.
- **Report Detail**: Title, description, sections, AI insights, export options (PDF, Markdown).
- **Spawn Backlog Items**: Reports can generate suggested backlog items. Approved items become real tasks.
- **AI Integration**:
  - AI Input: "Generate a sprint retrospective", "Create a QA audit report", "Summarize project health".
  - AI Auto: Full report generation with AI analysis.
  - AI Insights: Auto-generated insights attached to each report.

**Overlays:**
- Report Creation (modal): Type selection, title, scope.
- Report Backlog Item Review (modal): Review suggested items before approving.

**Empty State**: "No reports yet. Generate your first report with AI or create one manually."

**Relationships**: Sprint Reports are connected to a specific sprint. Project Reports are connected to the project. Both can spawn tasks in backlogs.

---

### 17. Settings

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/settings` |
| **ActivityBar** | Shield (Settings) |
| **Backlog Scope** | No (project-wide) |
| **Auth Required** | Yes |

**Purpose**: Project configuration, member management, roles, permissions, API keys.

**Elements:**
- **Tabs or Sidebar**:
  - **General**: Project name, description, icon, color, status (active/archived/completed).
  - **Members**: List of project members. Each row: name, SCRUM role, admin toggle, remove button. Invite new members.
  - **Roles & Permissions**: Matrix of roles → permissions. Edit what each SCRUM role can do.
  - **Backlogs**: Manage project backlogs (create, edit, reorder, set default, archive).
  - **Statuses**: Manage Kanban board columns (create, edit name/color/role association, reorder).
  - **AI Settings**: Per-project AI configuration (model, temperature, tone, system prompt, enabled agents).
  - **API Keys**: Manage API key vault (add/remove/alias keys, share settings).
  - **Notifications**: Configure notification preferences per project.
- **AI Integration**:
  - AI Input: "Suggest optimal role assignments", "Recommend status workflow".

**Overlays:**
- Member Invite (modal).
- Backlog Create/Edit (modal).
- Status Create/Edit (modal).
- API Key Add (modal).
- Role Editor (modal).

**Empty State**: Shows default configuration for a new project.

**Relationships**: Settings changes affect all views. Backlog settings affect backlog selector. Status settings affect Board view.

---

### 18. Task Detail

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/tasks/$taskId` |
| **ActivityBar** | N/A (opens as tab from any view) |
| **Backlog Scope** | Inherits from parent view |
| **Auth Required** | Yes |

**Purpose**: Full task detail view. Opens as a tab in the tab bar (not a new page navigation).

**Elements:**
- **Header**: Task ID, type badge (Epic/Story/Task), priority badge.
- **Title**: Editable task title.
- **Description**: Markdown editor with preview.
- **Metadata Bar**: Status dropdown, assignees (multi-select), due date picker, sprint selector.
- **Parent Relationship**: Breadcrumb showing parent epic/story.
- **Acceptance Criteria**: Checklist with add/remove/toggle items. QA-managed.
- **Subtasks**: List of child tasks with quick-add, expand/collapse.
- **Dependencies**: List of blocking/blocked tasks. Add dependency with search.
- **Comments Section**: Threaded comments with markdown support.
- **Attachments**: File list with upload.
- **Activity Log**: History of changes (status, assignee, etc.).
- **AI Integration**:
  - AI Help button → AI context panel on side.
  - AI Input: "Generate acceptance criteria", "Suggest assignee", "Break into subtasks".
  - AI Fill: Type "Add 3 acceptance criteria for login validation" → fills criteria fields.
  - AI Auto: Direct updates.

**Overlays:**
- Attachment Upload (modal).
- Dependency Search (modal).
- AI Suggestion Panel (side panel).

**Empty State**: New task form (empty fields ready to fill).

**Relationships**: Opens as a tab from Backlog, Board, Epics, Quest Tree, Calendar views. Editing saves to the same data store.

---

### 19. Epic Detail

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/epics/$epicId` |
| **ActivityBar** | N/A (opens as tab from Epics view) |
| **Backlog Scope** | Inherits from parent view |
| **Auth Required** | Yes |

**Purpose**: Full epic detail view. Opens as a tab.

**Elements:**
- **Header**: Epic ID, color theme (useEntityTheme), status badge.
- **Title**: Editable epic title.
- **Description**: Markdown editor.
- **Progress Bar**: % of child stories/tasks completed.
- **Child Items**: List of stories and tasks under this epic. Add/remove/reorder.
- **Comments Section**.
- **AI Integration**: Same pattern as Task Detail — AI for breakdown, suggestions, criteria generation.

**Overlays**: Same overlay types as Task Detail.

**Relationships**: Child items appear in Backlog and Board views. Epic completion cascades to child item completion.

---

### 20. Chat Session

| Field | Value |
|-------|-------|
| **Route** | `/app/projects/$projectId/chat/$sessionId` |
| **ActivityBar** | N/A (opens within Chat view) |
| **Backlog Scope** | Per-channel (some channels may be linked to a backlog) |
| **Auth Required** | Yes |

**Purpose**: View a specific chat thread or session. Used for long-running discussions, AI conversation threads, or standup transcripts.

**Elements**:
- Same as Chat view but scoped to a single session/thread.
- Session header with title, participants, date range.
- "Create Task from Session" button.

**Relationships**: Sessions link back to the Chat view.

---

## Overlay Views & Modals Registry

These are the "small views" often missed in documentation. Each one appears as a modal/dialog/side panel.

| Modal | Triggered From | Purpose | Key Elements |
|-------|---------------|---------|--------------|
| **Task Creation** | Backlog, Board, Epics | Create new task with AI | Type selector, title, description, AI input |
| **Epic Creation** | Backlog, Epics | Create new epic | Title, description, color, AI input |
| **Project Quick-Create** | Projects list | Quick project from sidebar | Name + description + AI input |
| **Folder Creation** | Explorer sidebar | New personal folder | Name input |
| **Sprint Creation** | Sprints view | New sprint | Name, dates, goal, team tag, task selector |
| **Mini-Sprint Creation** | Sprints view | New tactical sprint | Name, type (hotfix/etc), dates, goal |
| **Board/Status Management** | Board view | Create/edit status column | Name, color, SCRUM role association |
| **Report Creation** | Reports view | New report | Type selector, title, scope, AI input |
| **Member Invite** | Settings > Members | Add team member | Email + role selector |
| **API Key Add** | Settings > API Keys | Add API key | Provider, alias, key value |
| **Trigger Creation** | AI Agent view | New inter-backlog trigger | Source backlog, event, action, target |
| **Command Palette** | Ctrl+Shift+P (global) | Quick commands and AI | Search bar, command list, AI input |
| **AINotifications** | Bell icon (global) | Proactive AI suggestions | Notification list, AI actions |
| **AI Input Bar** | Every view (floating) | Context-aware AI assistant | Text input, mode toggle (Fill/Auto), send |
| **Bulk Edit** | Backlog view (select mode) | Batch update tasks | Status, assignee, sprint, priority selectors |
| **Daily Standup Panel** | Calendar view | Join/view standup | Scheduled time, join button, transcription |
| **Quick Capture** | Sprints > Mini-Sprints | Rapid task add | Task title input (rapid add multiple) |

---

## Cross-View Relationships Matrix

This shows how data flows between views.

```
                     ┌──────────────┐
                     │   Settings   │◄──── Project config
                     └──────┬───────┘
                            │ affects all views
                            ▼
┌──────────┐     ┌──────────────────┐     ┌───────────┐
│  Chat    │◄───►│  AI Agent (RAG) │◄───►│  Reports  │
│  (voice/ │     │  (project-wide) │     │  (hub)    │
│   text)  │     └────────┬─────────┘     └─────┬─────┘
└────┬─────┘              │                      │
     │ "Create Task"      │ AI actions           │ spawns tasks
     ▼                    ▼                      ▼
┌───────────────────────────────────────────────────────┐
│                 Backlog Selector                       │
│  (All / Development / QA / Strategic / Custom)         │
└────────┬──────────┬──────────┬──────────┬──────────────┘
         │          │          │          │
         ▼          ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌───────────┐
   │Backlog │ │ Board  │ │ Epics  │ │ Calendar  │
   │(Table) │ │(Kanban)│ │(Tree)  │ │(Timeline) │
   └────────┘ └────────┘ └────────┘ └───────────┘
         │          │          │          │
         │          │          │          │
         ▼          ▼          ▼          ▼
   ┌──────────────────────────────────────────────┐
   │           Task/Epic Detail (Tab)              │
   │  Opens from any of the above views            │
   └──────────────────────────────────────────────┘
         │
         ▼
   ┌──────────┐     ┌──────────────┐
   │  Sprints │◄───►│  Quest Tree  │
   │ (+ Mini) │     │  (game tree) │
   └──────────┘     └──────────────┘
         │
         ▼
   ┌──────────────┐
   │  Free Board  │
   │  (Canvas)    │
   └──────────────┘
```

**Key Data Flow Rules:**
- Tasks are the single source of truth. All task changes in any view propagate everywhere.
- Backlog selector is in-memory state (URL query param or context). It does not refetch data — it filters the already-fetched data.
- Tab state is ephemeral (in-memory). Reloading the page only keeps Dashboard tab.
- AI side effects (task creation, status changes) go through the same API as manual actions.

---

## Navigation Flows

### User Journey (simplified)
```
Landing Page ──► Login/Register ──► Projects List ──► Project Dashboard
                                                          │
                 ┌────────────────────────────────────────┤
                 ▼           ▼           ▼           ▼
            Backlog ◄──► Board    Epics      Sprints
            (with backlog selector filtering)
                 │
                 ├──► Task Detail (tab)
                 ├──► Epic Detail (tab)
                 │
            AI integration in all views
```

### Backlog Scoping Flow
```
User opens project → Explorer shows Backlog Selector
  → User selects "Development Backlog"
    → Backlog view: shows Development tasks only
    → Board view: shows Development tasks only (if toggled to backlog-scoped)
    → Epics view: shows Development epics only
    → Calendar: shows Development task dates only
    → Quest Tree: shows Development tasks only
    → AI Agent: context limited to Development (if toggled)
  → User selects "All Backlogs"
    → All views show everything, items tagged with backlog badge
```

---

## Empty States & Error States

Every view must handle two non-ideal states:

### Empty State Pattern
- Descriptive message explaining why it's empty.
- Action button to create the first item.
- AI input as alternative creation path.

### Error State Pattern
- Error message (human-readable).
- Retry button.
- Option to notify admin or contact support.

### View-Specific Empty States

| View | Empty Message | Action | AI Alternative |
|------|--------------|--------|----------------|
| Projects List | "No projects yet. Create your first project!" | "New Project" button | AI input: "Create a project..." |
| Backlog | "This backlog is empty." | "+ New Task" | AI input: "Generate initial tasks" |
| Board | Shows empty columns | "+ New Task" on column | AI input: "Suggest board layout" |
| Epics | "No epics yet." | "+ New Epic" | AI input: "Create epics from project goal" |
| Sprints | "No sprints yet." | "+ New Sprint" | AI input: "Plan a sprint" |
| Calendar | "No calendar data." | "+ New Sprint" | AI input: "Set up sprint schedule" |
| Quest Tree | "No tasks yet." | "Go to Backlog" | AI input: "Create tasks to see tree" |
| Free Board | "Start with a blank canvas." | "Add Shape" / "Link Task" | AI input: "Generate a diagram" |
| Chat | "No messages yet." | Send first message | AI auto-starts conversation |
| AI Agent | "Start a conversation..." | Type a message | N/A |
| Reports | "No reports yet." | "+ New Report" | AI input: "Generate report" |

---

## Color System Integration

All color-carrying views follow the chain defined in AGENTS.md:

```
API response { color: "#3B6D11" }
  → Hook calls registerEntities([{ id, color }])
  → ThemeRegistry caches buildEntityTheme(hex) → CSS vars object
  → Feature component calls useEntityTheme(entity.color)
  → Spreads result as style={{ ...theme }} on the container
  → UI atom reads var(--entity-bg/fg/border/solid)
```

**Which views use entity colors:**
- Backlog (task/epic color badges)
- Board (status column headers get the status color)
- Epics (epic cards get their color)
- Sprints (sprint cards get their color)
- Calendar (sprint bars get their color)
- Quest Tree (node borders = priority colors, bg = status colors)

**Semantic colors (Tailwind classes, not entity colors):**
- Status badges (todo/done/blocked)
- Priority indicators
- All non-entity UI elements

---

## Implementation Guidance

### For AI generating a new view:

1. **Create the page** in `src/pages/` — thin orchestrator that calls the feature hook and renders the feature component.
2. **Add the route** in `src/routes/app/projects/$projectId/` — TanStack Router file route.
3. **Create the feature component** in `src/features/<name>/components/` — owns its data, uses UI atoms.
4. **Create the feature hooks** in `src/features/<name>/hooks/` — TanStack Query + registerEntities for colors.
5. **Create the service** in `src/features/<name>/services/` — apiClient calls.
6. **Add to ActivityBar** in `src/components/layout/ActivityBar.tsx` — add the icon, label, and path.

### Adding AI Integration to a view:
1. Place an AI Input Bar at the bottom or side of the view.
2. Wire it to the `useAI` hook from `src/features/ai/`.
3. Set the context (which view, which backlog scope).
4. On AI response, fill form fields (AI Fill) or directly call the API (AI Auto).
5. Mode toggle switch passes `{ mode: 'fill' | 'auto' }` to the AI hook.

### Backlog Selector Integration:
- The selector lives in the Explorer sidebar (`src/features/workspace/components/Explorer.tsx`).
- Selected backlog ID is stored in React Context (`BacklogScopeContext` or URL search params).
- Any view that is backlog-scoped reads from this context and filters its data.
- Views that are NOT backlog-scoped ignore the selector entirely.