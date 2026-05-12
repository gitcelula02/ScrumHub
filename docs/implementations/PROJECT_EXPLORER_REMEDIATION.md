# Project Explorer — Remediation Plan

**Source:** Review of `docs/features/PROJECT_EXPLORER.md` against `TRUTH.md`, `FRONTEND_ARCHITECTURE.md`, `FRONTEND_STYLING.md`, and `AGENTS.md`

**Date:** 2026-05-11

---

## Table of Contents

1. [Critical Fixes](#1-critical-fixes)
2. [Architecture & Separation of Concerns](#2-architecture--separation-of-concerns)
3. [Spec & Documentation Fixes](#3-spec--documentation-fixes)
4. [Implementation Checklist](#4-implementation-checklist)

---

## 1. Critical Fixes

### 1.1 Remove Duplicate Hooks in `useUserFolders.ts`

**Problem:** `src/features/project-explorer/hooks/useUserFolders.ts` duplicates `useCreateFolder`, `useUpdateFolder`, `useDeleteFolder` already defined in `useExplorerProjects.ts`. It calls `explorerService.getFolderTree()` without required `userId`, and uses wrong query keys `["explorer", "folders"]` instead of hierarchical `["user", userId, "explorer", "folders"]`.

**Action:**
- Delete `useUserFolders.ts` entirely
- Update `index.ts` barrel to not export from it
- All consumers of folder mutations already use `useExplorerProjects.ts` — verify and update any stale imports

**Files:**
- `DELETE frontend/src/features/project-explorer/hooks/useUserFolders.ts`
- `EDIT frontend/src/features/project-explorer/index.ts` — remove re-export

---

### 1.2 Implement `registerEntities()` Color Chain

**Problem:** The entity color chain defined in `AGENTS.md` and `FRONTEND_ARCHITECTURE.md:796-810` requires hooks to call `registerEntities()` so colors are cached in `ThemeRegistry`. Currently `registerEntities` doesn't exist anywhere, and hooks bypass the cache by passing hex directly to components.

**Action:**
1. Add `registerEntities` method to `ThemeRegistry` in `src/store/ThemeRegistry.tsx`
2. Call `registerEntities` in `useExplorerProjects` and `usePinnedProjects` when data loads:

```ts
// In hooks/useExplorerProjects.ts — after data is fetched
useEffect(() => {
  if (data?.data) {
    const allProjects = extractAllProjects(data.data);
    registerEntities(allProjects.map(p => ({ id: p.id, color: p.color })));
  }
}, [data]);
```

3. Keep `useEntityTheme(project.color)` calls in `ProjectNode` and `WelcomePanel` — they will now read from the cache.

**Files:**
- `EDIT frontend/src/store/ThemeRegistry.tsx` — add `registerEntities`
- `EDIT frontend/src/features/project-explorer/hooks/useExplorerProjects.ts` — call in hooks
- `EDIT frontend/src/features/project-explorer/hooks/useExplorerSearch.ts` — call on search results

---

### 1.3 Fix Non-Existent CSS Variables

**Problem:** 5 components use `bg-sidebar-active` and `hover:bg-sidebar-hover` which are **not defined** in `src/styles/globals.css`. The defined equivalents are `bg-list-active` and `hover:bg-list-hover`.

**Replacements:**
| Current (broken) | Correct |
|---|---|
| `bg-sidebar-active` | `bg-list-active` |
| `hover:bg-sidebar-hover` | `hover:bg-list-hover` |

**Files to edit (5 occurences):**
- `src/features/project-explorer/components/ViewSizeToggle.tsx:33`
- `src/features/project-explorer/components/ProjectNode.tsx:42`
- `src/features/project-explorer/components/PinnedProjects.tsx:35`
- `src/features/project-explorer/components/FolderNode.tsx:56`
- `src/features/project-explorer/components/CreateProjectModal.tsx:127`

---

### 1.4 Remove Hardcoded Hex from Spec Document

**Problem:** `docs/features/PROJECT_EXPLORER.md` contains hardcoded values (`rgba(255,255,255,0.04)`, `#0EA5E9`, `rgba(14,165,233,0.15)`) contradicting `FRONTEND_STYLING.md:10`.

**Action:** Replace hardcoded styling descriptions with references to the CSS variable system:

```diff
- - Hover: `background: rgba(255,255,255,0.04)`
+ - Hover: `hover:bg-list-hover` (CSS variable)

- - Selected: `background: rgba(14,165,233,0.15); border-left: 2px solid #0EA5E9;`
+ - Selected: `bg-list-active border-l-2 border-primary` (CSS variables)
```

**Files:**
- `EDIT docs/features/PROJECT_EXPLORER.md`

---

## 2. Architecture & Separation of Concerns

### 2.1 Add Page Tier for Three-Tier Rule

**Problem:** Route `src/routes/app/projects/index.tsx` renders `<ExplorerView />` directly, bypassing the Page tier.

**Action:**
1. Create `src/pages/ProjectsPage.tsx`:
```tsx
export function ProjectsPage() {
  return <ExplorerView />;
}
```
2. Update route to use page:
```tsx
export const Route = createFileRoute("/app/projects/")({
  component: ProjectsPage,
});
```

**Files:**
- `CREATE src/pages/ProjectsPage.tsx`
- `EDIT src/routes/app/projects/index.tsx`

---

### 2.2 Implement Project Context Menu

**Problem:** `ProjectNode` has no right-click context menu despite the spec defining: Open, Rename, Move to..., Archive, Delete.

**Action:** Add `ContextMenu` wrapper to `ProjectNode.tsx` following the existing pattern in `FolderNode.tsx`:

```tsx
<ContextMenu>
  <ContextMenuTrigger asChild>
    {/* existing project row */}
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onClick={handleOpen}>Open</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>Rename</ContextMenuItem>
    <ContextMenuItem>Move to...</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>Archive</ContextMenuItem>
    <ContextMenuItem className="text-destructive">Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

**Files:**
- `EDIT src/features/project-explorer/components/ProjectNode.tsx`

---

### 2.3 Pass Folder Context to CreateProjectModal

**Problem:** Projects are always created at root level. The UI should pass the currently active/selected `folderId` so projects are created in the right folder.

**Action:**
- Pass `currentFolderId` from `ExplorerSidebar` state to `CreateProjectModal`
- Send `folder_id` in the create request payload

**Files:**
- `EDIT src/features/project-explorer/components/ExplorerSidebar.tsx`
- `EDIT src/features/project-explorer/components/CreateProjectModal.tsx`

---

### 2.4 Make WelcomePanel Progress Dynamic

**Problem:** Hardcoded `width: "75%"` and `"75% complete"` in `WelcomePanel.tsx`.

**Action:** Replace with actual progress. Either:
- Accept a `completionPercentage` prop per project, or
- Compute from the project's task data if available, or
- Use a simple heuristic (e.g., projects with `status: "completed"` = 100%, `active` = 50%)

**Files:**
- `EDIT src/features/project-explorer/components/WelcomePanel.tsx`

---

### 2.5 Add Mock Data Fallback to Explorer Service

**Problem:** `explorerService.ts` has no mock fallback, violating `FRONTEND_ARCHITECTURE.md:617-627`.

**Action:** Wrap each method with try/catch + mock fallback:

```ts
async getFolderTree(userId: string): Promise<FolderTreeResponse> {
  try {
    return await apiClient.get<FolderTreeResponse>(`/users/${userId}/folders`);
  } catch {
    return getMockFolderTree(userId);
  }
}
```

**Files:**
- `EDIT src/features/project-explorer/services/explorerService.ts`

---

### 2.6 Add `ExplorerView` Navigation on Project Select

**Problem:** When a project is selected in `ExplorerView`, it shows "Loading project..." instead of navigating to the project workspace.

**Action:** Navigate to `/app/projects/$projectId/dashboard` when a project is selected, matching the spec's "Click project → Opens project workspace" flow.

**Files:**
- `EDIT src/features/project-explorer/components/ExplorerView.tsx`

---

## 3. Spec & Documentation Fixes

### 3.1 Fix SQL Nesting Level Constraint

**Problem:** `CONSTRAINT max_nesting_depth CHECK (nest_level <= 5)` references non-existent column `nest_level`.

**Action:** This constraint requires computed column or trigger — remove the inline CHECK and add a note that nesting depth is enforced at the application layer, or add `nest_level` as a computed/trigger-updated column.

**SQL fix:**
```sql
-- Option A: Remove constraint (enforce in app)
-- CONSTRAINT max_nesting_depth CHECK (nest_level <= 5)

-- Option B: Add nest_level column with trigger to compute it
ALTER TABLE user_folders ADD COLUMN nest_level INTEGER NOT NULL DEFAULT 0;
```

**Files:**
- `EDIT docs/features/PROJECT_EXPLORER.md`

---

### 3.2 Fix Font Specification

**Problem:** "Monospace font for explorer labels (JetBrains Mono)" contradicts `AGENTS.md` which reserves JetBrains Mono for code.

**Action:** Change to:
- Explorer labels → `text-[13px] font-sans` (DM Sans)
- Ticket numbers/IDs → `text-[11px] font-mono` (JetBrains Mono)

**Files:**
- `EDIT docs/features/PROJECT_EXPLORER.md`

---

## 4. Implementation Checklist

### Priority: High (runtime errors / broken UX)

- [ ] **1.1** Delete `useUserFolders.ts` and update barrel exports
- [ ] **1.2** Add `registerEntities` to ThemeRegistry + call from explorer hooks
- [ ] **1.3** Replace `bg-sidebar-active` → `bg-list-active` and `hover:bg-sidebar-hover` → `hover:bg-list-hover` in all 5 files
- [ ] **1.4** Update spec doc to use CSS variable references instead of hardcoded hex

### Priority: Medium (architecture violations)

- [ ] **2.1** Create `ProjectsPage.tsx` page component and wire route
- [ ] **2.2** Add context menu to `ProjectNode.tsx`
- [ ] **2.3** Pass folder context to `CreateProjectModal`
- [ ] **2.4** Make WelcomePanel progress dynamic
- [ ] **2.5** Add mock data fallback to `explorerService.ts`
- [ ] **2.6** Add navigation on project select in `ExplorerView`

### Priority: Low (spec cleanup)

- [ ] **3.1** Fix phantom SQL column constraint
- [ ] **3.2** Fix font specification in doc
