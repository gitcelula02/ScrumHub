# ScrumHub — API Endpoints Specification

This document defines all API endpoints for the ScrumHub backend. Based on the ERD structure and designed for optimization, caching, and scalability.

---

## Table of Contents

1. [Conventions & Patterns](#conventions--patterns)
2. [Authentication](#authentication)
3. [Users](#users)
4. [Projects](#projects)
5. [Backlogs (Multi-Backlog)](#backlogs-multi-backlog)
6. [Tasks (Epic, Story, Task, Subtask)](#tasks-epic-story-task-subtask)
7. [Sprints (Simultaneous)](#sprints-simultaneous)
8. [Mini-Sprints](#mini-sprints)
9. [Sprint Groups](#sprint-groups)
10. [Status (Kanban)](#status-kanban)
11. [Chatroom & Channels](#chatroom--channels)
12. [Messages](#messages)
13. [Voice Sessions](#voice-sessions)
14. [Daily Standups](#daily-standups)
15. [Reports (Report Hub)](#reports-report-hub)
16. [Retrospectives (Legacy)](#retrospectives-legacy)
17. [Triggers (Inter-Backlog Automation)](#triggers-inter-backlog-automation)
18. [Task Links](#task-links)
19. [Canvases (Free Board)](#canvases-free-board)
20. [Project Templates](#project-templates)
21. [Settings (Polymorphic)](#settings-polymorphic)
22. [AI Chat & RAG](#ai-chat--rag)
23. [Subscriptions & Credits](#subscriptions--credits)
24. [API Keys (Vault)](#api-keys-vault)
25. [Notifications](#notifications)
26. [Priority Order](#priority-order-for-implementation)

---

## Conventions & Patterns

### URL Structure
```
/api/{resource}
/api/{resource}/{id}
/api/{parent}/{parentId}/{child}
/api/{parent}/{parentId}/{child}/{childId}
```

### HTTP Methods
| Method | Purpose |
|--------|---------|
| GET | Retrieve (single or list) |
| POST | Create |
| PUT | Full update |
| PATCH | Partial update |
| DELETE | Remove |

### Query Parameters
| Param | Purpose |
|-------|---------|
| `?include=rel1,rel2` | Include related resources (JOIN) |
| `?fields=field1,field2` | Sparse fieldsets |
| `?limit=20&offset=0` | Pagination (offset-based) |
| `?cursor=xyz` | Cursor-based pagination (messages) |
| `?from=YYYY-MM-DD&to=YYYY-MM-DD` | Date range filtering |
| `?status_id=5` | Filter by status |
| `?priority=high` | Filter by priority |
| `?sprint_id=3` | Filter by sprint |
| `?type=epic` | Filter by task type |
| `?assignee_id=7` | Filter by assignee |
| `?parent_id=null` | Filter root items only |
| `?read=false` | Filter notifications by read state |

### Response Format
```json
{
  "data": { ... },
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "next_cursor": "abc123"
  }
}
```

### Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [{ "field": "email", "message": "Invalid format" }]
  }
}
```

### Caching Strategy
| Resource | Cache-Control | ETag |
|----------|---------------|------|
| Projects | 5 min | Yes |
| Tasks (list) | 2 min | Yes |
| Task (single) | 1 min | Yes |
| Stats | 60 sec | No |
| Messages | No cache | No |
| AI responses | No cache | No |

### Rate Limiting
| Endpoint Group | Limit |
|----------------|-------|
| General API | 100 req/min |
| AI endpoints | 10 req/min |
| File uploads | 20 req/min |
| Auth endpoints | 10 req/min (5 min window) |

---

## Authentication

### POST /api/auth/login
**Request:** `{ "email": "user@example.com", "password": "plaintext" }`
**Response:** `200`
```json
{
  "data": {
    "token": "jwt_token_here",
    "user": { "id": 1, "username": "john", "email": "user@example.com", "avatar_url": "..." }
  }
}
```
**is_implemented:** true

### POST /api/auth/register
**Request:** `{ "username": "john", "email": "user@example.com", "password": "plaintext" }`
**Response:** `201`
**is_implemented:** true

### POST /api/auth/logout
**Response:** `204`
**is_implemented:** true

### GET /api/auth/me
**Response:** `200`
```json
{
  "data": {
    "id": 1, "username": "john", "email": "user@example.com",
    "avatar_url": "...", "default_language": "en", "created_at": "..."
  }
}
```
**is_implemented:** true

---

## Users

### GET /api/users
Query params: `?search=john&limit=20&offset=0`
**Response:** `200`
```json
{
  "data": [{ "id": 1, "username": "john", "email": "...", "avatar_url": "..." }],
  "meta": { "total": 50, "limit": 20, "offset": 0 }
}
```
**is_implemented:** true

### GET /api/users/:id
**Response:** `200`
**is_implemented:** true

### PUT /api/users/:id
**Request:** `{ "username": "john Updated", "avatar_url": "...", "default_language": "es" }`
**is_implemented:** true

### GET /api/users/:id/scrum-roles
**Response:** `200`
```json
{ "data": [
  { "id": 1, "role_type": "developer", "specialization": "frontend", "is_primary": true },
  { "id": 2, "role_type": "qa", "is_primary": false }
]}
```
**is_implemented:** true

### POST /api/users/:id/scrum-roles
**Request:** `{ "role_type": "developer", "specialization": "react", "is_primary": true }`
**is_implemented:** true

### DELETE /api/users/:id/scrum-roles/:roleId
**is_implemented:** true

---

## Projects

### GET /api/projects/all
**Response:** `200`
```json
{
  "data": [
    { "id": 1, "name": "ScrumHub", "color": "#3B6D11", "status": "active", "members_count": 5 }
  ]
}
```
**is_implemented:** true

### GET /api/projects/:id
Query params: `?include=members,stats`
**Response:** `200`
**is_implemented:** true

### POST /api/projects
**Request:** `{ "name": "New Project", "description": "...", "color": "#8B5CF6" }`
**is_implemented:** true

### PUT /api/projects/:id
**Request:** Same as POST
**is_implemented:** true

### DELETE /api/projects/:id
**Response:** `204`
**is_implemented:** true

### GET /api/projects/:id/members
**Response:** `200`
```json
{
  "data": [
    { "id": 1, "user_id": 5, "scrum_role": "developer", "is_admin": false, "joined_at": "...", "user": { "id": 5, "username": "...", "avatar_url": "..." } }
  ]
}
```
**is_implemented:** true

### POST /api/projects/:id/members
**Request:** `{ "user_id": 5, "scrum_role": "developer", "is_admin": false }`
**is_implemented:** true

### PUT /api/projects/:id/members/:userId
**Request:** `{ "scrum_role": "qa", "is_admin": true }`
**is_implemented:** true

### DELETE /api/projects/:id/members/:userId
**Response:** `204`
**is_implemented:** true

### GET /api/projects/:id/stats
**Response:** `200`
```json
{
  "data": {
    "total_tasks": 42,
    "completed_tasks": 15,
    "in_progress_tasks": 10,
    "pending_tasks": 12,
    "overdue_tasks": 5,
    "completion_percentage": 35.7,
    "total_backlogs": 3,
    "active_sprints": 1,
    "total_members": 8,
    "unread_messages": 12
  }
}
```
**is_implemented:** true

### GET /api/projects/:projectId/sections
Get all custom sections for project.
**Response:** `200`
```json
{
  "data": [
    { "id": "section-uuid-1", "key": "vision", "value": "Our vision...", "order_index": 0, "created_at": "...", "updated_at": "..." },
    { "id": "section-uuid-2", "key": "goals", "value": "## Goals\n- Goal 1", "order_index": 1, "created_at": "...", "updated_at": "..." }
  ]
}
```
**is_implemented:** true

### POST /api/projects/:projectId/sections
Create a new custom section.
**Request:**
```json
{ "key": "vision", "value": "Our vision is to...", "order_index": 0 }
```
**Response:** `201`
```json
{
  "data": { "id": "new-section-uuid", "key": "vision", "value": "Our vision is to...", "order_index": 0, "created_at": "...", "updated_at": "..." }
}
```
**is_implemented:** true

### PATCH /api/projects/:projectId/sections/:sectionId
Update section content or order.
**Request:** `{ "key": "mission", "value": "Updated mission...", "order_index": 1 }`
**Response:** `200`
**is_implemented:** true

### DELETE /api/projects/:projectId/sections/:sectionId
**Response:** `204`
**is_implemented:** true

### PATCH /api/projects/:projectId/sections/reorder
Reorder sections by providing ordered array of section IDs.
**Request:** `{ "section_ids": ["section-2", "section-1", "section-3"] }`
**Response:** `200`
**is_implemented:** true

### GET /api/projects/:projectId/ai-usage
Get project AI spending aggregated by API provider.
**Response:** `200`
```json
{
  "data": {
    "providers": [
      { "provider": "deepseek", "cost": 2.45, "model": "deepseek-chat" },
      { "provider": "openai", "cost": 0.85, "model": "gpt-4o-mini" }
    ],
    "total_cost": 3.30,
    "credits_remaining": 42.50,
    "credits_depleted": false
  }
}
```

---

## Backlogs (Multi-Backlog)

### GET /api/projects/:projectId/backlogs
Get all backlogs for a project.
**Response:** `200`
```json
{
  "data": [
    { "id": 1, "name": "Development", "type": "development", "color": "#3B82F6", "order_index": 0, "is_default": true },
    { "id": 2, "name": "QA/Testing", "type": "qa_testing", "color": "#10B981", "order_index": 1, "is_default": false }
  ]
}
```
**is_implemented:** false

### POST /api/projects/:projectId/backlogs
Create a new backlog.
**Request:** `{ "name": "Development Backlog", "type": "development", "description": "...", "color": "#3B82F6" }`
**is_implemented:** false

### GET /api/backlogs/:backlogId
Get backlog details.
**is_implemented:** false

### PATCH /api/backlogs/:backlogId
Update backlog.
**Request:** `{ "name": "...", "color": "...", "order_index": 2 }`
**is_implemented:** false

### DELETE /api/backlogs/:backlogId
Soft delete backlog.
**Response:** `204`
**is_implemented:** false

### PATCH /api/backlogs/:backlogId/reorder
Reorder backlog position.
**Request:** `{ "order_index": 0 }`
**is_implemented:** false

### GET /api/backlogs/:backlogId/tasks
Get tasks in backlog.
**Response:** `200`
**is_implemented:** false

### GET /api/backlogs/:backlogId/boards
Get boards linked to backlog.
**Response:** `200`
**is_implemented:** false

---

## Backlog Types

### GET /api/backlog-types
List all registered backlog types for the system (used when backlog type is "custom").
**Response:** `200`
```json
{
  "data": [
    { "id": 1, "name": "Documentation", "description": "Docs and technical writing tasks" },
    { "id": 2, "name": "Bug Fixing", "description": "Bug reports and hotfixes" }
  ]
}
```
**is_implemented:** false

### POST /api/backlog-types
Create a new backlog type.
**Request:** `{ "name": "Documentation", "description": "Docs and technical writing tasks" }`
**Response:** `201`
```json
{
  "data": { "id": 3, "name": "Documentation", "description": "Docs and technical writing tasks" }
}
```
**is_implemented:** false

### DELETE /api/backlog-types/:id
Delete a backlog type.
**Response:** `204`
**is_implemented:** false

---

## Tasks (Epic, Story, Task, Subtask)

All task types use the same endpoint — `type` field distinguishes them.

### GET /api/tasks
Query params: `?project_id=1&sprint_id=3&status_id=5&priority=high&type=epic&assignee_id=7&parent_id=null&include=assignees,comments,acceptance_criteria&limit=50&offset=0`

**Response:** `200`
```json
{
  "data": [
    {
      "id": 42,
      "project_id": 1,
      "backlog_id": 1,
      "parent_id": null,
      "sprint_id": 3,
      "type": "epic",
      "title": "User Authentication",
      "description": "...",
      "priority": "high",
      "status_id": 2,
      "index": 1,
      "due_date": "2024-07-15",
      "created_by_user_id": 1,
      "created_at": "...",
      "updated_at": "...",
      "assignees": [...],
      "comments_count": 5,
      "subtasks_count": 3
    }
  ],
  "meta": { "total": 150, "limit": 50, "offset": 0 }
}
```
**is_implemented:** true

### GET /api/tasks/my-tasks
Returns tasks where current user is assignee. Query params: `?project_id=1`
**is_implemented:** true

### GET /api/tasks/:id
Query params: `?include=assignees,comments,acceptance_criteria,attachments,dependencies,parent,subtasks,backlog`
**Response:** `200`
**is_implemented:** true

### POST /api/tasks
**Request:**
```json
{
  "project_id": 1,
  "backlog_id": 1,
  "parent_id": null,
  "sprint_id": 3,
  "type": "epic",
  "title": "New Epic",
  "description": "...",
  "priority": "high",
  "status_id": 1,
  "due_date": "2024-07-15"
}
```
**is_implemented:** true

### PUT /api/tasks/:id
Full update — all fields required.
**is_implemented:** true

### PATCH /api/tasks/:id
Partial update — only changed fields.
**is_implemented:** true

### PATCH /api/tasks/:id/status
Optimized for drag-drop. Debounce client-side 300ms.
**Request:** `{ "status_id": 5 }`
**Response:** `200` — returns updated task with subtasks updated if parent moved.
**is_implemented:** true

### DELETE /api/tasks/:id
**Response:** `204`
**is_implemented:** true

### GET /api/tasks/:id/subtasks
Recursive tree of all nested subtasks.
**Response:** `200`
```json
{
  "data": [
    {
      "id": 55,
      "title": "Subtask 1",
      "subtasks": [
        { "id": 60, "title": "Nested Subtask", "subtasks": [] }
      ]
    }
  ]
}
```
**is_implemented:** true

### POST /api/tasks/:id/assignees
**Request:** `{ "user_id": 5 }`
**is_implemented:** true

### DELETE /api/tasks/:id/assignees/:userId
**is_implemented:** true

### POST /api/tasks/:id/dependencies
**Request:** `{ "depends_on_task_id": 42, "dependency_type": "blocks_start" }`
**is_implemented:** true

### DELETE /api/tasks/:id/dependencies/:depId
**is_implemented:** true

### POST /api/tasks/:id/comments
**Request:** `{ "content": "Working on this now..." }`
**is_implemented:** true

### GET /api/tasks/:id/comments
Query params: `?limit=20&offset=0`
**is_implemented:** true

### POST /api/tasks/:id/attachments
Multipart form — file upload.
**Request:** `multipart/form-data` with `file` field.
**Response:** `201`
```json
{ "data": { "id": 4, "filename": "wireframe.png", "url": "...", "mime_type": "image/png", "size_bytes": 245632 } }
```
**is_implemented:** true

### GET /api/tasks/:id/acceptance-criteria
**Response:** `200`
**is_implemented:** true

### POST /api/tasks/:id/acceptance-criteria
**Request:** `{ "description": "OAuth flow completes" }`
**is_implemented:** true

### PATCH /api/tasks/:id/acceptance-criteria/:acId
**Request:** `{ "is_marked": true }`
**is_implemented:** true

### DELETE /api/tasks/:id/acceptance-criteria/:acId
**is_implemented:** true

---

## Sprints (Simultaneous)

### GET /api/projects/:projectId/sprints
Query params: `?include=tasks,stats`
**Response:** `200`
**is_implemented:** true

### GET /api/sprints/:id
Query params: `?include=tasks`
**Response:** `200`
**is_implemented:** true

### POST /api/projects/:projectId/sprints
**Request:**
```json
{
  "name": "Sprint 5",
  "description": "Focus on API integration",
  "goal": "Complete API integration for v2",
  "color": "#8B5CF6",
  "start_date": "2024-06-17",
  "end_date": "2024-06-28",
  "is_parallel": true,
  "team_tag": "backend"
}
```
**is_implemented:** true

### PUT /api/sprints/:id
**Request:** Same as POST
**is_implemented:** true

### DELETE /api/sprints/:id
**Response:** `204`
**is_implemented:** true

### POST /api/sprints/:id/activate
Start the sprint.
**is_implemented:** false

### POST /api/sprints/:id/complete
Complete the sprint.
**is_implemented:** false

### POST /api/sprints/:id/cancel
Cancel the sprint.
**is_implemented:** false

### POST /api/sprints/:id/tasks
Assign tasks to sprint.
**Request:** `{ "task_ids": [42, 55, 60] }`
**is_implemented:** true

### DELETE /api/sprints/:id/tasks/:taskId
Remove task from sprint.
**is_implemented:** true

### GET /api/projects/:projectId/sprints/active
Get all active sprints.
**Response:** `200`
**is_implemented:** false

### GET /api/projects/:projectId/sprints/grouped
Get sprints grouped by team_tag.
**Response:** `200`
**is_implemented:** false

### GET /api/sprints/:id/retrospective
**Response:** `200` or `404` if not exists.
**is_implemented:** true

### POST /api/sprints/:id/retrospective
**Request:** `{ "title": "Sprint 4 Retro", "description": "...", "sections": [...] }`
**is_implemented:** true

---

## Mini-Sprints

### GET /api/projects/:projectId/mini-sprints
List all mini-sprints for a project.
**Response:** `200`
**is_implemented:** false

### POST /api/projects/:projectId/mini-sprints
Create a new mini-sprint.
**Request:**
```json
{
  "name": "Hotfix Sprint",
  "goal": "Fix critical login bug",
  "type": "hotfix",
  "start_date": "2024-06-17",
  "end_date": "2024-06-18",
  "priority": "critical",
  "parent_sprint_id": 5
}
```
**is_implemented:** false

### GET /api/mini-sprints/:miniSprintId
Get mini-sprint details.
**is_implemented:** false

### PATCH /api/mini-sprints/:miniSprintId
Update mini-sprint.
**is_implemented:** false

### DELETE /api/mini-sprints/:miniSprintId
Delete mini-sprint.
**Response:** `204`
**is_implemented:** false

### POST /api/mini-sprints/:miniSprintId/activate
Start the mini-sprint.
**is_implemented:** false

### POST /api/mini-sprints/:miniSprintId/complete
Complete the mini-sprint.
**is_implemented:** false

### POST /api/mini-sprints/:miniSprintId/cancel
Cancel the mini-sprint.
**is_implemented:** false

### GET /api/mini-sprints/:miniSprintId/tasks
Get tasks in mini-sprint.
**is_implemented:** false

### POST /api/mini-sprints/:miniSprintId/tasks
Add task(s) to mini-sprint.
**Request:** `{ "task_id": 42, "source": "moved_from_backlog", "notes": "..." }`
**is_implemented:** false

### DELETE /api/mini-sprints/:miniSprintId/tasks/:taskId
Remove task from mini-sprint.
**is_implemented:** false

### GET /api/projects/:projectId/mini-sprints/active
Get active mini-sprints.
**is_implemented:** false

### GET /api/projects/:projectId/quick-capture
Get quick capture backlog.
**is_implemented:** false

### POST /api/projects/:projectId/quick-capture/tasks
Add task directly to quick capture.
**is_implemented:** false

---

## Sprint Groups

### GET /api/projects/:projectId/sprint-groups
List sprint groups.
**Response:** `200`
**is_implemented:** false

### POST /api/projects/:projectId/sprint-groups
Create sprint group.
**Request:** `{ "name": "Frontend Sprints", "description": "All UI-related sprints" }`
**is_implemented:** false

### POST /api/sprint-groups/:groupId/sprints
Add sprint to group.
**Request:** `{ "sprint_id": 5 }`
**is_implemented:** false

### DELETE /api/sprint-groups/:groupId/sprints/:sprintId
Remove sprint from group.
**is_implemented:** false

---

## Status (Kanban)

### GET /api/projects/:projectId/statuses
Returns all active statuses ordered by `order`.
**Response:** `200`
**is_implemented:** true

### POST /api/projects/:projectId/statuses
**Request:** `{ "name": "In Review", "color": "#F59E0B", "associated_role": "qa", "order": 3 }`
**is_implemented:** true

### PUT /api/projects/:projectId/statuses/:id
**Request:** Same as POST
**is_implemented:** true

### DELETE /api/projects/:projectId/statuses/:id
Soft delete — `is_active: false`. Returns `204`.
**is_implemented:** true

### PUT /api/projects/:projectId/statuses/reorder
Reorder statuses.
**Request:** `{ "status_ids": [1, 3, 2, 4] }` (ordered array)
**is_implemented:** true

### GET /api/projects/:projectId/boards
Returns board view with statuses and task counts.
**Response:** `200`
```json
{
  "data": [
    { "status_id": 1, "name": "To Do", "color": "#6B7280", "tasks": [...], "task_count": 5 },
    { "status_id": 2, "name": "In Progress", "color": "#3B82F6", "tasks": [...], "task_count": 3 }
  ]
}
```
**is_implemented:** true

---

## Chatroom & Channels

### GET /api/projects/:projectId/chatroom
Returns or creates chatroom for project. One-to-one relationship.
**Response:** `200`
```json
{
  "data": {
    "id": 1,
    "project_id": 1,
    "name": "Project Chat",
    "channels": [...]
  }
}
```
**is_implemented:** true

### GET /api/chatrooms/:id/channels
**Response:** `200`
```json
{
  "data": [
    { "id": 5, "type": "voice", "name": "Daily", "order": 0, "is_default": true, "is_active": true },
    { "id": 3, "type": "text", "name": "general", "order": 1, "is_default": false, "is_active": true }
  ]
}
```
**is_implemented:** true

### POST /api/chatrooms/:id/channels
**Request:** `{ "type": "text", "name": "backend-discuss", "order": 5 }`
**is_implemented:** true

### PUT /api/channels/:id
**Request:** `{ "name": "new-name", "order": 3 }`
**is_implemented:** true

### DELETE /api/channels/:id
Only non-default channels can be deleted. Returns `204`.
**is_implemented:** true

---

## Messages

### GET /api/channels/:channelId/messages
Query params: `?cursor=abc123&limit=50` (cursor-based pagination)
**Response:** `200`
```json
{
  "data": [
    { "id": 1024, "channel_id": 3, "user_id": 5, "content": "...", "created_at": "..." }
  ],
  "meta": { "next_cursor": "xyz789", "has_more": true }
}
```
**is_implemented:** true

### POST /api/channels/:channelId/messages
**Request:** `{ "content": "Hello team!" }`
**is_implemented:** true

### DELETE /api/messages/:id
Only message author or admin can delete. Returns `204`.
**is_implemented:** true

---

## Voice Sessions

### POST /api/channels/:channelId/voice-sessions
Start a voice session (when user joins voice channel).
**Response:** `201`
```json
{
  "data": { "id": 7, "channel_id": 5, "status": "active", "started_at": "..." }
}
```
**is_implemented:** true

### PUT /api/voice-sessions/:id/end
End the voice session.
**Response:** `200`
**is_implemented:** true

### POST /api/voice-sessions/:id/join
User joins an active voice session.
**Request:** `{ "user_id": 5 }`
**Response:** `200`
**is_implemented:** true

### PUT /api/voice-sessions/:id/leave
User leaves the voice session.
**Response:** `200`
**is_implemented:** true

### POST /api/voice-sessions/:id/transcribe
Trigger transcription explicitly.
**Request:** `{ "user_id": 5 }`
**Response:** `202` — async operation.
**is_implemented:** true

---

## Daily Standups

### GET /api/projects/:projectId/daily-standups
Query params: `?from=YYYY-MM-DD&to=YYYY-MM-DD`
**Response:** `200`
**is_implemented:** true

### GET /api/daily-standups/:id
**Response:** `200`
```json
{
  "data": {
    "id": 2,
    "project_id": 1,
    "channel_id": 5,
    "scheduled_at": "2024-06-19T09:00:00Z",
    "voice_session_id": 7,
    "state_summary": "Team is on track",
    "stoppers_detected": [],
    "expected_latencies": [],
    "notes": "No blockers"
  }
}
```
**is_implemented:** true

### POST /api/projects/:projectId/daily-standups
**Request:** `{ "channel_id": 5, "scheduled_at": "2024-06-19T09:00:00Z" }`
**is_implemented:** true

### PUT /api/daily-standups/:id
**Request:** `{ "scheduled_at": "2024-06-20T09:00:00Z", "notes": "Updated notes" }`
**is_implemented:** true

### DELETE /api/daily-standups/:id
**Response:** `204`
**is_implemented:** true

### POST /api/daily-standups/:id/transcribe
Explicitly trigger transcription for this standup.
**Response:** `202`
**is_implemented:** true

---

## Reports (Report Hub)

### GET /api/projects/:projectId/reports
List all reports for project. Query params: `?type=sprint_retrospective&sprint_id=5&status=published&from=YYYY-MM-DD&to=YYYY-MM-DD`
**Response:** `200`
**is_implemented:** false

### POST /api/projects/:projectId/reports
Create a new report.
**Request:**
```json
{
  "title": "Sprint 12 QA Audit",
  "type": "qa_audit",
  "sprint_id": 5
}
```
**is_implemented:** false

### POST /api/projects/:projectId/reports/qa-audit
Generate QA Audit report.
**Request:** `{ "scope": "sprint", "scope_id": 5, "title": "Q2 QA Audit" }`
**is_implemented:** false

### POST /api/projects/:projectId/reports/tech-debt
Generate Tech Debt review.
**Request:** `{ "scope": "project" }`
**is_implemented:** false

### POST /api/projects/:projectId/reports/product-feedback
Generate Product Feedback report.
**Request:** `{ "feedback_sources": ["github_issues", "user_feedback"] }`
**is_implemented:** false

### GET /api/reports/:reportId
Get report details with content.
**Response:** `200`
**is_implemented:** false

### PATCH /api/reports/:reportId
Update report.
**is_implemented:** false

### DELETE /api/reports/:reportId
Soft delete report.
**Response:** `204`
**is_implemented:** false

### POST /api/reports/:reportId/publish
Publish draft report.
**is_implemented:** false

### POST /api/reports/:reportId/convert-to-task
Convert suggestion to actual task.
**Request:** `{ "item_id": 10, "create_as": "story", "assign_to_backlog": 1 }`
**is_implemented:** false

### GET /api/reports/:reportId/items
Get suggested backlog items from report.
**Response:** `200`
**is_implemented:** false

### POST /api/reports/:reportId/items
Add manual suggestion.
**Request:** `{ "suggested_title": "...", "suggested_type": "story", "priority": "high" }`
**is_implemented:** false

### PATCH /api/reports/:reportId/items/:itemId
Update suggestion status.
**Request:** `{ "status": "approved" }`
**is_implemented:** false

### POST /api/reports/:reportId/items/:itemId/approve
Approve and create task from suggestion.
**Request:** `{ "create_as": "task", "assign_to_backlog": 1 }`
**is_implemented:** false

---

## Retrospectives (Legacy - use Reports)

### GET /api/sprints/:sprintId/retrospective
**Response:** `200` or `404`
**is_implemented:** true

### POST /api/sprints/:sprintId/retrospective
**Request:**
```json
{
  "title": "Sprint 3 Retro",
  "description": "...",
  "sections": [
    { "type": "what_went_wrong", "content": "...", "order": 1 },
    { "type": "what_went_good", "content": "...", "order": 2 },
    { "type": "improvements", "content": "...", "order": 3 },
    { "type": "action_items", "content": "...", "order": 4 }
  ]
}
```
**is_implemented:** true

### PUT /api/retrospectives/:id
Update entire retrospective including sections array.
**Request:** Same as POST
**is_implemented:** true

### PATCH /api/retrospectives/:id/sections
Update only sections array.
**Request:** `{ "sections": [...] }`
**is_implemented:** true

---

## Triggers (Inter-Backlog Automation)

### GET /api/projects/:projectId/triggers
List all triggers for project.
**Response:** `200`
**is_implemented:** false

### POST /api/projects/:projectId/triggers
Create a new trigger.
**Request:**
```json
{
  "name": "Dev to QA Handoff",
  "source_backlog_id": 1,
  "target_backlog_id": 2,
  "event_type": "status_change",
  "conditions": { "to_status_id": 5 },
  "action_type": "create_task",
  "action_config": {
    "template": {
      "title": "Test: {{task.title}}",
      "type": "task",
      "backlog_id": 2
    }
  }
}
```
**is_implemented:** false

### GET /api/triggers/:triggerId
Get trigger details.
**is_implemented:** false

### PATCH /api/triggers/:triggerId
Update trigger.
**is_implemented:** false

### DELETE /api/triggers/:triggerId
Delete trigger.
**Response:** `204`
**is_implemented:** false

### POST /api/triggers/:triggerId/test
Test trigger with sample event.
**is_implemented:** false

### POST /api/triggers/:triggerId/toggle
Enable/disable trigger.
**Request:** `{ "is_active": false }`
**is_implemented:** false

---

## Task Links

### GET /api/tasks/:taskId/links
Get all links for a task.
**Response:** `200`
**is_implemented:** false

### POST /api/tasks/:taskId/links
Create manual link.
**Request:** `{ "target_task_id": 55, "link_type": "dependency" }`
**is_implemented:** false

### DELETE /api/links/:linkId
Remove task link.
**Response:** `204`
**is_implemented:** false

---

## Canvases (Free Board / Visual Roadmap)

### GET /api/projects/:projectId/canvases
List all canvases in project.
**Response:** `200`
**is_implemented:** false

### POST /api/projects/:projectId/canvases
Create new canvas.
**Request:** `{ "name": "Q3 Roadmap", "description": "...", "settings": { "grid_enabled": true } }`
**is_implemented:** false

### GET /api/canvases/:canvasId
Get canvas with elements.
**is_implemented:** false

### PATCH /api/canvases/:canvasId
Update canvas settings.
**is_implemented:** false

### DELETE /api/canvases/:canvasId
Delete canvas.
**Response:** `204`
**is_implemented:** false

### PATCH /api/canvases/:canvasId/viewport
Update viewport position/zoom.
**Request:** `{ "x": 100, "y": 200, "zoom": 1.5 }`
**is_implemented:** false

### GET /api/canvases/:canvasId/elements
Get all elements.
**is_implemented:** false

### POST /api/canvases/:canvasId/elements
Create element.
**Request:**
```json
{
  "type": "rectangle",
  "position": { "x": 100, "y": 200 },
  "size": { "width": 200, "height": 100 },
  "style": { "fill_color": "#3B82F6" },
  "content": "Module A"
}
```
**is_implemented:** false

### PATCH /api/canvases/:canvasId/elements/:elementId
Update element.
**is_implemented:** false

### DELETE /api/canvases/:canvasId/elements/:elementId
Delete element.
**is_implemented:** false

### POST /api/canvases/:canvasId/elements/bulk
Create multiple elements.
**Request:** `{ "elements": [...] }`
**is_implemented:** false

### PATCH /api/canvases/:canvasId/elements/reorder
Update z-index order.
**Request:** `{ "element_ids": [3, 1, 2] }`
**is_implemented:** false

### POST /api/canvases/:canvasId/elements/:elementId/link
Link element to task.
**Request:** `{ "task_id": 42, "link_type": "visual_state", "state_binding": { "sync_direction": "task_to_canvas" } }`
**is_implemented:** false

### DELETE /api/canvases/:canvasId/elements/:elementId/link
Unlink element from task.
**is_implemented:** false

### GET /api/canvases/:canvasId/task-links
Get all task links for canvas.
**is_implemented:** false

### GET /api/tasks/:taskId/canvas-links
Get canvas elements linked to task.
**is_implemented:** false

---

## Project Templates

### GET /templates
Get all available templates (system + user).
**Response:** `200`
**is_implemented:** false

### GET /templates/:templateId
Get template details.
**is_implemented:** false

### POST /templates
Create custom template.
**Request:** `{ "name": "...", "description": "...", "config": {...} }`
**is_implemented:** false

### PATCH /templates/:templateId
Update template.
**is_implemented:** false

### DELETE /templates/:templateId
Delete custom template.
**Response:** `204`
**is_implemented:** false

### GET /templates/categories
Get template categories.
**is_implemented:** false

### POST /templates/:templateId/create-project
Create project from template.
**Request:** `{ "name": "New Project", "goal": "...", "folder_id": 1, "sprints_count": 3 }`
**is_implemented:** false

### POST /projects/ai-create
Create project using AI.
**Request:** `{ "message": "Create a project for user authentication" }`
**is_implemented:** false

---

## Settings (Polymorphic)

### GET /api/settings
Query params required:
- `GET /api/settings?type=general` — returns general settings (no scope_id)
- `GET /api/settings?type=project&scope_id=1` — returns project 1 settings
- `GET /api/settings?type=user&scope_id=5` — returns user 5 settings
- `GET /api/settings?type=user_project_override&scope_id=5&project_id=1` — returns user 5's project 1 override

**Response:** `200`
```json
{
  "data": {
    "id": 10,
    "type": "project",
    "scope_id": 1,
    "name": "Project AI Settings",
    "config": { "ai": { "temperature": 0.5, "tone": "technical" } },
    "created_at": "...",
    "updated_at": "..."
  }
}
```
**is_implemented:** true

### PUT /api/settings/:id
**Request:** `{ "config": { "ai": { "temperature": 0.7 } } }`
Partial update — merges with existing config.
**is_implemented:** true

### POST /api/settings
Create new settings entry.
**Request:** `{ "type": "project", "scope_id": 1, "name": "Project Settings", "config": {...} }`
**is_implemented:** true

---

## AI Chat & RAG

### POST /ai/chat
Create AI chat session and get response.
**Request:**
```json
{
  "project_id": 1,
  "agent_type": "backlog-assistant",
  "message": "Create a subtask for implementing login",
  "context": { "task_id": 42 }
}
```
**Response:** `200`
```json
{
  "data": {
    "session_id": 50,
    "message": {
      "id": 500,
      "role": "assistant",
      "content": "I've created a subtask: 'Implement login form UI'",
      "model": "deepseek-chat",
      "tokens_used": 145
    }
  }
}
```
**Side effects:** Creates AIChatSession and AIChatMessage records for RAG.
**is_implemented:** true

### GET /ai/sessions
Query params: `?project_id=1&agent_type=backlog-assistant&limit=20&offset=0`
**Response:** `200`
**is_implemented:** true

### GET /ai/sessions/:id/messages
Query params: `?limit=50&offset=0`
**Response:** `200`
**is_implemented:** true

### POST /ai/transcribe
Transcribe audio to text.
**Request:** `{ "voice_session_id": 7 }` or `{ "file": binary }`
**Response:** `202`
```json
{
  "data": {
    "id": 30,
    "text": "Yesterday I worked on OAuth...",
    "tokens_used": 250
  }
}
```
**is_implemented:** true

### GET /ai/search
Semantic search over RAG data.
**Request:** `{ "project_id": 1, "query": "OAuth implementation blockers", "limit": 5 }`
**Response:** `200`
```json
{
  "data": [
    { "type": "chat_message", "id": 500, "content": "...", "similarity": 0.87 },
    { "type": "transcription", "id": 30, "content": "...", "similarity": 0.82 }
  ]
}
```
**is_implemented:** true

---

## Subscriptions & Credits

### GET /subscription
Get current user's subscription.
**Response:** `200`
```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "plan": "pro",
    "status": "active",
    "credits_remaining": 42.50,
    "billing_cycle": "monthly",
    "current_period_start": "2024-06-01",
    "current_period_end": "2024-06-30"
  }
}
```
**is_implemented:** true

### PUT /subscription
Upgrade, downgrade, or change billing cycle.
**Request:** `{ "plan": "enterprise", "billing_cycle": "annual" }`
**is_implemented:** true

### GET /subscription/credits
**Response:** `200`
```json
{
  "data": {
    "credits_remaining": 42.50,
    "credits_used_this_period": 7.50,
    "next_refresh": "2024-07-01"
  }
}
```
**is_implemented:** true

---

## API Keys (Vault)

### GET /api-keys
List user's API keys (no secret values).
**Response:** `200`
```json
{
  "data": [
    { "id": 1, "provider": "deepseek", "public_alias": "My Key", "is_shared": true, "allow_project_share": true, "max_credit_per_user": 10.00, "created_at": "..." },
    { "id": 2, "provider": "openai", "public_alias": "Backup", "is_shared": false, "allow_project_share": false, "created_at": "..." }
  ]
}
```
**is_implemented:** true

### POST /api-keys
Create new API key. Backend stores encrypted value, returns only alias.
**Request:** `{ "provider": "deepseek", "api_key": "sk-...", "public_alias": "My DeepSeek", "is_shared": false, "allow_project_share": false }`
**Response:** `201`
```json
{
  "data": { "id": 3, "provider": "deepseek", "public_alias": "My DeepSeek", "is_shared": false }
}
```
**is_implemented:** true

### PUT /api-keys/:id
Update alias or sharing settings. Cannot update the actual key.
**Request:** `{ "public_alias": "Updated Name", "allow_project_share": true, "max_credit_per_user": 15.00 }`
**is_implemented:** true

### DELETE /api-keys/:id
**Response:** `204`
**is_implemented:** true

---

## Notifications

### GET /notifications
Query params: `?read=false&limit=20&offset=0`
**Response:** `200`
**is_implemented:** true

### PUT /notifications/:id/read
Mark single notification as read.
**Response:** `200`
**is_implemented:** true

### PUT /notifications/read-all
Mark all notifications as read.
**Response:** `200`
**is_implemented:** true

### GET /notification-preferences
**Response:** `200`
```json
{ "data": [
  { "type": "email", "enabled": true },
  { "type": "push", "enabled": true },
  { "type": "in_app", "enabled": true }
]}
```
**is_implemented:** true

### PUT /notification-preferences
**Request:** `{ "email": true, "push": false, "in_app": true }`
**is_implemented:** true

---

## Priority Order for Implementation

### Phase 1 — Core (Must Have)
1. **Tasks CRUD + Filtering** — All task types unified
2. **Status (Kanban)** — Board columns with drag-drop
3. **Projects + Members** — Basic project management
4. **Sprints** — Sprint lifecycle
5. **Settings (Basic)** — Theme, notifications

### Phase 2 — Collaboration
6. **Chatroom + Channels** — Text messaging
7. **Messages + Real-time (WS)** — Live chat
8. **Comments + Attachments** — Task discussions
9. **Daily Standups** — Scheduling + transcription

### Phase 3 — AI Features
10. **AI Chat** — Backlog assistant, chat
11. **RAG Search** — Semantic search
12. **Retrospectives** — AI-assisted reviews

### Phase 4 — Polish
13. **Subscriptions + Credits** — Payment flow
14. **API Keys** — User key management
15. **Voice Sessions** — WebRTC + transcriptions
16. **Advanced Notifications** — Push, email

---

## WebSocket Endpoints

### WS /ws/projects/:projectId/chat
Real-time chat messages.
```json
{ "event": "message:new", "data": { "channel_id": 3, "content": "Hello", "user_id": 5 } }
{ "event": "message:delete", "data": { "message_id": 1024 } }
{ "event": "user:join", "data": { "channel_id": 5, "user_id": 5 } }
{ "event": "user:leave", "data": { "channel_id": 5, "user_id": 5 } }
```

### WS /ws/voice/:sessionId
Real-time voice state.
```json
{ "event": "participant:join", "data": { "user_id": 5, "joined_at": "..." } }
{ "event": "participant:leave", "data": { "user_id": 5, "left_at": "..." } }
{ "event": "session:end", "data": { "ended_at": "..." } }
```

---

## Implementation Notes

### Database Considerations
- Settings `scope_id` uses separate fields: `user_id` and `project_id` (not composite key)
- Task `parent_id` allows recursive queries via CTE or closure table
- Message pagination uses cursor-based for performance
- AIChatMessage.token_usage for per-user spending tracking

### Caching Layers
- Redis for session data, real-time presence
- CDN for static assets and attachments
- Database query caching for project stats (60s TTL)

### File Storage
- Attachments stored in S3-compatible storage
- Presigned URLs for upload/download (15 min expiry)
- Max upload size: 10MB

### Security
- JWT tokens with 24h expiry
- Refresh token rotation
- API key never logged or exposed in responses
- Input sanitization for markdown content
- Rate limiting per user/IP