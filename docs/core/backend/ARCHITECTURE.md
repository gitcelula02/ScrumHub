# Backend Architecture

**This file owns:** Backend folder structure, Express.js route organization, middleware, database configuration, and service layer.
**For frontend architecture:** See [core/ARCHITECTURE.md](../ARCHITECTURE.md)
**For API endpoints:** See [api/ENDPOINTS.md](../../api/ENDPOINTS.md)
**For entity schemas:** See [domain/ERD.md](../../domain/ERD.md)
**Last updated:** 2026-05-28

---

## Overview

The backend is a **polyglot system** with two services:

| Service | Technology | Purpose |
|---------|------------|---------|
| **Express API** | Node.js + Express | REST API for CRUD, auth, routing, Supabase Realtime |
| **AI Service** | Python + FastAPI | Multi-provider model routing, RAG pipeline, agent loops |

The Express API serves the React SPA frontend. The AI Service is never called directly by the frontend — Express proxies AI requests to it internally.

**Database:** Supabase (PostgreSQL + pgvector + Realtime) — single database for all data including chat and future RAG embeddings.

**Key characteristics:**
- JavaScript/CommonJS for Express (current), Python for AI (future migration)
- Session-based authentication via `express-session`
- RESTful API design
- AI proxy (DeepSeek, OpenAI, Anthropic, Ollama) via Python service
- Background job for email notifications (runs every 60 minutes)
- **MongoDB is deprecated** — will be replaced by Supabase Realtime + messages table

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         React SPA (port 8080)                   │
└─────────────────────────────────────────────────────────────────┘
                                │ HTTP
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express API (port 3000)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  routes  │ │controllers│ │  models  │ │ services │          │
│  │  /auth   │ │          │ │  User.js │ │ aiService│          │
│  │  /projects│          │ │ Project.js│ │notifSvc  │          │
│  │  /tasks  │ │          │ │  Task.js │ └──────────┘          │
│  │  /ai     │ └──────────┘ └──────────┘                        │
│  └──────────┘         │                                         │
│                       │ supabase-js                             │
│                       ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase PostgreSQL                          │  │
│  │  User │ project │ projectuser │ backlogitem │ rooms │    │  │
│  │  messages │ project_documents │ embeddings │ document_links │ │
│  │  + pgvector + Realtime subscriptions                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │ HTTP (internal)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Python AI Service (future)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ FastAPI  │ │ LangChain│ │  pgvector│ │ LiteLLM  │          │
│  │ endpoints│ │  agents  │ │  RAG     │ │ multi-prov│          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

### Express API (`backend/`)

```
backend/
├── config/
│   └── database.js         # Supabase connection (MongoDB deprecated)
├── controllers/            # Request handlers
│   ├── aiController.js     # Proxies to Python AI service
│   ├── authController.js
│   ├── projectController.js
│   ├── taskController.js
│   └── userController.js
├── database/
│   └── schema.sql          # PostgreSQL schema reference
├── middleware/
│   └── auth.js             # isAuthenticated, isAdmin
├── models/                 # Data access layer (Supabase)
│   ├── Project.js
│   ├── Task.js
│   └── User.js
├── routes/                 # Express Router definitions
│   ├── ai.js
│   ├── auth.js
│   ├── projects.js
│   └── tasks.js
├── services/
│   ├── aiService.js        # Proxies to Python AI service (current)
│   └── notificationService.js
└── server.js              # Express entry point
```

### Python AI Service (`ai-service/`) — future

```
ai-service/
├── app/
│   ├── main.py             # FastAPI entry point
│   ├── routers/
│   │   ├── chat.py         # /chat endpoint
│   │   └── embeddings.py  # /embed endpoint
│   ├── services/
│   │   ├── llm_service.py # Multi-provider (DeepSeek, OpenAI, Anthropic, Ollama)
│   │   ├── rag_service.py  # Chunking, embedding, retrieval
│   │   └── agent_service.py # Tool calling, agent loops
│   └── utils/
│       ├── chunker.py
│       └── embeddings.py
├── requirements.txt
└── Dockerfile
```

---

## Current vs Target Architecture

| Concern | Current | Target |
|---------|---------|--------|
| Database | Supabase + MongoDB (dual) | Supabase only (drop MongoDB) |
| AI layer | Node.js regex + DeepSeek only | Python microservice with multi-provider |
| Chat storage | MongoDB (ChatMessage) | Supabase `messages` table + Realtime |
| RAG | None | pgvector + namespaced embeddings |
| Project docs | `description TEXT` column | `project_documents` table |
| AI isolation | None | RLS + composite namespace key |
| Language | Node.js only | Node.js (API) + Python (AI) |

---

## Server Entry Point (`server.js`)

1. **Environment loading** via `dotenv`
2. **Database initialization** — Supabase connection only (MongoDB deprecated)
3. **Express middleware**: json, urlencoded, static files, session
4. **API route mounting**: `/api/auth`, `/api/projects`, `/api/tasks`, `/api/ai`
5. **Legacy HTML routes** (deprecated, to be removed)
6. **Health check**: `GET /api/health`
7. **Background job**: `NotificationService.checkAllTasksAndNotify()` every 60 minutes
8. **HTTP server startup** on port 3000

---

## API Routes

### `/api/auth`

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| POST | `/login` | `AuthController.login` | No |
| POST | `/register` | `AuthController.register` | No |
| POST | `/logout` | `AuthController.logout` | No |
| GET | `/me` | `AuthController.getCurrentUser` | Yes |
| GET | `/users` | `UserController.getAll` | Yes |
| GET | `/users/:id` | `UserController.getById` | Yes |
| PUT | `/users/:id` | `UserController.updateProfile` | Yes |

### `/api/projects`

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| GET | `/all` | `ProjectController.getAll` | Yes |
| GET | `/:id` | `ProjectController.getById` | Yes |
| GET | `/:id/tree` | `ProjectController.getTree` | Yes |
| GET | `/:id/documents` | `ProjectController.getDocuments` | Yes |
| POST | `/` | `ProjectController.create` | Yes |
| POST | `/:id/documents` | `ProjectController.createDocument` | Yes |
| PUT | `/:id` | `ProjectController.update` | Yes |
| DELETE | `/:id` | `ProjectController.delete` | Yes |
| POST | `/:id/members` | `ProjectController.addMember` | Yes |

### `/api/tasks`

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| GET | `/my-tasks` | `TaskController.getMyTasks` | Yes |
| GET | `/stats` | `TaskController.getStats` | Yes |
| GET | `/project/:projectId` | `TaskController.getByProject` | Yes |
| GET | `/` | `TaskController.getAll` | Yes |
| GET | `/:id` | `TaskController.getById` | Yes |
| POST | `/` | `TaskController.create` | Yes |
| PUT | `/:id` | `TaskController.update` | Yes |
| DELETE | `/:id` | `TaskController.delete` | Yes |
| POST | `/:id/comments` | `TaskController.addComment` | Yes |

### `/api/ai`

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| POST | `/chat` | `AIController.chat` | Yes |
| GET | `/history` | `AIController.getHistory` | Yes |
| POST | `/check-alerts` | `AIController.checkAlerts` | Yes |

---

## Data Models

### Supabase Models (PostgreSQL via `@supabase/supabase-js`)

#### User Model (`models/User.js`)
- `getAll()`, `findById(id)`, `findByEmail(email)`, `create(userData)`, `update(id, fields)`, `delete(id)`, `verifyPassword(plain, hashed)`

#### Project Model (`models/Project.js`)
- `getAll()`, `getById(id)`, `getByUser(userId)`, `create(data)`, `update(id, fields)`, `delete(id)`, `addMember(projectId, userId)`

#### Task Model (`models/Task.js`)
- `getAll()`, `getById(id)`, `getByProject(projectId)`, `getByUser(userId)`, `create(taskData)`, `update(id, fields)`, `delete(id)`, `addComment(taskId, comment)` — **TODO: persist to DB**, `getStats(projectId)`, `getTreeByProject(projectId)`

**Status mapping:** `todo ↔ TODO`, `in-progress ↔ IN_PROGRESS`, `review ↔ BLOCKED`, `done ↔ DONE`
**Priority mapping:** `urgent ↔ 0`, `high ↔ 1`, `medium ↔ 2`, `low ↔ 3`

---

## Database Schema (Supabase PostgreSQL)

### Current Tables

| Table | Columns | Notes |
|-------|---------|-------|
| `User` | id, email, password_hash, name, created_at, updated_at | No role column (hardcoded in code) |
| `project` | id, name, description, owner_id, created_at, updated_at | `description` to be replaced |
| `projectuser` | id, project_id, user_id, role, created_at | |
| `backlogitem` | id, project_id, parent_id, title, description, status, priority, due_date, type, order_index, created_at, updated_at | No assignee column |

### Target Tables (migration planned)

**`rooms`** — unifies all chat contexts
```sql
id BIGSERIAL PRIMARY KEY,
project_id BIGINT REFERENCES project(id) ON DELETE SET NULL,  -- null for personal AI sessions
type TEXT NOT NULL,  -- 'project_chat' | 'private' | 'ai_session' | 'voice_session'
created_at TIMESTAMPTZ DEFAULT NOW()
```

**`messages`** — replaces MongoDB ChatMessage
```sql
id BIGSERIAL PRIMARY KEY,
room_id BIGINT REFERENCES rooms(id) ON DELETE CASCADE,
user_id BIGINT REFERENCES "User"(id) ON DELETE SET NULL,  -- null for AI messages
role TEXT NOT NULL,  -- 'user' | 'assistant' | 'system' | 'transcription'
content TEXT NOT NULL,
type TEXT DEFAULT 'text',  -- 'text' | 'transcription' | 'ai'
metadata JSONB DEFAULT '{}',  -- commandType, embedding refs, etc.
created_at TIMESTAMPTZ DEFAULT NOW()
```

**`project_documents`** — replaces project.description
```sql
id BIGSERIAL PRIMARY KEY,
project_id BIGINT REFERENCES project(id) ON DELETE CASCADE,
type TEXT NOT NULL,  -- 'readme' | 'spec' | 'adr' | 'wiki'
title TEXT,
content TEXT,  -- Markdown stored as text, rendered client-side
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
```

**`documents`** — Obsidian-in-ScrumHub foundation
```sql
id BIGSERIAL PRIMARY KEY,
project_id BIGINT REFERENCES project(id) ON DELETE CASCADE,
type TEXT NOT NULL,  -- 'feature_spec' | 'adr' | 'epic' | 'user_story' | 'wiki' | 'readme'
title TEXT NOT NULL,
content TEXT,
status TEXT DEFAULT 'draft',  -- 'draft' | 'in_progress' | 'done' | 'discarded'
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
```

**`document_links`** — wikilink graph
```sql
id BIGSERIAL PRIMARY KEY,
source_doc_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
target_doc_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
anchor_text TEXT,
UNIQUE(source_doc_id, target_doc_id)
```

**`task_assignments`** — explicit assignee (fixes missing column)
```sql
id BIGSERIAL PRIMARY KEY,
task_id BIGINT REFERENCES backlogitem(id) ON DELETE CASCADE,
user_id BIGINT REFERENCES "User"(id) ON DELETE CASCADE,
assigned_at TIMESTAMPTZ DEFAULT NOW(),
UNIQUE(task_id, user_id)
```

**`embeddings`** — RAG storage with namespaced isolation
```sql
id BIGSERIAL PRIMARY KEY,
project_id BIGINT REFERENCES project(id) ON DELETE CASCADE,
user_id BIGINT REFERENCES "User"(id) ON DELETE SET NULL,  -- null for project-level shared
content TEXT NOT NULL,
embedding vector(1536),  -- pgvector for OpenAI text-embedding-3-small
metadata JSONB DEFAULT '{}',
created_at TIMESTAMPTZ DEFAULT NOW()
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON embeddings(project_id, user_id);  -- composite filter
```

---

## RAG Isolation Architecture

Context isolation is enforced at the **database layer via RLS**, not application layer.

### Namespace Strategy

Every embedding belongs to a composite namespace:
- **Project-level shared:** `project_id = X, user_id = NULL` — all project members can retrieve
- **Personal per project:** `project_id = X, user_id = Y` — only the user can retrieve
- **Personal only:** `project_id = NULL, user_id = Y` — cross-project personal context

### Query Pattern

```sql
-- Retrieve embeddings for AI context: project A, user Y's personal context
SELECT content, metadata
FROM embeddings
WHERE project_id = $1 AND (user_id = $2 OR user_id IS NULL);
```

### RLS Policies

```sql
-- Embeddings: user can only see their own personal or project-shared embeddings
CREATE POLICY embeddings_isolation ON embeddings
FOR SELECT USING (
  (user_id = auth.uid()) OR
  (user_id IS NULL AND EXISTS (
    SELECT 1 FROM projectuser WHERE project_id = embeddings.project_id AND user_id = auth.uid()
  ))
);
```

This means even a bug in application code cannot leak cross-project or cross-user context — the database enforces it.

---

## AI Service Architecture (Python)

### Why Python?

The AI layer requires:
- Multi-provider model routing (OpenAI, Anthropic, DeepSeek, Ollama)
- Tool/function calling with structured schemas
- RAG pipeline (chunking, embedding, retrieval, reranking)
- Agent loops (AI calls tool → gets result → decides next step)
- Personality + system prompt composition per user

The Node.js ecosystem has no production-ready equivalent to LangChain/LangGraph, LlamaIndex, instructor, or LiteLLM. Building this in Node would be rebuilding years of tooling from scratch.

### Stack

| Concern | Tool |
|---------|------|
| Web framework | FastAPI |
| LLM routing | LiteLLM (unified interface for OpenAI, Anthropic, DeepSeek, Ollama) |
| RAG | LangChain + pgvector |
| Agent framework | LangGraph |
| Embeddings | OpenAI `text-embedding-3-small` (1536 dims) |

### API Contract (Express → Python)

Express proxies to Python service internally. The contract:

```
POST /ai/chat → POST http://python-ai:8000/chat
Body: { message, projectId, userId, context }
Response: { message, type, task?, project?, metadata }
```

```
POST /ai/embed → POST http://python-ai:8000/embed
Body: { content, projectId, userId }
Response: { embedding: number[] }
```

```
GET /ai/history?roomId=X → GET http://python-ai:8000/history?roomId=X
Response: { history: Message[] }
```

### Multi-Provider Strategy

LiteLLM handles provider abstraction. Configuration via environment:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
OLLAMA_BASE_URL=http://localhost:11434
```

The AI service routes based on task type:
- **Complex reasoning / agent loops** → Anthropic Claude
- **Fast regex-style commands** → DeepSeek
- **Code generation** → OpenAI GPT-4
- **Local dev** → Ollama ( llama3.2 )

---

## Messaging / Chat Architecture

### Room Model

All conversational contexts are **rooms**:

| Room Type | Description |
|-----------|-------------|
| `project_chat` | Group chat for a project |
| `private` | Direct message between two users |
| `ai_session` | AI assistant conversation |
| `voice_session` | Voice transcription thread |

An AI session for project creation has `project_id = NULL` until the project is created, then the room is updated.

### Message Flow

1. User sends message → Express → stored in `messages` table → Supabase Realtime broadcast
2. AI session → Express proxies to Python AI service → response stored → Realtime broadcast

Supabase Realtime handles live delivery. No separate WebSocket infrastructure needed.

### Voice Transcription

Voice messages are stored as messages with:
- `role: 'user'`
- `type: 'transcription'`
- `metadata.audio_ref` — reference to stored audio file
- `metadata.duration` — seconds

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port (default: 3000) | No |
| `SESSION_SECRET` | Signed session cookie secret | **Yes** (no fallback) |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `MONGODB_URI` | MongoDB connection string | **Deprecated** |
| `DEEPSEEK_API_KEY` | DeepSeek API key (current AI) | Optional |
| `EMAIL_USER` | Gmail for notifications | Optional |
| `EMAIL_PASS` | Gmail app password | Optional |

---

## CORS Configuration

No CORS middleware. Frontend (port 8080) calls backend (port 3000) directly during development. In production, both served from the same origin.

---

## Migration Roadmap

### P0 — Correctness (immediate)

| Issue | Fix |
|-------|-----|
| `isAdmin` middleware broken (missing `await`) | Add `await` |
| Comments not persisted | Create `comments` table, persist in `Task.addComment()` |
| Add `task_assignee` column | Create `task_assignments` table |

### P1 — Architectural Cleanup (short-term)

| Issue | Fix |
|-------|-----|
| MongoDB still running | Drop MongoDB, migrate ChatMessage to `messages` table |
| `project.description` is plain text | Create `project_documents` table |
| No input validation | Add Zod middleware |
| Hardcoded session secret fallback | Throw at startup if `SESSION_SECRET` missing |
| No global error handler | Add `express-async-errors` + global handler |

### P2 — New Capabilities (medium-term)

| Feature | Implementation |
|---------|----------------|
| Unified chat | Create `rooms` + `messages` tables, enable Supabase Realtime |
| Task assignee persistence | Create `task_assignments` table |
| AI proxy to Python | Express proxies to FastAPI, remove Node.js regex AI |
| Input validation | Zod schemas for all request bodies |

### P3 — RAG + Knowledge Graph (long-term)

| Feature | Implementation |
|---------|----------------|
| Vector storage | Enable pgvector in Supabase, create `embeddings` table |
| RAG isolation | Composite namespace key (project_id, user_id) + RLS policies |
| Document wikilinks | Create `documents` + `document_links` tables |
| Block-based documents | JSON content in `documents.content` (future) |

---

## Key Rules

- Express uses CommonJS (`require()`, not ESM `import`)
- AI Service uses Python + FastAPI (future migration)
- Models return plain JavaScript objects, not typed interfaces
- Controllers handle HTTP concerns; Services handle business logic
- Session-based auth via `express-session` — no JWT
- RAG isolation enforced at **database layer via RLS**, not application
- No `any` types in TypeScript frontend code

---

## Current Known Issues

| # | Issue | Severity |
|---|-------|----------|
| 1 | `isAdmin` middleware broken (missing `await`) | Critical |
| 2 | `Task.addComment()` does not persist | Critical |
| 3 | `assignee` not in schema | High |
| 4 | `project.key` reference doesn't exist | Medium |
| 5 | Role-based access is fake (no `role` column) | Medium |
| 6 | Supabase client can be null | Medium |
| 7 | No input validation | Medium |
| 8 | No global error handler | Medium |
| 9 | MongoDB adds ops complexity for chat history | Medium |
| 10 | Hardcoded session secret fallback | High |

---

*For entity definitions, see [domain/ERD.md](../../domain/ERD.md)*
*For API endpoint status, see [api/ENDPOINTS.md](../../api/ENDPOINTS.md)*