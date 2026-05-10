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
| GET | `/users/:userId/folders` | Get user's folder tree |
| POST | `/users/:userId/folders` | Create folder |
| PATCH | `/folders/:folderId` | Rename/move folder |
| DELETE | `/folders/:folderId` | Delete folder (moves children to parent or root) |
| PATCH | `/folders/:folderId/reorder` | Reorder folders |

### Project-Folder Assignment

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:userId/projects` | Get all projects in user's folder structure |
| POST | `/users/:userId/folders/:folderId/projects` | Add project to folder |
| DELETE | `/users/:userId/folders/:folderId/projects/:projectId` | Remove project from folder |
| PATCH | `/users/:userId/projects/:projectId/move` | Move project to different folder |
| POST | `/users/:userId/projects/:projectId/pin` | Pin project |
| DELETE | `/users/:userId/projects/:projectId/pin` | Unpin project |
| GET | `/users/:userId/projects/pinned` | Get pinned projects |
| GET | `/users/:userId/projects/recent` | Get recently opened projects |

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
          "children": []
        },
        {
          "id": "folder-uuid-3",
          "name": "RAG Chunking",
          "parent_id": "folder-uuid-1",
          "order_index": 1,
          "children": []
        }
      ],
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
      "id": "folder-uuid-4",
      "name": "Pipelines",
      "parent_id": null,
      "order_index": 1,
      "children": [],
      "projects": []
    }
  ],
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

### Explorer Layout

```
┌─────────────────────────────────────────────────────────────┐
│ TOP NAVBAR                                                 │
├──────────────┬──────────────────────────────────────────────┤
│ EXPLORER    │ MAIN PREVIEW PANEL                          │
│ (260-320px) │                                              │
│              │ [Welcome / Recent Activity]                 │
│ [EXPLORER]  │                                              │
│              │ OR                                         │
│ [Search... ] │ [Selected Project Details]                  │
│              │                                              │
│ + Folder     │                                              │
│ + Project    │                                              │
│              │                                              │
│ 📌 Pinned   │                                              │
│   📘 ScrumHub│                                              │
│              │                                              │
│ ▼ AI Projects│                                              │
│   ▼ Fine-tune│                                              │
│     📘 GPT4 │                                              │
│   ▼ RAG     │                                              │
│     📘 Chunk │                                              │
│              │                                              │
│ ▼ Pipelines │                                              │
│   📘 CI/CD  │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Explorer Sidebar (Left Panel)

**Dimensions:**
- Width: 260-320px
- Resizable (VS Code-style drag handle)
- Background: slightly darker than main area

**Header Section:**
```
EXPLORER
[Search...____]  [🔍] [🤖 AI]
[ + Folder ] [ + Project ]
```

**Sections:**
1. **Pinned Projects** (collapsible)
2. **Folder Tree** (recursive, expandable)
3. **Root Level Projects** (projects without folder)

**Folder Row:**
```
▼ Folder Name
```
- Medium gray text, bold-ish
- Caret icon (collapsible)
- Folder icon
- Hover: `background: rgba(255,255,255,0.04)`
- Right-click: context menu

**Project Row:**
```
• Project Name
```
- Lighter gray text
- Smaller icon (project icon or emoji)
- 32-40px height
- Selected: `background: rgba(14,165,233,0.15); border-left: 2px solid #0EA5E9;`

**Typography:**
- Monospace font for explorer labels (JetBrains Mono)
- Regular UI font for interface elements

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

### Main Panel - No Selection

When no project is selected:

```
┌─────────────────────────────────────────────┐
│ Welcome to ScrumHub                        │
│                                             │
│ 📌 Pinned                                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ScrumHub │ │Orbit    │ │Nimbus   │        │
│ │ 📘 80%  │ │ 📘 45%  │ │ 📘 20%  │        │
│ └─────────┘ └─────────┘ └─────────┘        │
│                                             │
│ ⏱ Recent                                  │
│ ┌─────────┐ ┌─────────┐                    │
│ │Helix    │ │RAG Perf │                    │
│ └─────────┘ └─────────┘                    │
│                                             │
│ + Create New Project                        │
└─────────────────────────────────────────────┘
```

### Main Panel - Project Selected

When clicking "Open" on a project:
- View is REPLACED by project workspace
- NOT a tab (explorer stays as separate view)
- Similar to "Open Folder" in VS Code, not "Open File"

**Project View includes "Back to Explorer" option:**
```
┌─────────────────────────────────────────────┐
│ ← Back to Explorer                         │
│                                             │
│ 📘 ScrumHub                                 │
│ AI-powered project management               │
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
  CONSTRAINT unique_folder_name_per_parent UNIQUE (user_id, parent_id, name),
  CONSTRAINT max_nesting_depth CHECK (nest_level <= 5)
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

**New Feature Module:**
```
features/project-explorer/
├── components/
│   ├── ExplorerSidebar.tsx
│   ├── FolderTree.tsx
│   ├── FolderNode.tsx
│   ├── ProjectNode.tsx
│   ├── PinnedProjects.tsx
│   ├── SearchBar.tsx
│   ├── ContextMenu.tsx
│   ├── CreateFolderModal.tsx
│   ├── CreateProjectModal.tsx
│   ├── ViewSizeToggle.tsx
│   └── WelcomePanel.tsx
├── hooks/
│   ├── useUserFolders.ts
│   ├── useExplorerProjects.ts
│   ├── useExplorerSearch.ts
│   └── useExplorerState.ts
├── services/
│   └── explorerService.ts
├── types/
│   └── explorerTypes.ts
└── index.ts
```

**New Routes:**
- `/app/projects` - Explorer view (replaces current projects list)
- `/app/projects/explorer` - Explicit explorer route

**State Management:**
- `useExplorerState` - Manages expanded folders, active folder, view size
- Persisted to localStorage
- `useActiveProject` - When project opened, sets active project

**Component Details:**

1. **ExplorerSidebar**: Main container, resizable
2. **FolderTree**: Recursive tree of folders + projects
3. **ProjectNode**: Project row with icon, name, optional completion bar
4. **SearchBar**: Search + AI input (double as AI trigger)
5. **ContextMenu**: Right-click menu with actions
6. **WelcomePanel**: Main panel when no project selected
7. **ViewSizeToggle**: Compact/Medium/Big switcher

---

## Implementation Checklist

- [ ] Database migration for user_folders, project_custom_sections, user_folder_projects
- [ ] Add goal and icon columns to projects table
- [ ] Backend: FolderService CRUD
- [ ] Backend: ProjectService updates for folders
- [ ] Backend: Custom sections CRUD
- [ ] Backend: Search endpoint
- [ ] Backend: Recent projects endpoint
- [ ] Frontend: project-explorer feature module
- [ ] Frontend: ExplorerSidebar layout
- [ ] Frontend: FolderTree with recursion
- [ ] Frontend: ProjectNode with view sizes
- [ ] Frontend: ContextMenu system
- [ ] Frontend: Search with filtering
- [ ] Frontend: Welcome panel
- [ ] Frontend: Navigation to project view
- [ ] Frontend: localStorage persistence for explorer state
- [ ] Frontend: Route /app/projects update
- [ ] E2E tests for explorer navigation
- [ ] Documentation update (ERD.md, ENDPOINTS.md, TRUTH.md)

---

## Notes

- Folders are purely personal organization - not shared between users even for shared projects
- Project colors serve as status indicators (no separate "blocker" entity)
- View size preference stored in localStorage, not per-folder
- Explorer state (expanded folders, last folder) stored in localStorage
- When project is deleted, it's removed from all folder structures automatically
- Search should be debounced (300ms) and case-insensitive
- AI button in search bar triggers AI mode for natural language project creation