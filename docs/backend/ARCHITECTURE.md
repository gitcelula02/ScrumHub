# Backend Architecture

**This file owns:** Backend folder structure, Express.js route organization, middleware, database configuration, and service layer.
**For frontend architecture:** See [core/ARCHITECTURE.md](../core/ARCHITECTURE.md)
**For API endpoints:** See [api/ENDPOINTS.md](../api/ENDPOINTS.md)
**For entity schemas:** See [domain/ERD.md](../domain/ERD.md)
**Last updated:** 2026-05-25

---

## Overview

The backend is an **Express.js REST API** that serves both the React SPA frontend and handles AI/notification services. It uses MongoDB (via Mongoose) as the primary database and Supabase for auth and file storage.

**Key characteristics:**
- JavaScript (CommonJS modules)
- Session-based authentication
- RESTful API design
- AI proxy for DeepSeek API
- Background job for email notifications

---

## Directory Structure

```
backend/
├── config/
│   └── database.js         # Supabase + MongoDB connection setup
├── controllers/            # Request handlers (business logic)
│   ├── aiController.js
│   ├── authController.js
│   ├── projectController.js
│   ├── taskController.js
│   └── userController.js
├── database/
│   ├── schema.sql          # Legacy PostgreSQL schema (deprecated)
│   └── mongodb/            # MongoDB schema files
├── middleware/
│   └── auth.js             # isAuthenticated, isAdmin
├── models/                  # Data access layer
│   ├── mongodb/
│   ├── Project.js          # Supabase-backed Project model
│   ├── Task.js             # Supabase-backed Task model
│   └── User.js             # Supabase-backed User model
├── routes/                  # Express Router definitions
│   ├── ai.js               # /api/ai/*
│   ├── auth.js             # /api/auth/*
│   ├── projects.js         # /api/projects/*
│   └── tasks.js            # /api/tasks/*
├── services/                # Business logic services
│   ├── aiService.js        # DeepSeek API integration
│   └── notificationService.js  # Email alert scheduler
└── server.js               # Express app entry point
```

---

## Server Entry Point (`server.js`)

The main entry point (`backend/server.js`) performs:

1. **Environment loading** via `dotenv`
2. **Database initialization** via `initDatabase()` (MongoDB + Supabase)
3. **Express middleware setup**:
   - `express.json()` — JSON body parsing
   - `express.urlencoded()` — form data parsing
   - `express.static()` — serves `frontend/public/` as static files
   - `express-session` — session management with signed cookies
4. **Route mounting**:
   - `/api/auth` → auth routes
   - `/api/projects` → project routes
   - `/api/tasks` → task routes
   - `/api/ai` → AI routes
5. **Static file serving** for legacy HTML views (landing, login, dashboard, etc.)
6. **Background jobs** — `notificationService.checkAllTasksAndNotify()` runs every 60 minutes
7. **HTTP server startup** on port 3000

---

## Route Organization

### API Routes (prefix: `/api/`)

| Prefix | Route File | Purpose |
|--------|------------|---------|
| `/api/auth` | `routes/auth.js` | Login, register, logout, session |
| `/api/projects` | `routes/projects.js` | CRUD + members |
| `/api/tasks` | `routes/tasks.js` | CRUD + comments + task stats |
| `/api/ai` | `routes/ai.js` | DeepSeek chat proxy |

### Static HTML Routes (legacy SPA fallback)

| Path | File served | Auth required |
|------|-------------|---------------|
| `/` | `frontend/views/landing.html` | No |
| `/login` | `frontend/views/login.html` | No |
| `/register` | `frontend/views/register.html` | No |
| `/dashboard` | `frontend/views/dashboard.html` | Yes |
| `/project/:id` | `frontend/views/project.html` | Yes |
| `/profile` | `frontend/views/profile.html` | Yes |

> **Note:** These legacy HTML views are fallback routes. The primary frontend is the React SPA at `frontend/src/` which runs on port 8080. These routes exist for backwards compatibility.

---

## Middleware

### `auth.js` — Authentication Middleware

| Function | Purpose |
|----------|---------|
| `isAuthenticated(req, res, next)` | Returns 401 if no `session.userId` |
| `isAdmin(req, res, next)` | Returns 403 if user role is not 'admin' |

Both are applied per-route as needed.

---

## Models

The backend models (`backend/models/*.js`) act as a data access layer wrapping **Supabase** (PostgreSQL via `@supabase/supabase-js`).

### User Model (`models/User.js`)

- `getAll()` — select id, name, email from User table
- `findById(id)` — single user lookup
- `findByEmail(email)` — login lookup
- `create(userData)` — insert with bcrypt hash
- `update(id, fields)` — partial update
- `delete(id)` — remove user
- `verifyPassword(plain, hashed)` — bcrypt compare

### Project Model (`models/Project.js`)

- `getAll()` — list all projects
- `findById(id)` — single project
- `create(data)` — insert project
- `update(id, fields)` — partial update
- `delete(id)` — remove project

### Task Model (`models/Task.js`)

- `getAll(filters)` — list with optional filters (project, assignee)
- `findById(id)` — single task with assignee info
- `create(data)` — insert task
- `update(id, fields)` — partial update
- `delete(id)` — remove task
- `addComment(taskId, userId, content)` — insert comment

---

## Services

### `aiService.js` — DeepSeek Integration

Proxies AI requests to the DeepSeek API:

```javascript
async chat(message, context) {
  // Calls DeepSeek API with project/task context
  // Returns AI response with token usage
}
```

### `notificationService.js` — Email Alerts

Runs as a background interval (every 60 minutes):

```javascript
checkAllTasksAndNotify() {
  // Query tasks with due dates approaching
  // Send email alerts via Nodemailer
}
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port (default: 3000) | No |
| `SESSION_SECRET` | Signed session cookie secret | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `DEEPSEEK_API_KEY` | DeepSeek API key | Yes |
| `EMAIL_USER` | Gmail for notifications | Optional |
| `EMAIL_PASS` | Gmail app password | Optional |

---

## CORS Configuration

The backend does **not** use CORS middleware. Instead, the frontend (port 8080) makes API calls to the backend (port 3000) directly during development. In production, both are served from the same origin.

---

## Key Rules

- All routes use CommonJS (`require()`, not ESM `import`)
- Models return plain JavaScript objects, not typed interfaces
- Controllers handle HTTP concerns (status codes, response format)
- Services handle business logic and external API calls
- Session-based auth via `express-session` — no JWT

---

*For entity definitions, see [domain/ERD.md](../domain/ERD.md)*
*For API endpoint status, see [api/ENDPOINTS.md](../api/ENDPOINTS.md)*