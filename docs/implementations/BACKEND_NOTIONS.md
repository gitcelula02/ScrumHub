# ScrumHub - Backend Documentation

## Project Overview

ScrumHub is a full-stack agile project management application built with **Node.js + Express** on the backend. It provides a Kanban board interface, AI-powered task management, email notifications, and a chat assistant for managing Scrum projects.

### Tech Stack

| Layer          | Technology                  |
|----------------|-----------------------------|
| Runtime        | Node.js                     |
| Framework      | Express.js                  |
| Relational DB  | Supabase (PostgreSQL)       |
| NoSQL DB       | MongoDB (Mongoose)          |
| Session Store  | In-memory (`express-session`) |
| Auth           | Session-based + bcrypt      |
| AI Provider    | DeepSeek API                |
| Email          | Nodemailer (Gmail SMTP)     |
| Password Hash  | bcryptjs                    |

---

## Architecture

```
server.js (entry point)
  ├── config/database.js        -> Supabase client + MongoDB connection
  ├── middleware/auth.js         -> Session-based auth guards
  ├── routes/
  │   ├── auth.js               -> /api/auth/*
  │   ├── projects.js           -> /api/projects/*
  │   ├── tasks.js              -> /api/tasks/*
  │   └── ai.js                 -> /api/ai/*
  ├── controllers/
  │   ├── authController.js
  │   ├── projectController.js
  │   ├── taskController.js
  │   ├── userController.js
  │   └── aiController.js
  ├── models/
  │   ├── User.js               -> Supabase `User` table
  │   ├── Project.js            -> Supabase `project` + `projectuser` tables
  │   ├── Task.js               -> Supabase `backlogitem` table
  │   └── mongodb/ChatMessage.js -> MongoDB chat history
  └── services/
      ├── aiService.js          -> DeepSeek integration + NLP parsing
      └── notificationService.js -> Nodemailer email notifications
```

### Database Schema (Supabase)

```
User (id, email, password_hash, name, created_at, updated_at)
Project (id, name, description, owner_id, created_at, updated_at)
ProjectUser (id, project_id, user_id, role, created_at)  -- UNIQUE(project_id, user_id)
BacklogItem (id, project_id, parent_id, title, description, status, priority,
             due_date, type, order_index, created_at, updated_at)
```

**Status values (DB):** `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`
**Priority values (DB):** `0=urgent`, `1=high`, `2=medium`, `3=low`
**Type values:** `TASK`, `EPIC`, `STORY`, `BUG` (stored in `backlogitem.type`)

### MongoDB Schema (ChatMessage)

```js
{ userId, projectId, role: "user"|"ai", text, type, metadata, timestamp }
```

Indexed by `(userId, projectId, timestamp)` for fast history retrieval. Keeps last 50 messages per user/project.

---

## Authentication System

Session-based authentication using `express-session` with an in-memory store.

- **Session duration:** 24 hours (`maxAge: 24 * 60 * 60 * 1000`)
- **Cookie:** Not secure (HTTP only, `secure: false`)
- Session stores `userId` after successful login/register
- Passwords hashed with `bcryptjs` (10 salt rounds)
- All protected routes check `req.session.userId`

### Demo User

| Email              | Password   |
|--------------------|------------|
| admin@proyecto.com | admin123   |

### Authorization Model

- **Session check** — required for all non-auth endpoints via inline `req.session.userId` checks
- **Ownership check** — project owner only can update/delete projects
- **Membership check** — must be project member or owner to access project tasks
- **Middleware exports** (`middleware/auth.js`) `isAuthenticated` and `isAdmin` are defined but **not currently wired into any route** (controllers do inline checks instead)

---

## Complete API Reference

All endpoints live under `/api/`. Responses follow a consistent JSON envelope:
```json
{ "success": true|false, ...data, "message": "..." }
```

### 1. Auth Endpoints (`/api/auth`)

**Router:** `routes/auth.js`
**Controller:** `authController.js`, `userController.js`

| Method | Path              | Controller              | Description                                    | Auth |
|--------|-------------------|-------------------------|------------------------------------------------|------|
| GET    | `/me`             | `getCurrentUser`        | Returns the currently logged-in user           | Yes  |
| POST   | `/login`          | `login`                 | Authenticates user with email + password       | No   |
| POST   | `/register`       | `register`              | Creates a new user account                     | No   |
| POST   | `/logout`         | `logout`                | Destroys the current session                   | Yes  |
| GET    | `/users`          | `UserController.getAll` | Lists all registered users (safe: no password) | Yes  |
| GET    | `/users/:id`      | `UserController.getById`| Get a single user profile                      | Yes  |
| PUT    | `/users/:id`      | `UserController.updateProfile`| Update user name/avatar                 | Yes  |

#### POST `/login`
**Body:** `{ email, password }`
**Returns:** `{ success, user: { id, name, email, role, avatar } }`
**Error 401:** Invalid credentials
**Error 400:** Missing email or password

#### POST `/register`
**Body:** `{ name, email, password }`
**Returns:** `{ success, user: { id, name, email, role, avatar } }`
**Error 400:** Missing fields, password < 6 chars, or email already exists

#### GET `/me`
**Returns:** `{ success, user: { id, name, email, role, avatar } }`
**Error 401:** Not authenticated
**Error 404:** User not found (session destroyed)

#### POST `/logout`
**Returns:** `{ success: true }`

#### GET `/users`
**Returns:** `{ success, users: [{ id, name, email, avatar, role }] }`

#### GET `/users/:id`
**Returns:** `{ success, user: { id, name, email, avatar, role, createdAt } }`

#### PUT `/users/:id`
**Body:** `{ name?, avatar? }`
**Returns:** `{ success, user: { id, name, email, avatar, role } }`

---

### 2. Projects Endpoints (`/api/projects`)

**Router:** `routes/projects.js`
**Controller:** `projectController.js`

| Method | Path               | Controller     | Description                                      | Auth |
|--------|--------------------|----------------|--------------------------------------------------|------|
| GET    | `/all`             | `getAll`       | Lists all projects the user is member/owner of   | Yes  |
| GET    | `/:id`             | `getById`      | Get a single project with members, tasks & stats | Yes  |
| GET    | `/:id/tree`        | `getTree`      | Get hierarchical task tree (parent/child)        | Yes  |
| POST   | `/`                | `create`       | Create a new project                             | Yes  |
| PUT    | `/:id`             | `update`       | Update project name/description (owner only)     | Yes  |
| DELETE | `/:id`             | `delete`       | Delete project and all its tasks (owner only)    | Yes  |
| POST   | `/:id/members`     | `addMember`    | Add a user to a project by email                 | Yes  |

#### GET `/all`
**Returns:** `{ success, projects: [{ id, name, description, owner, color, icon, status, members: [...], stats: {...} }] }`
Projects are enriched with member objects (id, name, avatar) and per-project task stats.

#### GET `/:id`
**Returns:** `{ success, project: { ..., members: [...], tasks: [...], stats: {...} } }`
Includes full member objects (id, name, email, avatar), all project tasks, and stats.
**Error 403:** Not a member or owner
**Error 404:** Project not found

#### GET `/:id/tree`
**Returns:** `{ success, tree: [task_with_children] }`
Builds a nested tree where tasks with `parentId` become children. Root tasks are those without a parent.

#### POST `/`
**Body:** `{ name (required), description?, color?, icon? }`
**Returns:** `{ success, project }`
Owner is automatically added as member with role "PO".

#### PUT `/:id`
**Body:** `{ name?, description? }`
Only the project owner can update.

#### DELETE `/:id`
Deletes all backlog items, project-user associations, and the project itself.
Only the project owner can delete.

#### POST `/:id/members`
**Body:** `{ email }`
Looks up user by email and adds them to the project with role "DEV".

---

### 3. Tasks Endpoints (`/api/tasks`)

**Router:** `routes/tasks.js`
**Controller:** `taskController.js`

**Important routing note:** Specific routes (`/my-tasks`, `/stats`, `/project/:projectId`) are defined BEFORE `/:id` to avoid route conflicts.

| Method | Path                   | Controller      | Description                              | Auth |
|--------|------------------------|-----------------|------------------------------------------|------|
| GET    | `/`                    | `getAll`        | Get all tasks across user's projects     | Yes  |
| GET    | `/my-tasks`            | `getMyTasks`    | Get tasks for current user's projects    | Yes  |
| GET    | `/stats`               | `getStats`      | Get aggregated stats across all projects | Yes  |
| GET    | `/project/:projectId`  | `getByProject`  | Get all tasks for a specific project     | Yes  |
| GET    | `/:id`                 | `getById`       | Get a single task by ID                  | Yes  |
| POST   | `/`                    | `create`        | Create a new task                        | Yes  |
| PUT    | `/:id`                 | `update`        | Update task fields                       | Yes  |
| DELETE | `/:id`                 | `delete`        | Delete a task                            | Yes  |
| POST   | `/:id/comments`        | `addComment`    | Add a comment to a task                  | Yes  |

#### GET `/`
**Returns:** `{ success, tasks: [...] }`
Finds all project IDs where the user is a member, then fetches all backlog items for those projects.

#### GET `/stats`
**Returns:** `{ success, stats: { total, todo, inProgress, review, done, highPriority, mediumPriority, lowPriority, overdue } }`
Aggregates stats across all user's projects by looping through each project's `Task.getStats()`.

#### GET `/project/:projectId`
**Requires:** Membership in the project
**Returns:** `{ success, tasks: [...] }`

#### POST `/`
**Body:** `{ projectId (required), title (required), description?, priority?, dueDate?, assignee? }`
Creates task with status "todo" and type "TASK".
Sends email notification if `assignee` is provided.

#### PUT `/:id`
**Body:** `{ title?, description?, status?, priority?, dueDate? }`
Maps frontend status values (`todo`, `in-progress`, `review`, `done`) to DB values (`TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`).
Maps priority strings (`urgent`, `high`, `medium`, `low`) to integers (0-3).

#### POST `/:id/comments`
**Body:** `{ text }`
Comments are **generated in-memory** with a UUID (not persisted to Supabase). Returns:
```json
{ "success": true, "comment": { "id": "<uuid>", "author": "...", "text": "...", "createdAt": "..." } }
```

---

### 4. AI Endpoints (`/api/ai`)

**Router:** `routes/ai.js`
**Controller:** `aiController.js`

| Method | Path               | Controller       | Description                                      | Auth |
|--------|--------------------|------------------|--------------------------------------------------|------|
| POST   | `/chat`            | `chat`           | Main AI chat — parse commands or NL processing   | Yes  |
| GET    | `/history`         | `getHistory`     | Get chat history (MongoDB)                       | Yes  |
| POST   | `/check-alerts`    | `checkAlerts`    | Manually trigger task alert generation & email   | Yes  |
| POST   | `/suggest-tasks`   | `suggestTasks`   | AI generates and creates tasks for a project     | Yes  |
| POST   | `/suggest-epics`   | `suggestEpics`   | AI generates epic suggestions for a project      | Yes  |

#### POST `/chat`
**Body:** `{ message, projectId? }`
**Returns:** `{ success, result: { type, message, task?, project? } }`

This is the main AI interaction endpoint. Flow:
1. Validates authentication and message presence
2. Calls `AIService.parseCommand(message, projectId, userId)`
3. If a task was created, sends assignment notification
4. If a project was created, sends invitation notification
5. Saves both user message and AI response to MongoDB (last 50 preserved)
6. Returns the result

**Result types:**
- `task_created` — Task was created via command parsing
- `task_updated` — Task was modified
- `project_created` — Project was created
- `search_results` — Search results for tasks
- `ai_response` — General AI response (DeepSeek NL)
- `help` — Fallback help message when intent unclear
- `error` — Parsing or processing error

#### GET `/history`
**Query:** `?projectId=<id>` (optional)
**Returns:** `{ success, history: [...] }`
Retrieves from MongoDB, returns last 50 messages sorted chronologically (newest-first fetched then reversed).

#### POST `/suggest-tasks`
**Body:** `{ projectId, sprintGoal? }`
**Returns:** `{ success, tasksGenerated: N, tasks: [...] }`
Calls `AIService.generateTasks()` which either mocks data (no API key) or calls DeepSeek with JSON response format. Generated tasks are **immediately created** in the database with status "todo".

#### POST `/suggest-epics`
**Body:** `{ projectId }`
**Returns:** `{ success, epics: [...] }`
Calls `AIService.generateEpics()`. Unlike suggest-tasks, epics are **not persisted** — they're only returned as suggestions.

#### POST `/check-alerts`
Manually triggers alert checking across all tasks, generating emails for overdue/urgent tasks.
**Returns:** `{ success, alertsGenerated: N, alerts: [...] }`

---

## AI System (`services/aiService.js`)

### How It Works

The AI service has a **two-tier command parsing** architecture:

#### Tier 1: Regex Pattern Matching (Fast Path)

When a message contains specific keywords, it bypasses the AI API entirely:

| Keyword Pattern        | Method Called          | What It Does                                       |
|------------------------|------------------------|----------------------------------------------------|
| `crear tarea` / `nueva tarea` | `parseCreateTask()`   | Extracts title via regex, creates task in DB       |
| `actualizar tarea` / `cambiar tarea` | `parseUpdateTask()` | Updates task status (complete/en-progress), priority, or date |
| `asignar a` / `asignar tarea` | `parseAssignTask()`  | Finds user by name match, assigns them to a task   |
| `prioridad` / `cambiar prioridad` | `parseChangePriority()` | Detects priority level (high/medium/low), applies to task |
| `fecha` / `vencimiento` / `due` | `parseSetDueDate()`  | Extracts date using regex (dd/mm/yyyy, yyyy-mm-dd) |
| `buscar` / `mostrar`   | `parseSearchTask()`   | Searches task titles/descriptions for a term       |
| `crear proyecto` / `nuevo proyecto` | `parseCreateProject()` | Extracts project name, creates via DB |

#### Tier 2: DeepSeek NL Processing (Fallback)

If the message doesn't match a fast-path pattern, or if it mentions `proyecto`/`crear`/`nuevo` or is longer than 20 chars:

1. Sends a prompt to the **DeepSeek API** (`deepseek-chat` model)
2. Asks it to detect if the user wants to `create_project` or `create_task`
3. If JSON is returned, executes the action via `Project.create()` or `Task.create()`
4. If no JSON (plain text response), returns it as a chat conversation

**DeepSeek API:** `https://api.deepseek.com/v1/chat/completions`
**API Key:** `process.env.DEEPSEEK_API_KEY`

#### Tier 3: Mock Mode

When no API key is configured (or it contains `your_deepseek_api_key`), the service falls back to hardcoded mock data:

- `generateTasks()` returns 5 sample tasks (arquitectura, landing, autenticación, base de datos, CI/CD)
- `generateEpics()` returns 3 sample epics (Experiencia de Usuario, Autenticación, Motor de Datos)
- `processWithDeepSeek()` falls back to `parseCreateProject()` regex parsing

### AI Features Summary

| Feature                   | Endpoint            | Creates in DB? | Requires AI Key? |
|---------------------------|---------------------|:--------------:|:----------------:|
| Chat command parsing      | POST `/chat`        | Yes (if action)| No (regex first) |
| Free-form NL conversation | POST `/chat`        | Conditional   | Yes              |
| Chat history              | GET `/history`      | No (reads)    | No               |
| Suggest tasks             | POST `/suggest-tasks`| Yes           | No (mock fallback)|
| Suggest epics             | POST `/suggest-epics`| No            | No (mock fallback)|
| Alert checking            | POST `/check-alerts`| No            | No               |

### NLP Parsing Details

- **Priority detection:** Regex matching for `urgente/critica/alta/high` → `high`, `media/normal/medium` → `medium`, `baja/low` → `low`
- **Date extraction:** Supports `dd/mm/yyyy`, `dd-mm-yyyy`, `yyyy/mm/dd`, `yyyy-mm-dd`
- **Assignee extraction:** Iterates all users, matches name in the message (case-insensitive)
- **Task ID extraction:** Finds numeric IDs in message with pattern `/#?(\d+)/`

---

## Notification System (`services/notificationService.js`)

Uses **Nodemailer** with **Gmail SMTP** transport configured via environment:
- `EMAIL_USER` — Gmail sender address
- `EMAIL_PASS` — Gmail app password

### Email Types

| Trigger                       | Method                       | Email Content                              |
|-------------------------------|------------------------------|--------------------------------------------|
| Task created with assignee    | `sendTaskAssignment()`       | Task details, project name, due date       |
| Task updated (if has assignee)| `sendTaskUpdate()`           | Status change, priority, due date          |
| Task due soon (1-3 days)      | `sendTaskDueReminder()`      | AI-generated alert message                 |
| Project invitation            | `sendProjectInvitation()`    | Project name, inviter name, description    |
| Manual alert check            | `checkAllTasksAndNotify()`   | Iterates all non-done tasks with due dates |

### Scheduled Check

In `server.js`, a `setInterval` runs `NotificationService.checkAllTasksAndNotify()` **every 60 minutes**:

```js
setInterval(() => {
    NotificationService.checkAllTasksAndNotify();
}, 60 * 60 * 1000);
```

It iterates all tasks that are:
- Not done
- Have a `dueDate`
- Due in ≤ 3 days, ≤ 1 day, or overdue

For each qualifying task, it calls `sendTaskDueReminder()` which generates an AI alert (via `AIService.generateAlert()`) and sends it via email.

### Alert Generation Logic (`AIService.generateAlert()`)

- **Overdue task (days < 0):** Urgent email "Tarea vencida"
- **Due today/tomorrow (0-1 days):** "Vence pronto" email
- **Due in 2-3 days:** "Recordatorio" email
- **High priority + not done:** Always triggers a high-priority alert regardless of due date

---

## Models Layer

### User (`models/User.js`)

Supabase table: `User`
- `findById(id)` — Returns user without password hash
- `findByEmail(email)` — Returns full user including `password_hash` (for auth)
- `create({ name, email, password })` — Hashes password with bcrypt, inserts
- `update(id, { name, avatar })` — Updates profile fields
- `verifyPassword(plain, hash)` — bcrypt compareSync

All users get `role: 'member'` and `avatar: '👤'` as defaults (not stored in DB).

### Project (`models/Project.js`)

Supabase tables: `project` + `projectuser`
- Uses `enrichProject()` to normalize `id`/`owner` to strings, add defaults for `color`/`icon`/`status`
- `getAll()` — All projects with members (via join on `projectuser`)
- `getById(id)` — Single project with members
- `getByUser(userId)` — Projects where user is owner OR member (combined + deduplicated)
- `create(data)` — Inserts project + adds owner as member with role "PO"
- `update(id, data)` — Updates name/description
- `delete(id)` — Hard deletes: backlog items → projectuser → project (cascade)
- `addMember(projectId, userId)` — INSERT into `projectuser` with role "DEV"

### Task (`models/Task.js`)

Supabase table: `backlogitem`
- Maps frontend statuses (`todo`/`in-progress`/`review`/`done`) ↔ DB (`TODO`/`IN_PROGRESS`/`BLOCKED`/`DONE`)
- Maps priority strings (`urgent`/`high`/`medium`/`low`) ↔ integers (0-3)
- `getTreeByProject(projectId)` — Builds nested tree using `parentId` relationships
- `getStats(projectId)` — Counts tasks by status, priority, and overdue
- `addComment(taskId, comment)` — **Not persisted**; returns a UUID-based comment object in memory

### ChatMessage (`models/mongodb/ChatMessage.js`)

MongoDB model using Mongoose.
- `saveMessage(userId, projectId, role, text, type, metadata)` — Saves interaction
- `getChatHistory(userId, projectId?, limit=50)` — Returns last N messages, newest-first then reversed to chronological
- `cleanOldMessages(userId, projectId?, keepLast=50)` — Deletes messages beyond the keep threshold

---

## Session & Cookie Configuration

```js
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key_12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,          // HTTP (not HTTPS)
        maxAge: 24 * 60 * 60 * 1000   // 24 hours
    }
}));
```

### Security Considerations

1. **Session secret** is hardcoded as fallback (`'secret_key_12345'`) — should always be set via env
2. **Cookie `secure: false`** — should be `true` in production (requires HTTPS)
3. **No CSRF protection** on state-changing endpoints
4. **`middleware/auth.js`** exports `isAuthenticated` and `isAdmin` but they are **not wired into routes**; all auth checks are done inline in each controller method via `req.session.userId`
5. **RLS disabled** on all Supabase tables — backend uses service role key, so this is intentional

---

## Environment Variables

| Variable                    | Required | Description                                  |
|-----------------------------|:--------:|----------------------------------------------|
| `PORT`                      | No       | Server port (default: 3000)                  |
| `SESSION_SECRET`            | Recommended | Session signing secret                   |
| `SUPABASE_URL`              | Yes      | Supabase project URL                         |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes      | Supabase service role key (full DB access)   |
| `MONGODB_URI`               | No       | MongoDB connection string (chat history)     |
| `DEEPSEEK_API_KEY`          | No       | DeepSeek API key (falls back to mock mode)   |
| `EMAIL_USER`                | No       | Gmail address for sending notifications      |
| `EMAIL_PASS`                | No       | Gmail app password for SMTP auth             |

---

## Server Lifecycle

1. **Database initialization** runs as IIFE at startup:
   - Supabase: Tests connectivity by querying `User` table
   - MongoDB: Connects via Mongoose (gracefully degraded if unavailable)
2. Express middleware chain: `json()` → `urlencoded()` → static files → session → API routes → SPA fallback
3. **Notification interval** starts polling tasks every 60 minutes for due-date reminders
4. **SPA fallback:** For any non-API GET request, serves `dist/index.html` (React build) or falls back to `frontend/views/landing.html`