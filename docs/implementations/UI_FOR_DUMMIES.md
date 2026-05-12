# ScrumHub Frontend — UI for Dummies

> **Purpose:** This document provides a complete, beginner-friendly guide to every view, feature, reusable component, color, and design convention used in the ScrumHub frontend application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design System](#2-design-system)
3. [Routing Structure](#3-routing-structure)
4. [Reusable UI Components](#4-reusable-ui-components)
5. [Layout Components](#5-layout-components)
6. [Views (Pages)](#6-views-pages)
7. [State Management](#7-state-management)
8. [Real-Time Features](#8-real-time-features)
9. [Key Interaction Patterns](#9-key-interaction-patterns)
10. [CSS Custom Classes](#10-css-custom-classes)

---

## 1. Project Overview

The ScrumHub frontend is a **React 18 + TypeScript** application styled with **Tailwind CSS v4**. It mimics a **VS Code-inspired interface** — dark theme, terminal-style labels, and a developer-centric design language.

### Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI rendering |
| TypeScript | Type safety |
| TanStack Router (v1) | File-based routing |
| TanStack Query (v5) | Server state / API calls |
| Tailwind CSS v4 | Styling |
| @hello-pangea/dnd | Drag-and-drop for Kanban |
| lucide-react | Icon library |
| socket.io-client | Real-time WebSocket communication |
| axios | HTTP client |

### Directory Structure

```
frontend/src/
├── components/          # Reusable React components
│   ├── ui/              # Base UI components (Button, Card, Modal)
│   ├── kanban/          # Kanban board components
│   ├── ai/              # AI chat components
│   └── layout/          # Layout components (Layout, VSCLayout)
├── views/               # Page-level view components
├── routes/              # TanStack Router file-based routes
├── services/            # API service layers
├── hooks/               # Custom React hooks
├── context/             # React context providers
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── main.tsx             # Entry point
└── index.css            # Global styles & Tailwind
```

---

## 2. Design System

### 2.1 Color Palette

The application uses a **VS Code-inspired dark color palette**. Colors are defined as CSS custom properties.

#### Primary Colors

| Variable | Hex Code | Usage |
|----------|----------|-------|
| `--color-editor-bg` | `#1e1e1e` | Main editor/background color |
| `--color-activity-bar` | `#333333` | Left activity bar background |
| `--color-side-bar` | `#252526` | Sidebar/panel background |
| `--color-border` | `#3c3c3c` | Borders and dividers |
| `--color-accent` | `#007acc` | Primary accent (VS Code blue) |
| `--color-text-main` | `#cccccc` | Main body text |
| `--color-text-bright` | `#ffffff` | Bright/heading text |
| `--color-status-bar` | `#007acc` | Bottom status bar |

#### Extended Colors (CSS Custom Properties)

| Variable | Hex Code | Usage |
|----------|----------|-------|
| `--vsc-blue` | `#007acc` | Primary blue (same as accent) |
| `--accent-purple` | `#8b5cf6` | AI/purple accent |
| `--accent-green` | `#22c55e` | Success/connected states |
| `--accent-red` | `#ef4444` | Error/danger states |

#### Tailwind-Extended Colors (in config)

| Tailwind Class | Hex Code | Usage |
|----------------|----------|-------|
| `vscode-bg` / `bg-vscode-bg` | `#1e1e1e` | Main background |
| `vscode-activity-bar` / `bg-vscode-activity-bar` | `#333333` | Activity bar |
| `vscode-sidebar` / `bg-vscode-sidebar` | `#252526` | Sidebar |
| `vscode-border` / `border-vscode-border` | `#3c3c3c` | Borders |
| `vscode-text` / `text-vscode-text` | `#cccccc` | Text |
| `vscode-text-bright` / `text-vscode-text-bright` | `#ffffff` | Bright text |
| `vscode-blue` / `text-vscode-blue` | `#007acc` | Primary accent |
| `vscode-hover` | `#2a2d2e` | Hover state |
| `vscode-active` | `#094771` | Active/selected state |

#### Priority Colors (for tasks)

| Priority | Background | Text | Border |
|----------|------------|------|--------|
| High / Urgent | `red-500/10` | `red-400` | `red-500/20` |
| Medium | `orange-500/10` | `orange-400` | `orange-500/20` |
| Low | `green-500/10` | `green-400` | `green-500/20` |
| Purple (special) | `purple-500/10` | `purple-400` | `purple-500/20` |

### 2.2 Typography

#### Font Families

| Role | Font Stack |
|------|------------|
| **Interface** | `"Inter", "Segoe UI", sans-serif` |
| **Code / Monospace** | `"Fira Code", "Consolas", monospace` |

#### Type Scale (approximate)

| Element | Size | Weight | Style |
|---------|------|--------|-------|
| Page headings (h1) | 36-48px (text-5xl/7xl) | Bold (700) | Tracking tight |
| Section headings (h2) | ~20px | Bold | Tracking tight |
| Section headings (h3) | ~16px | Semibold | Tracking tight |
| Body text | 14px (text-sm) | Normal (400-500) | Normal |
| Labels/captions | 10-12px (text-[10px]/[11px]/[12px]) | Bold/Black (700-900) | UPPERCASE, tracking-widest |
| Code/terminal | 12-14px (text-[12px]/[13px]) | Monospace | - |

#### Text Style Conventions

- **Terminal-style labels:** Uppercase, tracking-widest, font-bold or font-black, small size (9-12px)
- **Technical labels** include prefixes like `WORKSPACE_`, `STATUS:`, `SYNC_DATE:`, `SHELL:`
- **Code/monospace styling:** Applied via `font-mono` class

### 2.3 Spacing System

- Uses Tailwind CSS default spacing scale (1 unit = 0.25rem = 4px)
- Common spacing values: `p-4` (16px), `px-4` (16px horizontal), `gap-4` (16px)
- Compact UI elements often use 8-12px padding

### 2.4 Visual Effects

| Effect | Implementation |
|--------|----------------|
| Glassmorphism | `backdrop-blur-md`, `bg-white/5`, `border-white/10` |
| Glow effects | `shadow-[0_0_8px_rgba(var(--accent),0.5)]` |
| Pulse animation | `animate-pulse`, `animate-pulse-slow` (slower) |
| Slide animations | `animate-slide-up`, `animate-fade-in` |
| Custom scrollbar | 10px width, semi-transparent thumb |
| Grid pattern background | `bg-grid-pattern` class with opacity overlay |

### 2.5 Shadows

```css
--shadow-vscode: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
```

Used extensively on cards, modals, and floating elements.

---

## 3. Routing Structure

**Router:** TanStack Router (file-based routing)

### Route Tree

```
__root
├── / (LandingPage - public landing)
├── /login (LoginView - authentication)
├── /register (RegisterView - new user registration)
├── /dashboard (DashboardView - project listing with VSCLayout)
├── /sprints (SprintsView)
├── /backlog (BacklogView)
├── /ai-chat (AIChatView - global AI chat)
├── /settings (SettingsView)
├── /profile (ProfileView)
└── /projects/$projectId (VSCLayout wrapper)
    ├── /projects/$projectId (redirects to /sprints)
    ├── /projects/$projectId/sprints (ProjectBoardView - Kanban board)
    ├── /projects/$projectId/backlog (backlog view)
    ├── /projects/$projectId/epics (epics/roadmap view)
    └── /projects/$projectId/ai-chat (project-specific AI chat)
```

### Navigation Structure

- **Two layout systems** exist in parallel:
  - `Layout.tsx` — Full VS Code-style with activity bar, sidebar, editor tabs, terminal panel, status bar
  - `VSCLayout.tsx` — Alternative VS Code-inspired layout with project explorer, bottom terminal panel, AI chat sidebar

---

## 4. Reusable UI Components

All base UI components are in `src/components/ui/`.

### 4.1 Button (`Button.tsx`)

**Variants:**

| Variant | Description |
|---------|-------------|
| `primary` | Blue accent background, white text, shadow |
| `ghost` | Transparent with hover effects |
| `outline` | Transparent with white border on hover |
| `danger` | Red background with glow shadow |

**Sizes:**

| Size | Padding | Font Size |
|------|---------|-----------|
| `sm` | `py-1.5 px-3` | 10px |
| `md` | `py-2.5 px-5` | 14px |
| `lg` | `py-3.5 px-8` | 16px |

**Props:**

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;       // Optional leading icon
  loading?: boolean;       // Shows spinner when true
}
```

**Usage Example:**

```tsx
import { Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Primary button with icon
<Button icon={Plus} variant="primary" size="md">New Task</Button>

// Danger button
<Button icon={Trash} variant="danger" size="sm">Delete</Button>

// Loading state
<Button loading={isSubmitting}>Saving...</Button>
```

### 4.2 Card (`Card.tsx`)

**Variants:**

| Variant | Style |
|---------|-------|
| `default` | `bg-vscode-sidebar`, border, `p-6` |
| `glass` | Glassmorphism effect via `glass-card` class |
| `outline` | Transparent background, `border-white/10` |

**Props:**

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'outline' | 'default';
  hoverEffect?: boolean;  // Adds scale and shadow on hover
}
```

### 4.3 Modal (`Modal.tsx`)

**Features:**
- Backdrop blur overlay
- Closes on Escape key press
- Click outside to close (via `e.stopPropagation`)
- Optional icon slot
- Title display
- Animated entrance (zoom-in + slide-up)

**Props:**

```typescript
interface ModalProps {
  isOpen: boolean;         // Controls visibility
  onClose: () => void;      // Callback when closing
  title: string;            // Modal title text
  children: React.ReactNode; // Modal content
  icon?: React.ReactNode;    // Optional icon
}
```

### 4.4 Utility: `cn()` Helper (`utils/cn.ts`)

A class name merger combining `clsx` and `tailwind-merge`. Used to combine conditional Tailwind classes safely.

```typescript
import { cn } from '@/utils/cn';

// Usage
<div className={cn(
  "base-class",
  isActive && "active-class",
  className
)} />
```

---

## 5. Layout Components

### 5.1 Layout (`Layout.tsx`)

A complete **VS Code-style application shell** with:

#### Activity Bar (Left, 48px wide)
- Vertical icon navigation
- Icons: Files (Explorer), Kanban (Board), AI (Copilot), Search, Git, Extensions
- Bottom icons: Profile, Settings, Logout
- Active indicator: Left-side blue border + full opacity

#### Sidebar / Explorer (Right of Activity Bar, 256px wide)
- Collapsible via toggle
- "EXPLORER: SCRUMHUB" header
- Collapsible sections (details/summary HTML pattern):
  - PROYECTOS (Projects list)
  - Active project section (when viewing a project)
  - DEPENDENCIAS (empty, placeholder)
- Upgrade Pro promotional card at bottom

#### Main Editor Area
- **Editor Tab Bar** — Shows current file/view with icon, close button, blue top border when active
- **Content Area** — Where the `<Outlet />` (route content) renders
- **Bottom Terminal Panel** — 200px height with tabs (Terminal, Problemas, Salida, Consola de Depuración)
- Terminal shows system logs with timestamps and color-coded sources

#### AI Quick Access Bubble (Magnetic Button)
- Floating button (bottom-right) that follows cursor with magnetic effect
- Opens right sidebar
- Shows "Consultar Copilot" label + keyboard shortcut (⌘K)

#### Right Sidebar (AI Copilot Panel, 384px wide)
- Toggleable panel with two tabs: **Copilot** (AI chat) and **Actividad** (activity feed)
- In Copilot tab: Avatar, AI greeting message, textarea for input
- In Activity tab: Real-time activity feed with socket.io updates

#### Status Bar (Bottom, 24px height, blue)
- Remote connection info
- Git branch indicator
- Theme toggle
- UTF-8 encoding indicator
- AI ready status

### 5.2 VSCLayout (`layout/VSCLayout.tsx`)

An alternative **VS Code-style layout** with a different structure:

#### Activity Bar (Left, 48px wide)
- Icons: LayoutGrid (Dashboard), Kanban (Board), Layers (Epics), FileCode (Backlog)
- Bottom: MessageSquare (AI toggle), Settings, User (Profile)
- Active state: White text + left blue border

#### Sidebar / Project Explorer (260px wide)
- "Explorer: Projects" header with collapse button
- Inline project creation form (toggle with Plus icon)
- Project list with expand/collapse chevron icons
- Active project highlighted with accent color

#### Main Editor Area
- **Dynamic Tab Bar** — Tabs change based on active project (Board, Backlog, Epics, AI Chat)
- Active tab has blue top border
- Route content renders via `<Outlet />`

- **Bottom Terminal Panel** — 200px, shows system logs with source-colored prefixes
  - Sources: `system` (green), `kanban` (pink/purple), `ai` (blue), `auth` (yellow)
  - Timestamps in 24-hour format
  - Blinking cursor at bottom

- **Status Bar** — Project name, AI chat toggle, encoding info

#### AI Chat Panel (Right, 340px, optional)
- Toggleable via activity bar or status bar button
- Full `ChatPanel` component embedded
- Header with "Scrum Assistant" label and close button

---

## 6. Views (Pages)

All views are in `src/views/`.

### 6.1 LandingPage (`routes/index.tsx`)

**Route:** `/` (public, no auth required)

**Purpose:** Public landing/marketing page

**Content:**
- Hero section with "ScrumHub AI" title (large, 5xl-7xl)
- "Next-Gen Agile Orchestration" badge with Zap icon
- Tagline about RAG integration and developer-first interface
- Two CTAs: "Get Started" (links to /login) and "Documentation"
- Three feature cards at bottom:
  - Native AI Agents (Bot icon)
  - Vectorized Memory (Cpu icon)
  - Local Isolation (Shield icon)

**Style:** Centered content, max-w-4xl, fade-in + slide-up animation

### 6.2 LoginView (`LoginView.tsx`)

**Route:** `/login`

**Purpose:** User authentication

**Layout:**
- Centered card on dark background
- VS Code-style title bar ("auth_session.sh — ScrumHub") with Terminal icon
- "User Authentication" heading + subtitle

**Form Fields:**
1. **Email Address** — Mail icon prefix, placeholder "name@scrumhub.ai"
2. **Security Token** — Lock icon prefix (password field), placeholder "••••••••"

**Features:**
- Error alert display (red, with AlertCircle icon)
- Loading state on button during submission
- Link to "/register" for new users
- Footer bar with "SECURE PROTOCOL v1.0.4" and timestamp

**Styling:** Uses `vsc-input` and `vsc-button` CSS classes

### 6.3 RegisterView (`RegisterView.tsx`)

**Route:** `/register`

**Purpose:** New user registration

**Layout:** Nearly identical to LoginView but with VS Code title "provision_user.sh — ScrumHub"

**Form Fields:**
1. **Username** — User icon prefix, placeholder "scrum_master_99"
2. **Email** — Mail icon prefix, placeholder "name@scrumhub.ai"
3. **Master Password** — Lock icon prefix

**Features:**
- Same error handling and loading states as Login
- Link back to "/login" for existing users

### 6.4 DashboardView (`DashboardView.tsx`)

**Route:** `/dashboard`

**Purpose:** List all user's projects/workspaces and create new ones

**Layout (VSCLayout-wrapped):**

#### Header (56px)
- "Workspace_Explorer" label with LayoutPanelLeft icon
- "NEW_WORKSPACE" button (blue, right side)

#### Main Content Area
- Grid layout (1 col mobile, 2 cols md+)
- Section label: "Active_Workspaces" with tracking-widest uppercase text

**Project Cards:**
- Each card shows:
  - 48x48 folder image thumbnail (rounded)
  - Project name (uppercase, bold)
  - Volume ID (first 8 chars, e.g., "VOL: abc12345...")
  - Description (line-clamp-2, 50% opacity text)
  - Hover-revealed footer: sync date + "ESTABLISH_CONNECTION" link with ChevronRight
  - Hover effect: border glows blue, image scales up slightly

**Empty State:**
- Centered layout with Rocket icon (in blue circle, bouncing)
- "Initialize Your First Workspace" heading
- "No data clusters detected..." message
- "GENERATE_WORKSPACE" button

**Create Project Modal:**
- Triggered by "NEW_WORKSPACE" button or empty state button
- Title: "GENERATE_WORKSPACE.SYS"
- Fields:
  - **Workspace_Name** — auto-generates slug from name
  - **Environment_Context** — textarea for AI context
  - **AI_Generation_Core** toggle — auto-provision epics & tasks
- Footer buttons: "ABORT" (ghost) and "INITIALIZE_WORKSPACE" (blue)
- Loading state: "PROCESSING..." text

**Footer Status Bar:**
- Left: SHELL: ACTIVE, ENGINE: GPT-4O-MINI
- Right: REGION: LATAM-01, SCHEMA: SYNCED (green)

### 6.5 ProjectBoardView (`ProjectBoardView.tsx`)

**Route:** `/projects/$projectId/sprints`

**Purpose:** Full Kanban board for a project with embedded AI copilot

**Layout:** No layout wrapper (uses its own flex layout)

#### Header (48px, sticky)
- Project name (uppercase) + Box icon
- Status badge: "STATUS: ACTIVE" with pulsing green dot
- Repository version label
- Right side buttons:
  - "AI_REPORT" — generates project analysis report
  - "NEW_TASK" — opens task creation modal

#### Main Kanban Area (3 Columns)
Uses `@hello-pangea/dnd` for drag-and-drop.

| Column | Label | Icon | Color |
|--------|-------|------|-------|
| Left | BACKLOG | Circle | Gray (`text-vscode-text/40`) |
| Middle | IN_DEVELOPMENT | Zap | Blue (`text-vscode-blue`) |
| Right | PRODUCTION_READY | CheckCircle2 | Green (`text-accent-green`) |

**Task Cards:**
- Blue left border (appears on hover)
- Top: Epic name / task ID
- Title: Bold, 11px
- Description: 2-line clamp, 50% opacity
- Footer (appears on hover): Assignee avatar + "Assignee" label + timestamp
- Dragging state: slight rotation (1deg), scale up, blue border + shadow

**Inline Task Creation:**
- Click "+" on any column header
- Shows inline form with title input + Add/Cancel buttons
- Submit creates task via `taskService.create()`

**AI Suggest Tasks:**
- "Suggest Tasks with AI" button (top-right)
- Calls `aiService.suggestTasks()` to generate tasks
- Shows loading spinner while generating

**Error Banner:**
- Slides down from top when task operations fail
- Red background with Terminal icon
- Shows error message with "×" close button

#### Right Sidebar — AI Copilot Panel (320px)
- Header: "AI_COPILOT_V2" with Sparkles icon + green online dot
- **Welcome message:** Blue-tinted box: "Project scope scanned. Use /analyze to see performance bottlenecks."
- **Chat history:** Scrollable message list
  - User messages: Blue background, right-aligned, "LOCAL_COMMANDER" label
  - AI messages: Dark background, left-aligned, "AI_Engine" label
  - Animated typing indicator: Three bouncing dots
- **Input bar:** Text input + Send button
- Context-aware chat via `projectService.chatWithProject()`

#### Task Creation Modal
- Title: "GENERATE_NEW_TASK.SYS"
- Fields:
  - Task_Title (required text input)
  - Description_Field (textarea)
  - Target_Epic (select dropdown, lists all epics in project)
- Footer: "ABORT" + "COMMIT_TASK" buttons

#### Report Modal (Full-Screen Overlay)
- Triggered by "AI_REPORT" button
- Blurred backdrop
- Header: "AI_STRATEGIC_DUMP_v1.0"
- Scrollable content area with pre-formatted report text
- Footer: "EXIT_REPORT" button

### 6.6 AIChatView (`AIChatView.tsx`)

**Route:** `/ai-chat`

**Purpose:** Full-page global AI chat interface (across all projects)

**Layout:**

#### Header (56px)
- Sparkles icon in purple-tinted circle
- "AI_Strategic_Engine" title (uppercase)
- Status badge: "Active_Node" (green) + Protocol version
- Right: Active project context badge ("SYNC_CONTEXT: {projectName}")

#### Chat Messages Area
- Scrollable, max-w-4xl centered
- Each message:
  - Role label: "INTELLIGENCE_CORE" (assistant) or "LOCAL_COMMANDER" (user)
  - Icon: Bot (blue) or User (purple)
  - Message bubble:
    - User: Blue-tinted, right-aligned, rounded-tr-none, shadow
    - Assistant: Dark background, left-aligned, rounded-tl-none
  - Metadata: "SENT: OK" or "GEN: 0.12s"
- Typing indicator: Three bouncing dots in a small box

#### Input Area (32px padding)
- Command chips (quick actions):
  - "ANALYZE_BACKLOG" — ListChecks icon
  - "SECURITY_SCAN" — ShieldAlert icon (turns red on hover)
- Main input: Full-width text field with ChevronRight icon prefix
- Send button appears on right when has content
- Disabled when no active project

#### Footer Status Bar
- Left: SHELL: AI_CMD, ENGINE: GPT-4O
- Right: JSON_STREAM: OK (blue), SYNC: STABLE (green)

---

## 7. State Management

### 7.1 React Query (Server State)

**Configuration:**

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      retry: 1,
    },
  },
});
```

**Key Query Keys:**
- `['projects']` — List all projects
- `['project', projectId]` — Single project with details (epics, tasks)
- `['activities', projectId]` — Activity logs

**Query Invalidation:** After mutations (`create`, `update`, `delete`), queries are invalidated to refetch fresh data.

### 7.2 Auth Context (`useAuth` hook)

**Location:** `src/hooks/useAuth.tsx`

**Provided Values:**
- `user` — Current user object or null
- `isLoading` — Auth initialization state
- `login(email, password)` — Login function
- `register(email, password, username)` — Registration function
- `logout()` — Logout function
- `isAuthenticated` — Boolean check

**Token Storage:** localStorage under `'token'` key

### 7.3 Theme Context (`ThemeContext`)

**Location:** `src/context/ThemeContext.tsx`

**Themes:** `'light' | 'dark' | 'system'`

**Behavior:**
- Persisted to localStorage as `'scrumhub-theme'`
- Applied via `data-theme` attribute on `<html>` element
- Listens to system preference changes when set to 'system'

### 7.4 Local Component State

- Modal visibility (`useState`)
- Form inputs (`useState`)
- Chat messages (`useState`)
- UI toggles (sidebar open/closed, chat panel visible, etc.)

---

## 8. Real-Time Features

### 8.1 Socket.io Integration (`useSocket` hook)

**Location:** `src/hooks/useSocket.ts`

**Events Emitted:**
- `join-project` — Join a project-specific room for updates

**Events Listened:**
- `task-updated` — Task status/priority changed
- `task-created` — New task created
- `activity-log` — New activity for feed

### 8.2 Real-Time Updates in ProjectBoardView

When a task is updated or created via socket:
1. `queryClient.setQueryData()` is called directly (optimistic, no refetch)
2. The Kanban board re-renders immediately with new data

### 8.3 Real-Time Activity Feed

**Location:** `ActivityFeed.tsx`

- Shows initial activities from API
- Listens for `activity-log` socket events
- Prepends new activities, keeps only last 50
- Activity types with icons:
  - `TASK_CREATED` — PlusCircle (blue)
  - `TASK_UPDATED` — CheckCircle (green)
  - `PROJECT_CREATED` — Activity (purple)
  - Default — AlertCircle (gray)

---

## 9. Key Interaction Patterns

### 9.1 Drag and Drop (Kanban)

**Library:** `@hello-pangea/dnd` (React DnD wrapper)

**Flow:**
1. User drags a task card
2. On drop: `onDragEnd` handler called
3. Optimistic UI update (task moves immediately)
4. API call to `taskService.updateStatus()`
5. On error: revert by re-fetching

### 9.2 Inline Task Creation

- Click "+" on column header to show inline form
- Form has title input + Add/Cancel buttons
- Submit creates task and adds to list
- Cancel hides form

### 9.3 Modal Pattern

- Trigger via button click sets `isOpen: true`
- Close via: × button, Escape key, backdrop click
- Used for: task creation, project creation, report display

### 9.4 Form Submission

- All forms use `useMutation` from React Query
- Loading state shown on button (spinner or text change)
- Error state shown in alert box
- Success: modal closes, list refreshes, form resets

### 9.5 AI Chat

- User sends message → immediately added to history (user message)
- Mutation triggered → loading indicator shown
- Response received → added to history
- Error → error message added as AI response

### 9.6 Magnetic Button

**Location:** `MagneticButton.tsx`

- Button position follows cursor within 100px radius
- Uses `force = 0.3` multiplier for subtle movement
- Smooth transition back to center on mouse leave

### 9.7 Theme Toggle

Three-way toggle: Light / Dark / System
- Circular button group in status bar
- Active state has blue background + shadow
- System mode listens to `prefers-color-scheme` media query

### 9.8 Easter Egg (Whimsy)

**Location:** `utils/whimsy.ts`

- Konami code triggers "AI Overdrive" mode
- Uses `systemLog()` to dispatch CustomEvents

---

## 10. CSS Custom Classes

These are defined in `src/index.css` and used throughout the application.

### Layout Classes

| Class | CSS |
|-------|-----|
| `.vsc-layout-grid` | `display: grid; height: 100vh; width: 100vw;` |

### Scrollbar

| Class | Style |
|-------|-------|
| `.custom-scrollbar` | 10px width, semi-transparent track and thumb |

### Input

| Class | Style |
|-------|-------|
| `.vsc-input` | Full-width dark input with accent border on focus |
| `.vsc-input-with-icon` | Input with extra left padding for icon |

### Button

| Class | Style |
|-------|-------|
| `.vsc-button` | Blue accent background, white text, hover effect |
| `.vsc-button-secondary` | Dark gray background, light text |

### Tab

| Class | Style |
|-------|-------|
| `.vsc-tab` | VS Code-style tab with gray text |
| `.vsc-tab.active` | Active tab with white text on dark background |

### Animation Classes

| Class | Effect |
|-------|--------|
| `.animate-pulse-slow` | Slower pulse animation |
| `.animate-slide-up` | Slide up from bottom |
| `.animate-fade-in` | Fade in entrance |

### Card Variants

| Class | Effect |
|-------|--------|
| `.glass-card` | Glassmorphism (blur + transparency) |
| `.bg-grid-pattern` | Grid background overlay |

---

## Summary: Component Reusability Map

```
Button
└── Used in: everywhere

Card
└── Used in: Dashboard cards, ActivityFeed items, modals

Modal
└── Used in: DashboardView (create project), ProjectBoardView (create task, report)

KanbanBoard
└── Used in: Layout sidebar navigation

ChatPanel
└── Used in: Layout (right sidebar), VSCLayout (AI panel), AIChatView

ActivityFeed
└── Used in: Layout (right sidebar tab)

MagneticButton
└── Used in: Layout (floating AI copilot trigger)

ThemeToggle
└── Used in: Layout (status bar)
```

---

## File Reference Index

| File | Line Count | Purpose |
|------|------------|---------|
| `src/index.css` | 103 | Global styles, CSS variables, custom classes |
| `src/components/Layout.tsx` | 426 | Full VS Code-style layout with all panels |
| `src/components/layout/VSCLayout.tsx` | 359 | Alternative VS Code layout |
| `src/views/DashboardView.tsx` | 222 | Project listing + create modal |
| `src/views/ProjectBoardView.tsx` | 417 | Kanban board + embedded AI chat |
| `src/views/AIChatView.tsx` | 175 | Full-page AI chat |
| `src/views/LoginView.tsx` | 106 | Login form |
| `src/views/RegisterView.tsx` | 117 | Registration form |
| `src/components/ui/Button.tsx` | 53 | Reusable button component |
| `src/components/ui/Card.tsx` | 38 | Reusable card component |
| `src/components/ui/Modal.tsx` | 48 | Reusable modal dialog |
| `src/components/kanban/KanbanBoard.tsx` | 267 | Drag-and-drop Kanban board |
| `src/components/ai/ChatPanel.tsx` | 95 | Reusable AI chat panel |
| `src/components/ActivityFeed.tsx` | 113 | Real-time activity log |
| `src/components/MagneticButton.tsx` | 51 | Magnetic hover effect button |
| `src/components/ThemeToggle.tsx` | 59 | Theme switcher (light/dark/system) |
| `src/hooks/useAuth.tsx` | - | Authentication context |
| `src/context/ThemeContext.tsx` | - | Theme provider |
| `src/services/*.ts` | - | API service layers |