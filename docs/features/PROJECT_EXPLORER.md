# Project Explorer (Workspace Navigation)

**Status: Planned**

---

## Overview

The Project Explorer replaces the traditional card-based project dashboard with a VS Code-inspired file explorer paradigm. Users navigate their workspace as a hierarchical folder structure containing projects as file-like entries.

**Core Paradigm:**
- Projects behave like documents/files
- Folders are organizational containers
- Navigation-first UI instead of dashboard-first
- Visual identity: VS Code Explorer + Linear + Notion hierarchy + GitHub dark theme

---

## Backend Entities

### UserFolder Entity

**Purpose:** Personal folder organization per user. Each user has their own folder structure independent of other users.

```typescript
UserFolder {
  id: UUID
  user_id: UUID (FK)
  parent_id: UUID (FK, nullable - null for root folders)
  name: string
  order_index: number (for sorting)
  created_at: timestamp
  updated_at: timestamp
}
```

**Constraints:**
- Root folders have `parent_id: null`
- Maximum nesting depth: 5 levels
- Folder names must be unique within same parent (per user)

**Relationships:**
- One UserFolder belongs to one User (many-to-one)
- One UserFolder has many UserFolders (one-to-many, children)
- One UserFolder has many Projects (one-to-many)
- Project-to-folder relationship stored via `project_id` on Project with `folder_id`

### Project Entity (Enhanced)

```typescript
Project {
  id: UUID
  name: string
  description: string (markdown)
  goal: string (markdown - what the project aims to achieve)
  color: string (hex - user-defined, used as status indicator)
  icon: string (emoji or icon identifier)
  status: "active" | "archived" | "completed"
  created_by_user_id: UUID (FK)
  created_at: timestamp
  updated_at: timestamp
}
```

**Changes from Current:**
- Added `goal` field
- Added `icon` field (project-specific icon)
- `folder_id` is NOT on Project - folder membership tracked via `UserFolderProject` junction

### UserFolderProject (Junction)

**Purpose:** Many-to-many relationship between UserFolders and Projects (for folder membership).

```typescript
UserFolderProject {
  id: UUID
  user_id: UUID (FK)
  folder_id: UUID (FK, nullable - null means root level)
  project_id: UUID (FK)
  order_index: number (sorting within folder)
  is_pinned: boolean (appears in Pinned section)
  created_at: timestamp
}
```

**Note:** This junction exists because the same project can appear in multiple users' folder structures differently, and one project can be in multiple folders per user (optional).

### ProjectCustomSection Entity

**Purpose:** User-defined custom sections for project (vision, mission, goals, etc.)

```typescript
ProjectCustomSection {
  id: UUID
  project_id: UUID (FK)
  user_id: UUID (FK - who created)
  key: string (e.g., "vision", "mission", "brand_guidelines")
  value: text (markdown content)
  order_index: number
  created_at: timestamp
  updated_at: timestamp
}
```

**Constraints:**
- `key` is user-defined string
- Sections feed into project RAG context for AI
- Order determines display order in Project Overview

### UserExplorerState

**Purpose:** Persist user's explorer UI state.

```typescript
UserExplorerState {
  id: UUID
  user_id: UUID (FK, unique)
  expanded_folder_ids: UUID[] (currently expanded folders)
  active_folder_id: UUID (nullable - where user was last)
  view_size: "compact" | "medium" | "big"
  last_opened_project_id: UUID (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

**Storage:** This is UI state, could be localStorage instead of DB. If stored in DB, it's here.

---

## API Endpoints

### Folder Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:userId/folders` | Get user's folder tree (nested, no pinned) |
| POST | `/users/:userId/folders` | Create folder |
| PATCH | `/folders/:folderId` | Rename/move folder |
| DELETE | `/folders/:folderId` | Delete folder (moves children to parent or root) |
| PATCH | `/folders/:folderId/reorder` | Reorder folders |

### Project-Folder Assignment

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:userId/projects` | Get pinned projects + user's all projects |
| POST | `/users/:userId/folders/:folderId/projects` | Add project to folder |
| DELETE | `/users/:userId/folders/:folderId/projects/:projectId` | Remove project from folder |
| PATCH | `/users/:userId/projects/:projectId/move` | Move project to different folder |
| POST | `/users/:userId/projects/:projectId/pin` | Pin project |
| DELETE | `/users/:userId/projects/:projectId/pin` | Unpin project |
| GET | `/users/:userId/projects/search?q=` | Search projects by name |

### Project CRUD (with folder context)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | Get all projects (admin/system) |
| POST | `/projects` | Create project (optionally in folder) |
| GET | `/projects/:projectId` | Get project details |
| PATCH | `/projects/:projectId` | Update project |
| DELETE | `/projects/:projectId` | Delete project |

### Project Custom Sections

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/sections` | Get all custom sections |
| POST | `/projects/:projectId/sections` | Create custom section |
| PATCH | `/projects/:projectId/sections/:sectionId` | Update section |
| DELETE | `/projects/:projectId/sections/:sectionId` | Delete section |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:userId/projects/search?q=` | Search projects by name |

### Request/Response Examples

**Get User Folder Tree:**
```json
GET /users/123/folders

Response:
{
  "data": [
    {
      "id": "folder-uuid-1",
      "name": "AI Projects",
      "parent_id": null,
      "order_index": 0,
      "children": [
        {
          "id": "folder-uuid-2",
          "name": "Fine-tuning",
          "parent_id": "folder-uuid-1",
          "order_index": 0,
          "children": [],
          "projects": [
            {
              "id": "project-uuid-1",
              "name": "GPT-4 Fine-tune",
              "color": "#3B82F6",
              "icon": "🤖",
              "status": "active"
            }
          ]
        },
        {
          "id": "folder-uuid-3",
          "name": "RAG Chunking",
          "parent_id": "folder-uuid-1",
          "order_index": 1,
          "children": [],
          "projects": []
        }
      ],
      "projects": []
    },
    {
      "id": "folder-uuid-4",
      "name": "Pipelines",
      "parent_id": null,
      "order_index": 1,
      "children": [],
      "projects": []
    }
  ]
}
```

**Get User Projects (pinned):**
```json
GET /users/123/projects

Response:
{
  "pinned": [
    {
      "id": "project-uuid-2",
      "name": "ScrumHub",
      "color": "#10B981",
      "icon": "📘",
      "status": "active"
    }
  ]
}
```

**Create Project in Folder:**
```json
POST /users/123/folders/folder-uuid-1/projects
{
  "name": "New AI Project",
  "description": "A new project for AI experiments",
  "goal": "Experiment with LLM architectures",
  "color": "#8B5CF6",
  "icon": "🧠"
}

Response:
{
  "data": {
    "id": "new-project-uuid",
    "name": "New AI Project",
    "folder_id": "folder-uuid-1",
    "color": "#8B5CF6",
    "icon": "🧠",
    "status": "active"
  }
}
```

**Search Projects:**
```json
GET /users/123/projects/search?q=ScrumHub

Response:
{
  "data": [
    {
      "id": "project-uuid-2",
      "name": "ScrumHub",
      "color": "#10B981",
      "icon": "📘",
      "folder_name": "AI Projects",
      "status": "active"
    }
  ]
}
```

**Create Custom Section:**
```json
POST /projects/project-uuid/sections
{
  "key": "vision",
  "value": "Our vision is to create the most intuitive project management experience for development teams.",
  "order_index": 0
}
```

---

## Frontend Views

### Explorer Layout (Windows Explorer-Style)

The layout follows Windows File Explorer behavior:
- **Left sidebar (20-25%)**: Folder tree navigation with breadcrumb
- **Main panel (75-80%)**: Content changes based on navigation state

```
┌───────────────────────────────────────────────────────────────────────┐
│ TOP NAVBAR                                                             │
├──────────────────────┬──────────────────────────────────────────────────┤
│ EXPLORER (20-25%)    │ MAIN CONTENT PANEL (75-80%)                     │
│                      │                                                  │
│ [EXPLORER]           │ [Welcome / Recent Activity]                     │
│ [Breadcrumb: Home]   │          OR                                     │
│ [Search...____] [🤖] │ [Folder Contents Grid]                           │
│                      │          OR                                     │
│ [+Folder] [+Project] │ [Selected Project Details]                      │
│ [Import ↓]           │                                                  │
│                      │                                                  │
│ 📌 Pinned            │                                                  │
│   📘 [Project]       │                                                  │
│                      │                                                  │
│ ▼ Folder A           │                                                  │
│   ▼ Subfolder        │                                                  │
│     📘 Project      │                                                  │
│   📘 Project         │                                                  │
│ ▼ Folder B           │                                                  │
│   📘 Project         │                                                  │
│                      │                                                  │
└──────────────────────┴──────────────────────────────────────────────────┘
```

**Behavior:**
- Default view (Home): Shows Welcome + Pinned + Recent sections
- When folder selected: Main panel shows folder contents as grid
- When project selected: Opens project workspace view

### Explorer Sidebar (Left Panel)

**Dimensions:**
- Width: 20-25% of viewport (~260-320px base, responsive)
- Resizable (Windows Explorer-style drag handle)
- Background: slightly darker than main area

**Header Section:**
```
EXPLORER
[Breadcrumb: Home / Folder Name / Subfolder]
[Search...______________] [🤖 AI]
[+Folder] [+Project] [Import ↓]
```

**Sections:**
1. **Pinned Projects** (collapsible, pinned items show here)
2. **Folder Tree** (recursive, expandable, Windows Explorer-style)
3. **Root Level Projects** (projects at root level)

**Folder Row:**
```
▼ Folder Name
  ▼ Subfolder
    📘 Project Name
```
- Medium gray text, bold-ish
- Caret icon (▼ expanded / ▶ collapsed) for expand/collapse
- Yellow folder icon
- Hover: `hover:bg-list-hover` (CSS variable)
- Right-click: context menu
- Selected: `bg-list-active border-l-2 border-primary` (CSS variables)

**Project Row:**
```
• Project Name
```
- Lighter gray text
- Project icon (emoji or color square)
- 32-40px height
- Selected: `bg-list-active border-l-2 border-primary` (CSS variables)

**Typography:**
- Regular UI font (DM Sans) for explorer labels and interface elements
- Monospace font (JetBrains Mono) for ticket numbers and IDs only

**Import Button:**
- Triggers external import flow (e.g., Moodle integration for students)
- Opens separate modal/view for source selection and destination folder

### Context Menus

**Folder Right-Click:**
```
New Project
New Folder
──────────
Rename
Duplicate
──────────
Delete
Collapse All
```

**Project Right-Click:**
```
Open
──────────
Rename
Move to...
──────────
Archive
Delete
```

### View Size Options

**Compact (default):**
```
• ScrumHub
• Orbit
• Nimbus
```
- Just names, 24-28px height

**Medium:**
```
• 📘 ScrumHub  [████████░░] 80%
• 📘 Orbit      [████░░░░░░] 45%
```
- Name + icon + completion bar
- 36-40px height

**Big:**
```
• 📘 ScrumHub
  AI-powered project management
  [████████░░] 80% · 12 tasks
```
- Name + description + completion bar
- 56-64px height

### Main Panel - Two States (Windows Explorer Behavior)

**State 1: Default (Home/Recent)**
When no folder is selected in sidebar - shows welcome and recent items:

```
┌─────────────────────────────────────────────┐
│ Welcome to ScrumHub                        │
│ Select a project from the explorer...      │
│                                             │
│ 📌 PINNED                                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ [Icon]  │ │ [Icon]  │ │ [Icon]  │        │
│ │ Project │ │ Project │ │ Project │        │
│ │  80%    │ │  45%    │ │  20%    │        │
│ └─────────┘ └─────────┘ └─────────┘        │
│                                             │
│ ⏱ RECENT                                   │
│ ┌─────────┐ ┌─────────┐                    │
│ │ [Icon]  │ │ [Icon]  │                    │
│ │ Project │ │ Project │                    │
│ └─────────┘ └─────────┘                    │
│                                             │
│ + Create New Project                        │
└─────────────────────────────────────────────┘
```

**State 2: Folder Contents Grid**
When a folder is selected in sidebar - shows folder contents as a **card grid** (like Windows File Explorer's thumbnail/icon view):

```
┌─────────────────────────────────────────────┐
│ Folder Name                     [ViewSize] │
│                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │    📁    │ │    📁    │ │    📁    │       │
│ │ Folder 1 │ │ Folder 2 │ │ Folder 3 │       │
│ └─────────┘ └─────────┘ └─────────┘       │
│                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │ [Icon]  │ │ [Icon]  │ │ [Icon]  │       │
│ │ Project │ │ Project │ │ Project │       │
│ │  80%    │ │  45%    │ │  20%    │       │
│ └─────────┘ └─────────┘ └─────────┘       │
│                                             │
└─────────────────────────────────────────────┘
```

**Important:** Items are always displayed as **cards in a grid** (never as full-width rows).
The grid adapts columns: 2 cols on mobile, 3 on tablet, 4 on desktop.

**View Size Toggle (Compact/Medium/Big):**
- Only affects the **card content density**, NOT the layout type
- Cards always stay in grid format regardless of size
- **Compact**: Just icon + name (minimal card)
- **Medium**: Icon + name + completion bar (default)
- **Big**: Icon + name + description + completion bar + task count

### Main Panel - Project Selected

When clicking "Open" on a project:
- View is REPLACED by project workspace
- NOT a tab (explorer stays as separate view)
- Similar to "Open Folder" in Windows Explorer, not "Open File"

**Project View includes "Back to Explorer" option:**
```
┌─────────────────────────────────────────────┐
│ ← Back to Explorer                         │
│                                             │
│ 📘 [Project Name]                           │
│ [Project Description]                     │
│                                             │
│ [Board] [Backlog] [Sprints] [Chat] [Settings] │
└─────────────────────────────────────────────┘
```

---

## User Interaction Flows

### First-Time User
1. User sees empty explorer with "Create your first project" prompt
2. Click "+ Project" → Project creation modal
3. Project appears in root of explorer
4. Click project → Opens project workspace

### Returning User
1. User sees explorer with last expanded folder
2. Expands folders to find project
3. Clicks project → Opens project workspace

### Search Flow
1. User types in search bar
2. Explorer filters to show matching projects
3. Non-matching folders/projects are hidden
4. Main panel shows search results list
5. Click result → Opens project

### AI Project Creation
1. User types in search bar OR clicks AI button
2. Types: "Create project called X for Y purpose"
3. AI creates project with suggested backlog
4. Project appears in current folder
5. User can edit/modify

---

## Architecture Changes

### Database Migration

```sql
-- UserFolders table
CREATE TABLE user_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES user_folders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_folder_name_per_parent UNIQUE (user_id, parent_id, name)
  -- Note: nesting depth enforced at application layer (max 5 levels)
);

-- ProjectCustomSections table
CREATE TABLE project_custom_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  key VARCHAR(255) NOT NULL,
  value TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- UserFolderProjects junction (many-to-many via folder)
CREATE TABLE user_folder_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES user_folders(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_project_per_user UNIQUE (user_id, project_id)
);

-- Add goal and icon to projects
ALTER TABLE projects ADD COLUMN goal TEXT;
ALTER TABLE projects ADD COLUMN icon VARCHAR(10);

-- Indexes
CREATE INDEX idx_user_folders_user ON user_folders(user_id);
CREATE INDEX idx_user_folders_parent ON user_folders(parent_id);
CREATE INDEX idx_project_sections_project ON project_custom_sections(project_id);
CREATE INDEX idx_user_folder_projects_user ON user_folder_projects(user_id);
CREATE INDEX idx_user_folder_projects_folder ON user_folder_projects(folder_id);
CREATE INDEX idx_user_folder_projects_pinned ON user_folder_projects(user_id, is_pinned) WHERE is_pinned = true;
```

### Frontend Changes

This is an **enhancement to existing workspace Explorer** (`src/features/workspace/components/Explorer.tsx`), not a new feature module.

**New/Enhanced Components:**
```
src/features/workspace/
├── components/
│   ├── Explorer.tsx          (enhanced - main container)
│   ├── Breadcrumb.tsx        (NEW - folder path navigation)
│   ├── FolderTree.tsx        (enhanced - nested tree structure)
│   ├── FolderNode.tsx        (enhanced - with expand/collapse)
│   ├── ProjectNode.tsx       (enhanced - with selection state)
│   ├── PinnedProjects.tsx    (existing - enhanced)
│   ├── SearchBar.tsx         (existing - enhanced with AI)
│   ├── ContextMenu.tsx       (existing - enhanced)
│   ├── CreateFolderModal.tsx (existing)
│   ├── CreateProjectModal.tsx (existing)
│   ├── MainPanel.tsx         (ENHANCED - two states: Default/FolderGrid)
│   ├── FolderGrid.tsx       (NEW - folder contents grid view)
│   ├── ViewSizeToggle.tsx   (existing - affects folder grid only)
│   └── WelcomePanel.tsx      (existing - default view)
├── hooks/
│   ├── useExplorerState.ts   (existing - enhanced)
│   ├── useUserFolders.ts     (NEW - folder CRUD)
│   └── useExplorerNavigation.ts (NEW - navigation state management)
└── types/
    └── explorerTypes.ts      (NEW - shared types)
```

**Existing Routes (enhanced):**
- `/app/projects` - Explorer view (enhanced, existing route)

**State Management:**
- `useExplorerState` - Manages expanded folders, active folder, view size, main panel state
- Persisted to localStorage
- `useExplorerNavigation` - Tracks current view state (Default vs Folder Contents)
- `useActiveProject` - When project opened, sets active project

**Component Details:**

1. **Explorer** (enhanced): Main container, handles two-panel layout
2. **Breadcrumb** (NEW): Folder path navigation in sidebar header
3. **FolderTree**: Nested tree of folders + projects (Windows Explorer-style)
4. **FolderNode**: Expandable folder row with selection state
5. **ProjectNode**: Project row with icon, name, optional completion bar
6. **MainPanel** (enhanced): Switches between Default and Folder Contents states
7. **FolderGrid** (NEW): Grid display for folder contents with View Size toggle
8. **SearchBar**: Search + AI input
9. **ContextMenu**: Right-click menu with actions
10. **ViewSizeToggle**: Compact/Medium/Big switcher (affects folder grid only)

---

## Implementation Checklist

### Backend
- [ ] Database migration for user_folders, project_custom_sections, user_folder_projects
- [ ] Add goal and icon columns to projects table
- [ ] Backend: FolderService CRUD
- [ ] Backend: ProjectService updates for folders
- [ ] Backend: Custom sections CRUD
- [ ] Backend: Search endpoint
- [ ] Backend: Recent projects endpoint

### Frontend (Workspace Enhancement)
- [ ] Frontend: Enhancement to existing workspace/Explorer.tsx
- [ ] Frontend: Breadcrumb component for folder path navigation
- [ ] Frontend: FolderTree with nested recursion (Windows Explorer-style)
- [ ] Frontend: FolderNode with expand/collapse and selection state
- [ ] Frontend: ProjectNode with view size support
- [ ] Frontend: MainPanel with two states (Default/FolderGrid)
- [ ] Frontend: FolderGrid component for folder contents display
- [ ] Frontend: ViewSizeToggle (affects folder grid only, not sidebar)
- [ ] Frontend: ContextMenu system
- [ ] Frontend: Search with filtering
- [ ] Frontend: WelcomePanel (default view)
- [ ] Frontend: Navigation to project view
- [ ] Frontend: localStorage persistence for explorer state
- [ ] Frontend: useExplorerNavigation hook for state management
- [ ] Frontend: useUserFolders hook for folder CRUD
- [ ] Frontend: Import button with external import flow

### Testing & Documentation
- [ ] E2E tests for explorer navigation
- [ ] Documentation update (ERD.md, ENDPOINTS.md, TRUTH.md)

---

## Implementation Plan

### Phase 1: Backend (Foundation)

**Step 1.1: Database Schema**
- Run SQL migrations for user_folders, project_custom_sections, user_folder_projects
- Add goal and icon columns to projects table
- Create indexes for performance

**Step 1.2: API Implementation**
- FolderService: CRUD operations for folders
- ProjectService: Updates for folder assignment and pinning
- Custom sections: Full CRUD
- Search: Project search by name
- Recent: Recent projects endpoint

### Phase 2: Frontend Core (Explorer Enhancement)

**Step 2.1: Types & Hooks**
- Create `src/features/workspace/types/explorerTypes.ts`
- Implement `useUserFolders.ts` hook for folder operations
- Enhance `useExplorerState.ts` with navigation state
- Implement `useExplorerNavigation.ts` for view state management

**Step 2.2: Sidebar Components**
- Create `Breadcrumb.tsx` component
- Enhance `FolderTree.tsx` for nested structure
- Enhance `FolderNode.tsx` with expand/collapse
- Enhance `ProjectNode.tsx` with selection state

**Step 2.3: Main Panel Components**
- Enhance `MainPanel.tsx` for two-state behavior
- Create `FolderGrid.tsx` component
- Integrate ViewSizeToggle for folder grid

**Step 2.4: Integration**
- Wire up Import button (placeholder for external flow)
- Connect folder selection to main panel state
- Implement localStorage persistence

### Phase 3: Polish & Testing

**Step 3.1: Polish**
- Add context menus
- Refine search functionality
- Add AI integration

**Step 3.2: Testing**
- E2E tests for explorer navigation
- Verify all user flows work correctly

---

## Notes

- Folders are purely personal organization - not shared between users even for shared projects
- Project colors serve as status indicators (no separate "blocker" entity)
- View size preference stored in localStorage, not per-folder
- Explorer state (expanded folders, last folder, main panel state) stored in localStorage
- When project is deleted, it's removed from all folder structures automatically
- Search should be debounced (300ms) and case-insensitive
- AI button in search bar triggers AI mode for natural language project creation
- Main panel behavior mirrors Windows Explorer: Default (Recent) → Folder Contents (when folder selected)
- Import button triggers separate external flow (Moodle integration)