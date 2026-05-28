# Legacy Code Cleaning — Backend

**Purpose:** Document code that is unused, broken, legacy, or represents bad practices.
**Last updated:** 2026-05-28

---

## Critical Issues (Fix Immediately)

### 1. `isAdmin` middleware is broken (`middleware/auth.js:8-14`)

```javascript
function isAdmin(req, res, next) {
    const User = require('../models/User');
    const user = User.findById(req.session.userId); // missing await!
    if (user && user.role === 'admin') {
        return next();
    }
    res.status(403).json({ success: false, message: 'Acceso denegado' });
}
```

**Problem:** `User.findById()` is async and returns a Promise. Without `await`, `user` is always a Promise (truthy) and `user.role` is `undefined`. `isAdmin` always returns 403.

**Fix:** Add `await` and handle user not found.

---

### 2. Comments are never persisted (`models/Task.js:142-149`)

```javascript
static async addComment(taskId, comment) {
    return {
        id: require('crypto').randomUUID(),
        author: comment.author,
        text: comment.text,
        createdAt: new Date().toISOString()
    };
}
```

**Problem:** Returns a fake in-memory object. No Supabase insert. Comments are completely lost.

**Fix:** Create `comments` table or `task_comments` relation, persist via Supabase.

---

### 3. `assignee` field missing in DB schema

Task model handles `assignee` but the `backlogitem` table has no `assignee` column. `Task.create()` never sets it and `Task.update()` doesn't handle it.

**Result:** Assignee is always `null` and task assignment notifications are broken.

**Fix:** Create `task_assignments` table with `(task_id, user_id)` foreign keys.

---

### 4. `project.key` does not exist (`services/notificationService.js:121`)

```javascript
Código del proyecto: ${project.key}
```

**Problem:** `project` table has no `key` column. Email shows `undefined`.

**Fix:** Remove or use `project.id`.

---

## Deprecated / Marked for Removal

### 5. MongoDB (`models/mongodb/ChatMessage.js`)

MongoDB is used only for AI chat message history. This is the wrong tool for the job:
- Chat history is relational (belongs to a user, optionally to a project)
- Supabase Realtime handles live delivery better than MongoDB change streams
- Dual database adds ops complexity with zero benefit at ScrumHub's scale

**Plan:** Drop MongoDB. Migrate ChatMessage to `messages` table in Supabase with `room_id` foreign key. Use Supabase Realtime for live updates.

---

### 6. Legacy HTML routes (`server.js:46-85`)

Routes for `/`, `/login`, `/register`, `/dashboard`, `/project/:id`, `/profile`, `/landing` serve static HTML files from `frontend/views/`. These are fallback routes for an older SPA implementation. The React SPA runs on port 8080 and does not use these.

**Plan:** Remove all legacy HTML routes once React SPA is fully operational.

---

### 7. Dual package lock files

Both `backend/pnpm-lock.yaml` and `backend/package-lock.json` exist. The project uses pnpm.

**Fix:** Delete `package-lock.json`, keep `pnpm-lock.yaml`.

---

### 8. `database/schema.sql` is reference only

The file `database/schema.sql` documents the PostgreSQL schema but is not applied by any code. The actual schema lives in Supabase SQL Editor.

**Plan:** Move to `docs/core/backend/schema.sql` or remove entirely.

---

### 9. `aiService.js` in Node.js (temporary)

Current AI parsing is implemented in Node.js with regex + DeepSeek calls. This is a temporary solution.

**Plan:** Migrate to Python AI Service (FastAPI + LangChain + LiteLLM). Express will proxy AI requests to the Python service. Node.js AI code is deprecated.

---

## Architecture / Design Problems

### 10. Hardcoded session secret fallback (`server.js:32`)

```javascript
secret: process.env.SESSION_SECRET || 'secret_key_12345'
```

**Problem:** If `SESSION_SECRET` is not set, a well-known default is used. This is a security risk.

**Fix:** Throw an error at startup if `SESSION_SECRET` is missing.

---

### 11. No global error handler

Unhandled promise rejections or exceptions in async routes crash the Express server with no error response to the client.

**Fix:** Add `express-async-errors` and a global error middleware.

---

### 12. No input validation

Controllers pass raw `req.body` directly to model methods. No schema validation (no Joi, Zod, or similar).

**Fix:** Add Zod middleware for all request bodies.

---

### 13. Role-based access is fake

`User.findById()` and `User.findByEmail()` both hardcode `role: 'member'` for every user. The `User` table has no `role` column. There is no admin role in the system.

**Fix:** Add `role` column to `User` table if admin functionality is needed.

---

### 14. Supabase client can be null

`supabase` is set to `null` if credentials are missing. Models call `supabase.from(...)` without null checks, which will throw.

**Fix:** Add null check at startup and throw if Supabase cannot be initialized.

---

### 15. `Task.getStats()` is inefficient

```javascript
const tasks = projectId ? await Task.getByProject(projectId) : await Task.getAll();
return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    // ...
};
```

**Problem:** Fetches all tasks into memory just to count them.

**Fix:** Use Supabase's `.count()` or aggregations.

---

### 16. Magic strings everywhere

Status mappings, priority mappings, route paths — all hardcoded strings repeated across files with no constants/enums.

**Fix:** Create a shared constants file (`backend/constants.js`).

---

## AI / DeepSeek Specific Issues

### 17. Spanish hardcoded command strings

Patterns like `crear tarea`, `asignar a`, `cambiar prioridad` are Spanish-only. The codebase uses English conventions elsewhere.

**Fix:** Use language-agnostic patterns or i18n.

---

### 18. AI service is single-provider (DeepSeek only)

Current AI integration only supports DeepSeek. No abstraction for multi-provider (OpenAI, Anthropic, Ollama).

**Plan:** Python AI service will use LiteLLM for provider abstraction.

---

## Priority Cleaning Order

| Priority | Item | Impact |
|----------|------|--------|
| P0 | Fix `isAdmin` middleware (add `await`) | Security |
| P0 | Persist comments to DB | Data loss |
| P0 | Add `task_assignments` table for assignee | Core feature broken |
| P1 | Remove hardcoded session secret fallback | Security |
| P1 | Add global error handler | Reliability |
| P1 | Add input validation (Zod) | Security |
| P1 | Drop MongoDB, migrate to `messages` table | Reduce complexity |
| P2 | Remove legacy HTML routes | Code reduction |
| P2 | Remove dual lock files | Maintenance |
| P2 | Add `task_assignments` table | Fix broken feature |
| P3 | Move schema.sql to docs | Cleanup |
| P3 | Fix `project.key` reference | UX (email) |
| P3 | Replace `Task.getStats()` with SQL aggregation | Performance |
| P3 | Add constants file for magic strings | Maintainability |

---

## Future State (After Migration)

After completing the migration roadmap:

- **MongoDB** → removed, chat history in Supabase `messages` table
- **Node.js AI regex** → removed, Express proxies to Python AI service
- **`project.description` TEXT** → replaced by `project_documents` table with Markdown
- **`backlogitem.assignee`** → replaced by `task_assignments` table
- **Single database** → Supabase PostgreSQL with pgvector for RAG
- **Dual lock files** → single `pnpm-lock.yaml`
- **Legacy HTML routes** → removed
- **No global error handler** → `express-async-errors` + error middleware
- **No input validation** → Zod schemas on all endpoints
- **Hardcoded session secret** → required env var, startup throw if missing