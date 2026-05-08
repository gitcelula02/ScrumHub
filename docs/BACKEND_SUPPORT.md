# Backend Support Requirements

This document tracks the data needs for each frontend view that requires backend API support. When a view needs mock/hardcoded data, the missing backend functionality is documented here for future implementation.

---

## Projects Dashboard (`/app/projects`)

### Completed
- [x] Projects list endpoint: `GET /api/projects` — returns `Project[]` directly (array, not wrapped)

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

The following features described in `AGENTS.md` are **not yet implemented** and block proper entity color handling:

| Gap | Description | Impact |
|-----|-------------|--------|
| `ThemeRegistry` | Context provider that caches computed CSS variables per entity color | ProjectCard uses inline `style={{ backgroundColor }}` instead of `--entity-*` vars |
| `registerEntities()` | Function to register entities with their colors for ThemeRegistry | Entity colors not properly isolated per-project |
| `useEntityTheme(hex)` | Hook that computes `--entity-bg`, `--entity-fg`, `--entity-border`, `--entity-solid` from hex | Current `useEntityTheme` only returns fixed tokens, not computed values |

### Required Implementation (Future)

```typescript
// src/store/ThemeRegistry.tsx
// 1. Build entity theme from hex color
// 2. Inject --entity-* CSS variables via inline style
// 3. Cache computed themes per entity id

// src/hooks/useEntityTheme.ts
// Update to accept hex color and compute actual entity CSS variables
export const useEntityTheme = (hexColor: string) => {
  // Compute and return { --entity-bg, --entity-fg, --entity-border, --entity-solid }
}
```

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

*Updated 2026-05-07: Added Frontend Infrastructure Gaps section documenting missing ThemeRegistry, registerEntities(), and useEntityTheme computation*