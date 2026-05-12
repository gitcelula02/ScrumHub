# ScrumHub - Frontend API Calls Reference

This document maps every API call made from the frontend to its consuming component/page and explains what each call is used for and how it works.

---

## Service Files

API calls are centralized in these JavaScript service modules:

| File                              | Base URL       | Purpose                          |
|-----------------------------------|----------------|----------------------------------|
| `frontend/public/js/api.js`       | `/api/auth`    | Authentication service           |
| `frontend/public/js/projects.js`  | `/api/projects`| Projects service                 |
| `frontend/public/js/tasks.js`     | `/api/tasks`   | Tasks service                    |
| `frontend/public/js/ai.js`        | `/api/ai`      | AI chat service                  |
| `frontend/public/js/chatbot.js`   | `/api/ai`      | Dashboard chatbot service        |

All service calls (except `ai.js`) use `credentials: 'include'` for cookie-based session auth. Unauthorized (401) responses trigger a redirect to `/login`.

---

## 1. Auth API Calls (service: `api.js`)

### `checkAuth()`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | GET                                      |
| **URL**    | `/api/auth/me`                           |
| **Used by**| `login.html`, `register.html`, `dashboard.html`, `project.html`, `profile.html`, `landing.html` |
| **Purpose**| Verify if user is already logged in. If authenticated, redirects to appropriate page (dashboard for landing/login/register). If not, returns `null`. |

**Flow:**
1. Every page calls `checkAuth()` on `DOMContentLoaded`
2. **Login/Register/Landing pages:** If user is logged in → redirect to `/dashboard`
3. **Dashboard/Project/Profile pages:** If not logged in → redirect to `/login`
4. On success, stores user data in `localStorage['user']` (only in `api.js` checkAuth)

---

### `login(email, password)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | POST                                     |
| **URL**    | `/api/auth/login`                        |
| **Body**   | `{ email, password }`                    |
| **Used by**| `login.html`                             |
| **Purpose**| Authenticate user with credentials. On success, redirects to `/dashboard`. On failure, shows inline error message. |

**How it works:**
1. User submits login form
2. `api.js` sends POST with JSON body
3. On `200`: session cookie is set by browser, user redirected to `/dashboard`
4. On `4xx/5xx`: error message displayed in the `.error-message` element

---

### `register(name, email, password)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | POST                                     |
| **URL**    | `/api/auth/register`                     |
| **Body**   | `{ name, email, password }`              |
| **Used by**| `register.html`                          |
| **Purpose**| Create a new user account. On success, redirects to `/dashboard`. Validates password length ≥ 6 on frontend before sending. |

**How it works:**
1. User fills registration form
2. Frontend validates password ≥ 6 chars
3. Sends POST with name, email, password
4. On `200`: auto-logged in via session, redirected to `/dashboard`
5. On `400`: email already taken / invalid fields, error shown

---

### `logout()`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | POST                                     |
| **URL**    | `/api/auth/logout`                       |
| **Body**   | None                                     |
| **Used by**| `dashboard.html` (sidebar), `profile.html` (sidebar) |
| **Purpose**| Destroy server session. After success, clears `localStorage['user']` and redirects to `/login`. |

**How it works:**
1. Clicked from sidebar "Cerrar sesion" button
2. Server destroys session
3. Client clears localStorage and redirects

---

### `updateProfile` (inline in `profile.html`)

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | PUT                                      |
| **URL**    | `/api/auth/users/{user.id}`              |
| **Body**   | `{ name, avatar }`                       |
| **Used by**| `profile.html` (form submit handler)     |
| **Purpose**| Update the user's display name and/or avatar. **Bypasses** the `api.js` service—uses a direct `fetch()` call without `credentials: 'include'`. |

**How it works:**
1. User edits name/avatar in profile form
2. Form submit handler reads `user.id` from `localStorage['user']`
3. Sends a direct `fetch()` PUT request
4. On success, updates `localStorage['user']` and reloads the page

---

## 2. Projects API Calls (service: `projects.js`)

### `getProjects()` → `ProjectAPI.getAll()`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | GET                                      |
| **URL**    | `/api/projects/all`                      |
| **Used by**| `dashboard.html`, `project.html` (sidebar) |
| **Purpose**| Fetch all projects the current user is owner or member of, enriched with member objects and per-project task stats. |

**How it works in Dashboard:**
1. Called by `loadProjects()` after `checkAuth()` succeeds
2. Iterates results to render project cards with:
   - Project name, description, color, icon
   - Member avatars (first 5 shown, "+N" overflow)
   - Task stats (todo/in-progress/done counts)
3. Also populates the "Select for AI chat" dropdown (`#ai-project-select`)

**How it works in Project Page:**
1. Called by `loadSidebarProjects()` to populate the left sidebar project list
2. Each project listed with colored dot, name, and task count

---

### `getProject(id)` → `ProjectAPI.getById(id)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | GET                                      |
| **URL**    | `/api/projects/{id}`                     |
| **Used by**| `project.html`                           |
| **Purpose**| Fetch a single project with its members, tasks, and stats. This is the main data load for the Kanban board view. |

**How it works:**
1. Called by `loadProject(projectId)` on page load
2. Receives project object with nested `tasks` array and `stats`
3. Populates:
   - Project header (name, description, members)
   - Kanban columns (todo, in-progress, review, done) with task cards
   - Task detail modal content
   - Project stats counters

---

### `createProject(data)` → `ProjectAPI.create(data)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | POST                                     |
| **URL**    | `/api/projects/`                         |
| **Body**   | `{ name, description?, color?, icon? }`  |
| **Used by**| `dashboard.html`                         |
| **Purpose**| Create a new project from the dashboard modal form. |

**How it works:**
1. User clicks "Nuevo Proyecto" button → opens modal
2. Fills name (required) and description (optional)
3. Selects a color from preset palette
4. On submit, calls `ProjectAPI.create(data)`
5. On success: closes modal, reloads project list via `loadProjects()`

---

### `updateProject(id, data)` → `ProjectAPI.update(id, data)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | PUT                                      |
| **URL**    | `/api/projects/{id}`                     |
| **Body**   | `{ name?, description? }`                |
| **Used by**| `dashboard.html`                         |
| **Purpose**| Edit an existing project's name or description from the project edit modal. |

**How it works:**
1. User clicks edit icon on a project card → opens edit modal
2. Modal pre-fills current name and description
3. User modifies and submits
4. On success: closes modal, reloads project list

---

### `deleteProject(id)` → `ProjectAPI.delete(id)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | DELETE                                   |
| **URL**    | `/api/projects/{id}`                     |
| **Used by**| `dashboard.html`                         |
| **Purpose**| Delete a project and all its tasks. Only the project owner can do this. |

**How it works:**
1. User clicks trash icon on project card
2. Confirmation dialog appears
3. On confirm, sends DELETE request
4. On success: removes project card from DOM and reloads list

---

### `addMember(projectId, email)` → `ProjectAPI.addMember(projectId, email)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | POST                                     |
| **URL**    | `/api/projects/{projectId}/members`      |
| **Body**   | `{ email }`                              |
| **Used by**| `projects.js` (not currently called from any HTML page in the codebase) |
| **Purpose**| Add a user to a project by their email address. Available via the service but not wired into any UI. |

---

### `getTree(projectId)` → `ProjectAPI.getTree(projectId)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | GET                                      |
| **URL**    | `/api/projects/{projectId}/tree`         |
| **Used by**| `project.html`                           |
| **Purpose**| Get the hierarchical task tree for the project (parent-child relationships). Used to render the "Tree View" / "Epics" panel on the project page. |

**How it works:**
1. Called by `refreshTree()` function in `project.html`
2. Builds a nested tree structure where tasks with `parentId` are children
3. Renders the tree in the sidebar panel with expand/collapse for items with children
4. Clicking a tree item opens its task detail modal

---

## 3. Tasks API Calls (service: `tasks.js`)

### `getMyTasks()` → `TaskAPI.getMyTasks()`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | GET                                      |
| **URL**    | `/api/tasks/my-tasks`                    |
| **Used by**| `dashboard.html`                         |
| **Purpose**| Fetch all tasks from all projects the current user is a member of. Displayed in the "My Tasks" panel on the dashboard. |

**How it works:**
1. Called by `showMyTasks()` when user clicks "Mis Tareas" sidebar link
2. Renders a list of task cards with title, project name, status badge, priority badge
3. Clicking a task navigates to the project page: `/project?id={task.projectId}`

---

### `getStats()` → `TaskAPI.getStats()`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | GET                                      |
| **URL**    | `/api/tasks/stats`                       |
| **Used by**| `dashboard.html`                         |
| **Purpose**| Get aggregated task statistics across all user's projects for the dashboard stats panel. |

**How it works:**
1. Called by `loadStats()` after project list loads
2. Receives combined stats: `{ total, todo, inProgress, review, done, highPriority, mediumPriority, lowPriority, overdue }`
3. Updates stat cards on dashboard: total tasks, to-do, in progress, in review, completed, overdue

---

### `getTasksByProject(projectId)` → `TaskAPI.getByProject(projectId)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | GET                                      |
| **URL**    | `/api/tasks/project/{projectId}`         |
| **Used by**| `project.html`                           |
| **Purpose**| Fetch all tasks for a specific project. Used by `generateTreeWithAI()` in the project page to get task list for AI tree generation. |

**How it works:**
1. Called when user clicks "Generate Tree with AI" button on the project page
2. Fetches current project tasks
3. Sends tasks + project context to the AI chat endpoint for structuring into a hierarchy

---

### `createTask(data)` → `TaskAPI.create(data)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | POST                                     |
| **URL**    | `/api/tasks/`                            |
| **Body**   | `{ projectId, title, description?, priority?, dueDate?, assignee? }` |
| **Used by**| `project.html`                           |
| **Purpose**| Create a new task in the Kanban board. |

**How it works:**
1. User clicks "+ Add Task" in any Kanban column
2. Quick-create form appears: title input + submit
3. Also available via the "New Task" modal with full fields
4. On success: new task card added to the "To Do" column, Kanban re-rendered
5. If assignee is set, sends email notification (server-side)

---

### `updateTask(id, data)` → `TaskAPI.update(id, data)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | PUT                                      |
| **URL**    | `/api/tasks/{id}`                        |
| **Body**   | `{ title?, description?, status?, priority?, dueDate?, assignee? }` |
| **Used by**| `project.html`                           |
| **Purpose**| Update task properties. Called from multiple UI interactions on the Kanban board. |

**Used for these specific actions:**

| Action                    | Fields Updated     |
|---------------------------|--------------------|
| Drag task to another column | `{ status }`     |
| Change priority dropdown   | `{ priority }`   |
| Reassign task dropdown     | `{ assignee }`   |
| Edit task in modal         | `{ title, description }` |

**How it works:**
1. Each Kanban task card has dropdown menus for priority and assignee
2. Drag-and-drop between columns calls `updateTaskStatus(taskId, newStatus)`
3. Modal edit form submits `updateTask(id, { title, description })`
4. All mutations re-render the Kanban board on success

---

### `deleteTask(id)` → `TaskAPI.delete(id)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | DELETE                                   |
| **URL**    | `/api/tasks/{id}`                        |
| **Used by**| `project.html`                           |
| **Purpose**| Delete a task from the project. |

**How it works:**
1. User opens task detail modal, clicks delete button
2. Confirmation dialog
3. On confirm: DELETE request sent
4. On success: task card removed from Kanban, counter updated

---

### `addComment(taskId, text)` → `TaskAPI.addComment(taskId, text)`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | POST                                     |
| **URL**    | `/api/tasks/{taskId}/comments`           |
| **Body**   | `{ text }`                               |
| **Used by**| `tasks.js` (not currently called from any HTML page) |
| **Purpose**| Add a text comment to a task. Available via service but not wired to any UI component. |

---

## 4. AI API Calls

### `sendMessage(message, projectId)` → `sendMessage()` in `ai.js`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | POST                                     |
| **URL**    | `/api/ai/chat`                           |
| **Body**   | `{ message, projectId? }`               |
| **Used by**| `project.html` (AIChat class)           |
| **Purpose**| Send a message or command to the AI assistant from the project page chat widget. |

**How it works:**
1. `project.html` instantiates `AIChat` class which wraps `ai.js`
2. User types message in the chat widget at the bottom of the project page
3. Message sent with current `projectId`
4. Response can be:
   - **Task created:** "Tarea creada exitosamente" with task details
   - **Task updated:** Status/priority/assignment changed
   - **Project created:** New project with name and ID
   - **Search results:** List of matching tasks
   - **AI response:** General conversational reply from DeepSeek
   - **Help:** Default help message listing available commands
5. Chat messages rendered in the `.ai-chat-messages` container

**Note:** `ai.js` `sendMessage()` does NOT use `credentials: 'include'` (potential bug — only `chatbot.js` version does).

---

### `sendToAIBackend(message)` in `chatbot.js`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | POST                                     |
| **URL**    | `/api/ai/chat`                           |
| **Body**   | `{ message, projectId }`                |
| **Used by**| `dashboard.html` (via `chatbot.js`)     |
| **Purpose**| Send a message to the AI assistant from the dashboard chat widget (floating chatbot). |

**How it works:**
1. `chatbot.js` manages the floating chatbot UI on the dashboard
2. User opens chatbot by clicking the chat icon (bottom-right corner)
3. Typing a message and pressing Enter/send calls `sendToAIBackend()`
4. **Unlike `ai.js`, this function includes `credentials: 'include'`**
5. Reads `projectId` from the `#ai-project-select` dropdown on the dashboard
6. Renders AI response in chatbot message list with "AI" avatar
7. Auto-scrolls to latest message

**Security note:** `chatbot.js` contains a hardcoded DeepSeek API key on line 2:
```js
const DEEPSEEK_API_KEY = "sk-1979a0e499854dab931fdeb14fd9b02e";
```
This key is defined but **not actually used** in any API call — calls go through `/api/ai/chat` internally. However, the key is exposed in client-side code.

The `DEEPSEEK_API_URL` constant (`https://api.deepseek.com/v1/chat/completions`) is also defined but never called — all real AI processing happens server-side via `aiService.js`.

---

### `loadChatHistory()` in `chatbot.js`

| Detail     | Value                                    |
|------------|------------------------------------------|
| **Method** | GET                                      |
| **URL**    | `/api/ai/history?projectId={id}`         |
| **Used by**| `dashboard.html` (via `chatbot.js`), also available in `project.html` |
| **Purpose**| Load previous chat messages from MongoDB to restore conversation context. |

**How it works:**
1. Called when chatbot opens on the dashboard
2. Sends GET request with optional `projectId` query param
3. If user has selected a project from the dropdown, history is project-scoped
4. If "General (todos)" is selected, `projectId` is empty (global chat history)
5. Returns up to 50 most recent messages, rendered in chat window
6. Uses `credentials: 'include'`

---

## 5. Page-Level API Usage Summary

### `landing.html`
| API Call    | Trigger            | Purpose                                   |
|-------------|--------------------|-------------------------------------------|
| `checkAuth()`| Page load          | If logged in → redirect to `/dashboard`   |

### `login.html`
| API Call     | Trigger            | Purpose                                  |
|--------------|--------------------|------------------------------------------|
| `checkAuth()` | Page load          | If logged in → redirect to `/dashboard`  |
| `login()`     | Form submit        | Authenticate user                        |

### `register.html`
| API Call      | Trigger            | Purpose                                  |
|---------------|--------------------|------------------------------------------|
| `checkAuth()`  | Page load          | If logged in → redirect to `/dashboard`  |
| `register()`   | Form submit        | Create new account                       |

### `dashboard.html`
| API Call                    | Trigger                | Purpose                                |
|-----------------------------|------------------------|----------------------------------------|
| `checkAuth()`               | Page load              | Auth check                             |
| `ProjectAPI.getAll()`       | `loadProjects()`       | Render project cards                   |
| `TaskAPI.getStats()`        | `loadStats()`          | Render stats counters                  |
| `TaskAPI.getMyTasks()`      | "Mis Tareas" click     | Render my tasks panel                  |
| `ProjectAPI.create(data)`   | New project form       | Create project from modal              |
| `ProjectAPI.update(id, data)`| Edit project form     | Edit project name/description          |
| `ProjectAPI.delete(id)`     | Delete button          | Delete project with confirmation       |
| `loadChatHistory()`         | Chatbot open           | Load AI conversation history           |
| `sendToAIBackend(message)`  | Chatbot send           | Send message to AI                     |
| `logout()`                  | Sidebar link           | End session                            |

### `project.html`
| API Call                       | Trigger                  | Purpose                           |
|--------------------------------|--------------------------|-----------------------------------|
| `checkAuth()`                  | Page load                | Auth check                        |
| `ProjectAPI.getAll()`          | Sidebar load             | Populate project sidebar          |
| `ProjectAPI.getById(id)`       | Page load                | Load Kanban board + tasks         |
| `TaskAPI.create(data)`         | New task form / quick add| Create task in Kanban             |
| `TaskAPI.update(id, data)`     | Drag-and-drop / dropdown | Change status/priority/assignee   |
| `TaskAPI.update(id, data)`     | Edit modal submit        | Update task title/description     |
| `TaskAPI.update(id, data)`     | Priority dropdown        | Change task priority              |
| `TaskAPI.update(id, data)`     | Assignee dropdown        | Reassign task                     |
| `TaskAPI.delete(id)`           | Delete in modal          | Remove task                       |
| `ProjectAPI.getTree(id)`       | "Tree View" load         | Render task hierarchy             |
| `TaskAPI.getByProject(id)`     | "AI Tree" generation     | Get tasks for AI structuring      |
| `sendMessage(message, id)`     | AI chat widget           | Chat with AI assistant            |

### `profile.html`
| API Call                  | Trigger            | Purpose                              |
|---------------------------|--------------------|--------------------------------------|
| `checkAuth()`             | Page load          | Auth check                           |
| `fetch PUT /users/{id}`   | Profile form submit| Update name/avatar (direct fetch)    |
| `logout()`                | Sidebar link       | End session                          |

---

## Authentication & Error Handling

### Session Flow
1. All services set `credentials: 'include'` on fetch requests
2. Browser automatically sends session cookie with each request
3. Server reads `req.session.userId` from the session

### Error Handling
All service wrappers (`api.js`, `projects.js`, `tasks.js`) follow this pattern:

```js
if (response.status === 401) {
    window.location.href = '/login';  // Redirect on unauthorized
    return;
}
const data = await response.json();
if (!response.ok) throw new Error(data.message);
```

### Exception: `ai.js`
The `sendMessage()` function in `ai.js` does **not** set `credentials: 'include'` and does **not** handle 401 redirects. This means:

- AI chat on the project page may fail silently if the session expires
- The `chatbot.js` version (used on dashboard) **does** include credentials correctly

### Exception: `profile.html` update
The profile update uses a raw `fetch()` call that sets `Content-Type: application/json` but does **not** set `credentials: 'include'`.