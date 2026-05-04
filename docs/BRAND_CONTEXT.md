---
description : This markdown document is designed as a **System Context & UI Specification** for a front-end generative model. It bridges brand vision into a technical design language that AI can immediately act upon to build the interface.
---

# UI/UX Specification: ScrumHub Workspace

**Project Persona:** High-End Developer Tool / Minimalist IDE
**Design Philosophy:** "Sober, Structured, and Sophisticated"
**Reference UI:** Visual Studio Code — sidebar, header, tabs, file explorer patterns

---

## 1. Brand Identity & Visual Language

**Core Concept:** A SCRUM platform that feels like a premium code editor (IDE).

**Mascot/Logo:** An abstract, geometric "S-Link" Dragon. Sharp angles, minimalist lines, representing fluid power and order.

**Catchphrase:** *Architecting Agility.*

**Default Color Themes (CSS Variables in Tailwind):**
- Dark Mode: Deep Charcoal-Black background (VS Code dark theme default), white text, subtle borders
- Light Mode: Pure White surface, dark text
- Additional themes available via Settings

**Entity Colors:**
- User-defined colors for Projects, Epics, Sprints, Status (via CSS variables `--entity-*`)
- These are dynamic and user-customizable, not fixed brand colors

**Typography:**
- Monospace for data/IDs, timestamps
- Clean, high-readability Sans-Serif for UI (JetBrains Mono for code contexts)

**Transitions:**
- Fast (150ms) linear transitions to maintain high-performance feel

---

## 2. VS Code-Inspired Layout Architecture

The interface follows VS Code's proven layout pattern.

**Global Sidebar (Leftmost — Never Disappears):**
- Icon-only rail with hover tooltips
- Icons: Home, Backlog, Epics, Quest Tree, Chat, Reports, Settings (cogwheel)
- Mimics VS Code's Activity Bar

**Header Bar (Top):**
- **Left:** Project selector dropdown
- **Center:** Search bar (acts as command palette — type `>theme` to open theme settings)
- **Right:** Notifications, Settings button (opens General Settings), User Profile dropdown
- **Tab Bar:** Pinned/draggable tabs for project views and task details (mimics VS Code tabs)

**Specific View Sidebar (Right of Global Sidebar — Collapsible):**
- Settings view: Navigation sidebar with sections (General Settings, Profile, Theme, Notifications, AI Assistant)
- Backlog view: Collapsible sprint/task tree

**Multi-Pane Interface:**
- Support for side-by-side views (e.g., User Story on left, AI Chat pinned right)
- Task details open as tabs (not separate windows)

---

## 3. Feature-to-View Mapping

### **Project & Backlog Management (The "Explorer" View)**

* **UX:** Clean list-based indentation, file-tree style
* **UI:** Minimalist icons (Chevrons) to expand/collapse Epics
* **Sidebar:** Collapsible sprint/task hierarchy
* **Reference:** VS Code Explorer panel

### **Kanban Board (The "Grid View")**

* **UX:** "No-distraction" Kanban board. Task cards are flat with color-coded borders to indicate priority
* **Board Item Display:** Title, Priority icon, Assignee avatar(s), Due date, collapsible subtasks
* **Drag & Drop:** Snappy interactions. Dragging parent moves all subtasks
* **Phantom Parent:** When subtasks differ from parent, nested under dashed-border "phantom" card
* **Status Columns:** Separated by subtle vertical lines, each status has custom color

### **Quest Tree View**

* **Icon:** Global sidebar with red dot notification (urgency indicator)
* **Tree Display:** Hierarchical view with progress bars
* **Visual Coding:**
  - Priority = Border color
  - State = Background color
  - User's incomplete tasks = Visible shadow
* **On Click:** Opens modal with task description, due date, state, acceptance criteria (comments hidden)
* **"See more details"** button opens full tab view

### **Sprint Planning**

* **Sprint Creation Overlay:** Description (markdown), Start date, Due date, Task selector (assign tasks/epics/stories/subtasks)
* **Sprint Views:** Kanban board, Calendar, Retrospectives accessible per sprint

### **Daily Standups**

* **Scheduling:** Via Calendar view with notifications
* **Dedicated Channel:** "Daily" channel (default, cannot be deleted) with both voice and text
* **Reference:** Discord channel structure within the project chatroom

### **Nexus AI Integration**

* **Nexus:** The AI assistant name (brand identity)
* **UX:** Feels like a built-in terminal or side-aligned assistant
* **Modes:**
  1. **Global Chat:** Full-panel view for deep project analysis
  2. **Contextual Overlay:** Slim sidebar accessible via shortcut or trigger
* **Manner of Speech:** Direct, technical, proactive. Presents data as "Observations" or "System Logs"
* **Task Integration:** "Transcribe & Create Task" button analyzes messages and proposes task changes
* **AI Help Button:** In task detail view, opens modal for AI-assisted editing

### **Ceremonies & Reports (The "Data View")**

* **UX:** Retrospectives as collaborative documents within workspace
* **UI:** Crisp, high-contrast line charts for statistics
* **Reports:** Pie charts, percentage completion bars

### **Chatroom**

* **UI:** Discord-like with text and voice channels
* **Channels:** Text channels with markdown support, voice channels with WebRTC
* **AI:** Transcription on-demand, "Transcribe & Create Task" feature

---

## 4. Interaction Principles

**Hover-State Logic:**
- Low-opacity tints to highlight active "line" or "folder" (code editor line highlighting style)

**Tab System:**
- Tabs can be closed, reordered (drag and drop), pinned (pinned stay left)
- Task/story/epic detail views open as tabs

**Search Bar (Command Palette):**
- Expands on click to show suggestions and "Ask the AI" option
- Typing `>command` acts as command palette (e.g., `>theme` opens theme settings)
- Context-aware: project results inside project view, global results outside

**Empty States:**
- No projects: "No projects" + Create button + AI input ("Help me create a project...")
- Empty boards: Boards with no tasks
- No sprints: "Create an Epic" + AI suggestion
- Home empty: "Nothing to see, start creating sprints or epics"

**Modals & Overlays:**
- Task Creation: Same as Task Detail minus comments
- Sprint Creation: Description, dates, task selector
- Board Editing: Name, status management, color picker, role association

---

## 5. Settings View (Action Header)

The Settings view serves as the "Action Header" — containing project-specific AI settings and member permissions.

**Settings Sections:**
- General Settings
- Profile
- Theme (switch between dark/light and custom themes)
- Notifications (Email, Push, In-App toggles)
- AI Assistant (Nexus settings: tone, model, prompts, skills, tools)

**Reference:** VS Code Settings editor pattern