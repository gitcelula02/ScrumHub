# ScrumHub — Missing Backend Endpoints

This document lists all API endpoints **used or required by the frontend** that are **not yet implemented** in the backend (`backend/routes/`).

---

## Current Registered Routes

| Method | Path                        | File                  |
|--------|-----------------------------|-----------------------|
| POST   | /api/auth/login             | routes/auth.js        |
| POST   | /api/auth/register          | routes/auth.js        |
| POST   | /api/auth/logout            | routes/auth.js        |
| GET    | /api/auth/me                | routes/auth.js        |
| GET    | /api/auth/users             | routes/auth.js        |
| GET    | /api/auth/users/:id         | routes/auth.js        |
| PUT    | /api/auth/users/:id         | routes/auth.js        |
| GET    | /api/projects/all           | routes/projects.js    |
| GET    | /api/projects/:id           | routes/projects.js    |
| POST   | /api/projects               | routes/projects.js    |
| PUT    | /api/projects/:id           | routes/projects.js    |
| DELETE | /api/projects/:id           | routes/projects.js    |
| POST   | /api/projects/:id/members   | routes/projects.js    |
| GET    | /api/tasks                  | routes/tasks.js       |
| GET    | /api/tasks/my-tasks         | routes/tasks.js       |
| GET    | /api/tasks/stats            | routes/tasks.js       |
| GET    | /api/tasks/project/:id      | routes/tasks.js       |
| GET    | /api/tasks/:id              | routes/tasks.js       |
| POST   | /api/tasks                  | routes/tasks.js       |
| PUT    | /api/tasks/:id              | routes/tasks.js       |
| DELETE | /api/tasks/:id              | routes/tasks.js       |
| POST   | /api/tasks/:id/comments     | routes/tasks.js       |
| POST   | /api/ai/chat                | routes/ai.js          |
| POST   | /api/ai/check-alerts        | routes/ai.js          |

---

## ❌ Missing Endpoints

### Epics (Backlog Feature)

The `backlogService.js` calls the following endpoints that **do not exist** in the backend:

| Method | Path                                    | Used By                        |
|--------|-----------------------------------------|-------------------------------|
| GET    | `/api/projects/:projectId/epics?include=tasks` | `backlogService.getEpicsWithTasks()` |
| POST   | `/api/projects/:projectId/epics`        | `backlogService.createEpic()`  |
| PATCH  | `/api/epics/:epicId`                    | `backlogService.updateEpic()`  |
| POST   | `/api/epics/:epicId/tasks`              | `backlogService.createTask()`  |
| PATCH  | `/api/tasks/:taskId`                    | `backlogService.updateTask()` (PATCH not PUT) |

**Required backend work:**
- Add `backend/routes/epics.js` with CRUD for epics under a project
- Epics should support `?include=tasks` query param to return nested tasks
- Register under `app.use('/api/projects', epicRoutes)` or dedicated epic router

---

### Sprints Feature

The `sprintService.js` calls the following endpoints that **do not exist**:

| Method | Path                                       | Used By                          |
|--------|--------------------------------------------|----------------------------------|
| GET    | `/api/projects/:projectId/sprints`         | `sprintService.getByProject()`   |
| POST   | `/api/projects/:projectId/sprints`         | `sprintService.create()`         |
| PUT    | `/api/sprints/:sprintId`                   | `sprintService.update()`         |
| POST   | `/api/sprints/:sprintId/tasks`             | `sprintService.assignTasks()`    |

**Required backend work:**
- Add `backend/routes/sprints.js` with Sprint CRUD
- Sprint model: `{ id, projectId, name, startDate, endDate, status, tasks[] }`
- Register under `app.use('/api/projects', sprintRoutes)` and `app.use('/api/sprints', ...)`

---

### Calendar Feature

The `calendarService.js` uses `GET /api/tasks/project/:projectId` which exists.
However, for filtered calendar queries (by month/date range) the following would be optimal:

| Method | Path                                                      | Notes                            |
|--------|-----------------------------------------------------------|----------------------------------|
| GET    | `/api/tasks/project/:projectId?from=YYYY-MM-DD&to=YYYY-MM-DD` | Optional query filter by date range |

**Current behavior:** The frontend fetches ALL project tasks and filters by `dueDate` client-side. This is acceptable for small projects but should be moved server-side for performance.

---

### Chat / WebSocket (Future)

| Protocol | Path                          | Notes                                  |
|----------|-------------------------------|----------------------------------------|
| WS       | `/ws/projects/:projectId/chat` | Real-time chat messages                |
| GET      | `/api/projects/:projectId/messages` | Chat history pagination          |
| POST     | `/api/projects/:projectId/messages` | Send a message                   |

**Current behavior:** Chat is layout-only with mock data. No real-time connection is established.

---

## Priority Order for Backend Implementation

1. **Epics** — Backlog is the core feature and currently non-functional
2. **Sprints** — Required for Sprint view and project stats
3. **Calendar date filter** — Optional optimization
4. **Chat/WebSocket** — Future phase
