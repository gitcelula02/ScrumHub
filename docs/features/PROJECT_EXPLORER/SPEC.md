# Project Explorer

**Status:** Planned

---

## Overview

The Project Explorer replaces the traditional card-based project dashboard with a VS Code-inspired file explorer paradigm. Users navigate their workspace as a hierarchical folder structure containing projects as file-like entries.

**Core Paradigm:**
- Projects behave like documents/files
- Folders are organizational containers
- Navigation-first UI instead of dashboard-first

**Entity Definition:** See [domain/ERD.md](/docs/domain/ERD.md) — UserFolder, UserFolderProject, ProjectCustomSection entities.

**API Endpoints:** See [api/ENDPOINTS.md](/docs/api/ENDPOINTS.md) — Projects section for folder-related endpoints.

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
│ [Search... ] │                                              │
│ [+Folder]   │ OR                                          │
│ [+Project]   │ [Selected Project Details]                  │
│              │                                              │
│ 📌 Pinned   │                                              │
│   📘 ScrumHub│                                              │
│              │                                              │
│ ▼ AI Projects│                                              │
│   ▼ Fine-tune│                                              │
│     📘 GPT4  │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Explorer Sidebar

- **Width:** 260-320px, resizable
- **Header:** Search bar, AI button, +Folder, +Project buttons
- **Sections:** Pinned Projects, Folder Tree (recursive), Root Level Projects

### Project Rows

| View Size | Display |
|-----------|---------|
| Compact | Name only, 24-28px height |
| Medium | Name + icon + completion bar, 36-40px height |
| Big | Name + description + completion bar, 56-64px height |

### Context Menus

**Folder:** New Project, New Folder, Rename, Duplicate, Delete, Collapse All

**Project:** Open, Rename, Move to..., Archive, Delete

---

## Visual Design

- Monospace font for explorer labels (JetBrains Mono)
- Folder icon with caret (collapsible)
- Selected project: `background: rgba(14,165,233,0.15); border-left: 2px solid #0EA5E9;`
- Hover: `background: rgba(255,255,255,0.04)`

---

## Interaction Flows

### First-Time User
1. Empty explorer → "Create your first project" prompt
2. Click "+ Project" → Project creation modal
3. Project appears in root of explorer
4. Click project → Opens project workspace

### Returning User
1. Sees explorer with last expanded folder
2. Expands folders to find project
3. Clicks project → Opens project workspace

### Search Flow
1. User types in search bar
2. Explorer filters to show matching projects
3. Non-matching folders/projects hidden
4. Main panel shows search results

### AI Project Creation
1. User types in search bar OR clicks AI button
2. Types: "Create project called X for Y purpose"
3. AI creates project with suggested backlog

---

## View Size Options

| Size | Description |
|------|-------------|
| Compact | Just names, 24-28px height |
| Medium | Name + icon + completion bar, 36-40px height |
| Big | Name + description + completion bar, 56-64px height |

---

## Routes

- `/app/projects` — Explorer view (replaces current projects list)

---

## Notes

- Folders are purely personal organization — not shared between users
- Project colors serve as status indicators
- Explorer state (expanded folders, last folder) persisted in localStorage
- When project deleted, removed from all folder structures automatically
- Search debounced at 300ms, case-insensitive