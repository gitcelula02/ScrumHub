# Backend Architecture

**This file owns:** Backend folder structure, Express.js patterns, database configuration conventions.
**For frontend architecture:** See [frontend/ARCHITECTURE.md](frontend/ARCHITECTURE.md)
**For API endpoints:** See [api/ENDPOINTS.md](../api/ENDPOINTS.md)
**For entity schemas:** See [domain/ERD.md](../domain/ERD.md)
**Last updated:** 2026-05-28

---

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js (CommonJS) |
| Primary Database | Supabase PostgreSQL + pgvector + Realtime |
| Secondary Database | MongoDB (deprecated — migrating to Supabase) |
| Auth | `express-session` (cookie-based, no JWT) |
| AI (current) | Node.js regex + DeepSeek API |
| AI (future) | Python FastAPI + LangChain + LiteLLM |
| Email | Nodemailer (Gmail SMTP) |

---

## Directory Structure

```
backend/
├── config/
│   └── database.js         # Supabase + MongoDB connection
├── controllers/            # Request handlers (HTTP concerns only)
│   ├── aiController.js
│   ├── authController.js
│   ├── projectController.js
│   ├── taskController.js
│   └── userController.js
├── database/
│   └── schema.sql          # PostgreSQL schema reference
├── middleware/
│   └── auth.js             # isAuthenticated, isAdmin
├── models/                 # Data access layer (Supabase queries)
│   ├── Project.js
│   ├── Task.js
│   └── User.js
├── routes/                 # Express Router definitions
│   ├── ai.js
│   ├── auth.js
│   ├── projects.js
│   └── tasks.js
├── services/               # Business logic + external APIs
│   ├── aiService.js
│   └── notificationService.js
└── server.js              # Entry point
```

---

## Layer Responsibilities

| Layer | Responsibility | Rules |
|-------|---------------|-------|
| **Routes** | URL mapping, middleware chaining | No business logic |
| **Controllers** | HTTP concerns: parse request, call model/service, format response | No direct Supabase calls |
| **Models** | Data access: queries, inserts, updates via `supabase-js` | Returns plain JS objects |
| **Services** | Business logic, external API calls (DeepSeek, Nodemailer) | No HTTP concerns |

---

## API Route Conventions

### Route File Pattern

```javascript
const express = require('express');
const router = express.Router();
const Controller = require('../controllers/SomeController');

// Specific routes BEFORE :id routes
router.get('/special-path', Controller.specialHandler);
router.get('/:id', Controller.getById);
router.post('/', Controller.create);

module.exports = router;
```

### Route Mounting

| Prefix | File | Purpose |
|--------|------|---------|
| `/api/auth` | `routes/auth.js` | Login, register, logout, session, users |
| `/api/projects` | `routes/projects.js` | CRUD + members |
| `/api/tasks` | `routes/tasks.js` | CRUD + comments + stats |
| `/api/ai` | `routes/ai.js` | Chat proxy, history, alerts |

---

## Controller Conventions

### Standard Method Pattern

```javascript
class SomeController {
    static async getAll(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            const items = await Model.getAll();
            res.json({ success: true, items });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}
```

### Response Format

All responses follow:
```javascript
{ success: true, data: ... }     // success case
{ success: false, message: '...' } // error case
```

### Status Codes

| Code | Use |
|------|-----|
| 200 | Successful GET, PUT |
| 201 | Successful POST (create) |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 500 | Server error |

---

## Model Conventions

### Method Naming

| Pattern | Purpose |
|---------|---------|
| `getAll()` | List all (optionally filtered) |
| `findById(id)` | Single lookup by primary key |
| `findByEmail(email)` | Lookup by email (login) |
| `getByUser(userId)` | Filtered by user ownership/membership |
| `create(data)` | Insert new record |
| `update(id, fields)` | Partial update |
| `delete(id)` | Remove record |

### Status/Priority Mapping

Status and priority use frontend-facing strings internally, mapped to DB values:

```javascript
// Status
const STATUS_TO_DB = { 'todo': 'TODO', 'in-progress': 'IN_PROGRESS', 'review': 'BLOCKED', 'done': 'DONE' };
const DB_TO_STATUS = { 'TODO': 'todo', 'IN_PROGRESS': 'in-progress', 'BLOCKED': 'review', 'DONE': 'done' };

// Priority
const PRIORITY_TO_DB = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
const DB_TO_PRIORITY = { 0: 'urgent', 1: 'high', 2: 'medium', 3: 'low' };
```

---

## Middleware

### `auth.js`

| Function | Purpose | Notes |
|----------|---------|-------|
| `isAuthenticated(req, res, next)` | Blocks unauthenticated users | Works correctly |
| `isAdmin(req, res, next)` | Blocks non-admin users | **Broken** — missing `await` |

---

## Service Conventions

### External API Calls

All external API calls (DeepSeek, Nodemailer) go through services, not controllers or models.

### Background Jobs

Use `setInterval` in `server.js` for periodic jobs:

```javascript
setInterval(() => {
    NotificationService.checkAllTasksAndNotify();
}, 60 * 60 * 1000); // every 60 minutes
```

---

## Database Conventions

### Supabase Client

Use singleton from `config/database.js`:

```javascript
const { supabase } = require('../config/database');
```

### Null Safety

Always check `supabase` is not null before calling:

```javascript
if (!supabase) {
    throw new Error('Supabase client not initialized');
}
```

### MongoDB (deprecated)

New code should not use MongoDB. Chat history will migrate to Supabase `messages` table.

---

## Imports

- Always use CommonJS: `require()`, never ESM `import`
- Never use `.js` extension in imports
- No barrel exports — import directly from files

---

## What NOT to Do

- ❌ Direct Supabase calls in controllers — go through models
- ❌ Business logic in routes — use controllers
- ❌ `console.log` for errors — use `console.error`
- ❌ Magic strings for status/priority — use the mapping constants
- ❌ Missing `await` on async model methods
- ❌ `project.description` for structured content — use `project_documents` table
- ❌ New MongoDB code — use Supabase
- ❌ `express-session` secret fallback in production — throw at startup

---

## Current Database Schema

**See [domain/ERD.md](../domain/ERD.md) for entity definitions.**

### Tables

| Table | Description |
|-------|-------------|
| `User` | id, email, password_hash, name, created_at, updated_at |
| `project` | id, name, description, owner_id, created_at, updated_at |
| `projectuser` | id, project_id, user_id, role, created_at |
| `backlogitem` | id, project_id, parent_id, title, description, status, priority, due_date, type, order_index, created_at, updated_at |

### Planned Schema Changes

| Change | Reason |
|--------|--------|
| Add `task_assignments` table | `assignee` not in `backlogitem` |
| Add `rooms` + `messages` tables | Replace MongoDB chat history |
| Add `project_documents` table | Replace plain `description` text |
| Add `documents` + `document_links` | Obsidian-in-ScrumHub |
| Add `embeddings` table (pgvector) | RAG storage with namespaced isolation |

---

## Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `PORT` | No | Default: 3000 |
| `SESSION_SECRET` | **Yes** | No fallback |
| `SUPABASE_URL` | Yes | |
| `SUPABASE_ANON_KEY` | Yes | |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | |
| `MONGODB_URI` | Deprecated | Being removed |
| `DEEPSEEK_API_KEY` | Optional | Current AI provider |
| `EMAIL_USER` | Optional | For notifications |
| `EMAIL_PASS` | Optional | Gmail app password |

---

## Future Architecture

### Polyglot Split (planned)

| Service | Language | Responsibility |
|---------|----------|----------------|
| Express API | Node.js | REST API, auth, CRUD, Supabase Realtime |
| AI Service | Python | Multi-provider LLM, RAG pipeline, agent loops |

### RAG Isolation (planned)

Enforced at **database layer via RLS**, not application:

```sql
-- Composite namespace: (project_id, user_id)
-- user_id = NULL means project-level shared context
```

---

*For entity definitions, see [domain/ERD.md](../domain/ERD.md)*
*For API endpoint status, see [api/ENDPOINTS.md](../api/ENDPOINTS.md)*