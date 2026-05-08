# Backend Support Requirements

This document tracks the data needs for each frontend view that requires backend API support. When a view needs mock/hardcoded data, the missing backend functionality is documented here for future implementation.

---

## Projects Dashboard (`/app/projects`)

### Completed
- [x] Projects list endpoint: `GET /api/projects` — returns `Project[]` directly (array, not wrapped)
- [x] Service consolidation: `api.ts` now imports patched `projectsService` from `services/projectsService.ts`
- [x] `projectQuery` properly handles null (throws `Error` for 404 behavior)

### Implemented (Frontend Mock)
| Function | Current Implementation | Backend Requirement |
|----------|----------------------|---------------------|
| `getLeadName(ownerId)` | Hardcoded mapping from `owner` ID → display name | Add `GET /api/users` endpoint or include user details in project response |
| `getTaskCount(projectId)` | `Math.random() * 12 + 1` | Add task count aggregation to project response |
| `getEpicCount(projectId)` | `Math.random() * 4 + 1` | Add epic count aggregation (distinct `epic` field on tasks per project) |

### Recommended Backend Changes

**Option A — Add to Project Response:**
```json
// GET /api/projects/:id or GET /api/projects
{
  "id": "1",
  "name": "ScrumHub Platform",
  "lead": { "id": "1", "name": "Carlos Administrator", "avatar": "..." },
  "taskCount": 24,
  "epicCount": 5,
  ...
}
```

**Option B — Separate Aggregation Endpoints:**
```
GET /api/projects/:id/stats  → { taskCount, epicCount, memberCount, ... }
GET /api/users              → [{ id, name, avatar }, ...]
```

---

## Frontend Infrastructure Gaps

The following features described in `AGENTS.md` are **now implemented**:

| Gap | Status | Implementation |
|-----|--------|----------------|
| `ThemeRegistry` | ✅ **Completed** | `src/store/ThemeRegistry.tsx` — `EntityThemeRegistryProvider` with `getTheme(entityId, color)` function |
| `useEntityTheme` | ✅ **Completed** | `src/hooks/useEntityTheme.ts` — accepts `(entityId, color)` and returns `React.CSSProperties` with `--entity-*` vars |
| `generateEntityTheme` | ✅ **Completed** | `src/utils/themeUtils.ts` — OKLCH-based color math for sober variants |

**Current Flow:**
```
useEntityTheme(project.id, project.color)
  ↓
EntityThemeRegistry.getTheme() — O(1) cache lookup
  ↓
Cache miss → generateEntityTheme(hex) → compute OKLCH variants
  ↓
Cache result → return CSSProperties with --entity-solid/bg/border/fg
  ↓
Container style={theme} injects vars to subtree
```

---

## Architecture Decisions

### Duplicate Service Consolidation (2026-05-07)

**Problem**: The `projects` feature had two service definitions:
- `services/projectsService.ts` (patched to handle both wrapped/unwrapped responses)
- `api.ts` (had local `projectService` that was UNPATCHED — caused "Query data cannot be undefined")

**Solution**: Consolidated to single source of truth:
- `api.ts` now imports and uses `projectsService` from `./services/projectsService.ts`
- `projectQuery` wraps the call with null checking and throws for 404 behavior
- Removed redundant `projectService` definition from `api.ts`

**Rule**: Each feature should have ONE service file in `services/`. `api.ts` only defines query options (TanStack Query), not service implementations.

---

## Future Views to Document

Add new views here as they are implemented:
- [ ] Task Detail view — needs `/api/tasks/:id` with full comments/attachments
- [ ] Sprint view — needs `/api/sprints` and `/api/sprints/:id`
- [ ] Backlog view — needs `/api/tasks?project_id=X&sprint_id=empty`
- [ ] Board view — needs `/api/statuses?project_id=X`
- [ ] Chat view — needs `/api/channels?project_id=X`
- [ ] Quest Tree view — needs hierarchical task structure
- [ ] Reports/Analytics — needs aggregation endpoints

---

*Last updated: 2026-05-07*

*Updated 2026-05-07: Added Frontend Infrastructure Gaps section documenting missing ThemeRegistry, registerEntities(), and useEntityTheme computation. Added Architecture Decisions section documenting duplicate service consolidation.*