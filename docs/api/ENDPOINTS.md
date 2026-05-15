# ENDPOINTS.md — API Route Status & Dashboard

**This file owns:** Route definitions and implementation status.
**For detailed JSON shapes:** See [SCHEMAS.md](./SCHEMAS.md)
**For pure entities:** See [domain/ERD.md](../domain/ERD.md)
**Last updated:** 2026-05-15

---

## Status Key
- ✅ **Ready**: Fully implemented and tested.
- 🚧 **Building**: Implementation in progress.
- 📋 **Planned**: Scoped but not yet started.

---

## 1. Authentication
| Method | Path | Status | Returns | Notes |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | ✅ Ready | `Token + User` | See [SCHEMAS.md#auth](./SCHEMAS.md#auth) |
| POST | `/api/auth/register` | ✅ Ready | `User` | |
| POST | `/api/auth/logout` | ✅ Ready | — | |
| GET | `/api/auth/me` | ✅ Ready | `User` | |

## 2. Users
| Method | Path | Status | Returns | Notes |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/users` | ✅ Ready | `User[]` | |
| GET | `/api/users/:id` | ✅ Ready | `User` | |
| PUT | `/api/users/:id` | ✅ Ready | `User` | |
| GET | `/api/users/:id/scrum-roles` | ✅ Ready | `Role[]` | |

## 3. Projects
| Method | Path | Status | Returns | Notes |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/projects/all` | ✅ Ready | `Project[]` | |
| GET | `/api/projects/:id` | ✅ Ready | `Project` | |
| POST | `/api/projects` | ✅ Ready | `Project` | |
| GET | `/api/projects/:id/members` | ✅ Ready | `Member[]` | |
| GET | `/api/projects/:id/stats` | ✅ Ready | `Stats` | See [SCHEMAS.md#stats](./SCHEMAS.md#stats) |
| GET | `/api/projects/:id/sections` | ✅ Ready | `Section[]` | |
| PATCH | `/api/projects/:id/sections/reorder` | ✅ Ready | — | |

## 4. Backlogs & Tasks
| Method | Path | Status | Returns | Notes |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/projects/:id/backlogs` | 📋 Planned | `Backlog[]` | |
| GET | `/api/tasks` | ✅ Ready | `Task[]` | |
| POST | `/api/tasks` | ✅ Ready | `Task` | |
| PATCH | `/api/tasks/:id/status` | ✅ Ready | `Task` | Optimized for drag-drop |
| GET | `/api/tasks/:id/subtasks` | ✅ Ready | `Task[]` | Recursive tree |
| POST | `/api/tasks/:id/comments` | ✅ Ready | `Comment` | |
| POST | `/api/tasks/:id/attachments` | ✅ Ready | `Attachment` | Multipart/form-data |

## 5. Sprints
| Method | Path | Status | Returns | Notes |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/projects/:id/sprints` | ✅ Ready | `Sprint[]` | |
| POST | `/api/projects/:id/sprints` | ✅ Ready | `Sprint` | |
| POST | `/api/sprints/:id/activate` | 📋 Planned | — | |
| POST | `/api/sprints/:id/complete` | 📋 Planned | — | |
| POST | `/api/sprints/:id/tasks` | ✅ Ready | — | Assign tasks to sprint |

## 6. Chat & Channels
| Method | Path | Status | Returns | Notes |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/projects/:id/chatroom` | ✅ Ready | `Chatroom` | |
| GET | `/api/chatrooms/:id/channels` | ✅ Ready | `Channel[]` | |
| GET | `/api/channels/:id/messages` | ✅ Ready | `Message[]` | Cursor-based |
| POST | `/api/channels/:id/messages` | ✅ Ready | `Message` | |

## 7. AI & RAG
| Method | Path | Status | Returns | Notes |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/ai/chat` | ✅ Ready | `AI Message` | See [SCHEMAS.md#ai](./SCHEMAS.md#ai) |
| GET | `/ai/sessions` | ✅ Ready | `Session[]` | |
| POST | `/ai/transcribe` | ✅ Ready | `Transcription` | |
| GET | `/ai/search` | ✅ Ready | `SearchResult[]` | Semantic search |

## 8. Infrastructure
| Method | Path | Status | Returns | Notes |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/subscription` | ✅ Ready | `Subscription` | |
| GET | `/api-keys` | ✅ Ready | `Key[]` | Secret values hidden |
| GET | `/notifications` | ✅ Ready | `Notification[]` | |