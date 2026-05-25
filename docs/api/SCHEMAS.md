# SCHEMAS.md — API Request & Response Contracts

**This file owns:** Detailed JSON payloads, request/response shapes, and technical implementation notes for all API endpoints.
**For status and routing:** See [ENDPOINTS.md](./ENDPOINTS.md)
**For pure entities:** See [domain/ERD.md](../domain/ERD.md)
**Last updated:** 2026-05-15

---

## Conventions & Patterns

### Response Format
All successful API responses follow this wrapper:
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

---

## 1. Authentication

### POST /api/auth/login
**Request Body:**
```json
{ "email": "user@example.com", "password": "plaintext" }
```
**Response (200):**
```json
{
  "data": {
    "token": "jwt_token_here",
    "user": { "id": 1, "username": "john", "email": "user@example.com", "avatar_url": "..." }
  }
}
```

### POST /api/auth/register
**Request Body:**
```json
{ "username": "john", "email": "user@example.com", "password": "plaintext" }
```

### GET /api/auth/me
**Response (200):**
```json
{
  "data": {
    "id": 1, "username": "john", "email": "user@example.com",
    "avatar_url": "...", "default_language": "en", "created_at": "..."
  }
}
```

---

## 2. Users

### GET /api/users
**Query Params:** `?search=john&limit=20&offset=0`
**Response (200):**
```json
{
  "data": [{ "id": 1, "username": "john", "email": "...", "avatar_url": "..." }],
  "meta": { "total": 50, "limit": 20, "offset": 0 }
}
```

### PUT /api/users/:id
**Request Body:**
```json
{ "username": "john Updated", "avatar_url": "...", "default_language": "es" }
```

### GET /api/users/:id/scrum-roles
**Response (200):**
```json
{ "data": [
  { "id": 1, "role_type": "developer", "specialization": "frontend", "is_primary": true },
  { "id": 2, "role_type": "qa", "is_primary": false }
]}
```

---

## 3. Projects

### GET /api/projects/all
**Response (200):**
```json
{
  "data": [
    { "id": 1, "name": "ScrumHub", "color": "#3B6D11", "status": "active", "members_count": 5 }
  ]
}
```

### GET /api/projects/:id/members
**Response (200):**
```json
{
  "data": [
    { 
      "id": 1, 
      "user_id": 5, 
      "scrum_role": "developer", 
      "is_admin": false, 
      "joined_at": "...", 
      "user": { "id": 5, "username": "...", "avatar_url": "..." } 
    }
  ]
}
```

### GET /api/projects/:id/stats
**Response (200):**
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

### GET /api/projects/:projectId/sections
**Response (200):**
```json
{
  "data": [
    { "id": "uuid", "key": "vision", "value": "...", "order_index": 0 }
  ]
}
```

---

## 4. Backlogs & Tasks

### GET /api/projects/:projectId/backlogs
**Response (200):**
```json
{
  "data": [
    { "id": 1, "name": "Development", "type": "development", "color": "#3B82F6", "is_default": true }
  ]
}
```

### GET /api/tasks
**Query Params:** `?project_id=1&sprint_id=3&status_id=5&type=epic&limit=50`
**Response (200):**
```json
{
  "data": [
    {
      "id": 42,
      "type": "epic",
      "title": "User Authentication",
      "priority": "high",
      "status_id": 2,
      "assignees": [...],
      "comments_count": 5
    }
  ]
}
```

### POST /api/tasks
**Request Body:**
```json
{
  "project_id": 1,
  "backlog_id": 1,
  "type": "epic",
  "title": "New Epic",
  "description": "...",
  "priority": "high",
  "status_id": 1
}
```

---

## 5. Collaboration (Chat & Audio)

### GET /api/chatrooms/:id/channels
**Response (200):**
```json
{
  "data": [
    { "id": 5, "type": "voice", "name": "Daily", "is_default": true },
    { "id": 3, "type": "text", "name": "general", "is_default": false }
  ]
}
```

### GET /api/channels/:channelId/messages
**Response (200):**
```json
{
  "data": [
    { "id": 1024, "channel_id": 3, "user_id": 5, "content": "...", "created_at": "..." }
  ],
  "meta": { "next_cursor": "xyz789", "has_more": true }
}
```

### POST /api/ai/chat
**Request Body:**
```json
{
  "project_id": 1,
  "agent_type": "backlog-assistant",
  "message": "Create a subtask for implementing login",
  "context": { "task_id": 42 }
}
```
**Response (200):**
```json
{
  "data": {
    "session_id": 50,
    "message": {
      "role": "assistant",
      "content": "...",
      "tokens_used": 145
    }
  }
}
```

---

## WebSocket Contracts

### WS /ws/projects/:projectId/chat
```json
{ "event": "message:new", "data": { "channel_id": 3, "content": "Hello", "user_id": 5 } }
```

### WS /ws/voice/:sessionId
```json
{ "event": "participant:join", "data": { "user_id": 5, "joined_at": "..." } }
```

---

## Technical Notes

### Caching
- **Projects/Tasks**: Redis caching with 2-5 min TTL.
- **Stats**: Aggregated with 60s TTL.

### Storage
- **Attachments**: S3-compatible, max 10MB, presigned URLs.

### Security
- JWT with 24h expiry + refresh rotation.
- Rate limiting: 100 req/min general, 10 req/min AI.
