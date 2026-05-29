# ScrumHub - AI-Powered Project Management

A Jira-like project management system with an integrated AI assistant that understands natural language, automates task creation and assignment, manages priorities, and sends email alerts.

**Note:** This is a monorepo containing a Node.js/Express backend API and a React SPA frontend.

---

## Features

- 🔐 **Authentication** (login/register)
- 📋 **Jira-style boards** with customizable Kanban columns
- 🤖 **AI assistant** powered by DeepSeek that understands natural language
- 📧 **Email alerts** based on due dates and priorities
- 👥 **Team management** with roles and permissions
- 📊 **Dashboard** with real-time statistics
- 📱 **Responsive design**

---

## Architecture

```
ScrumHub/
├── backend/                    # Express.js API server
│   ├── config/                 # Database configuration (MongoDB)
│   ├── controllers/            # Request handlers (business logic)
│   ├── database/               # Database connection + seed data
│   ├── middleware/             # Auth middleware
│   ├── models/                  # Data models
│   ├── routes/                  # API route definitions
│   ├── services/                # AI and notification services
│   └── server.js                # Entry point
├── frontend/                   # React SPA (Vite + TanStack)
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── client.tsx           # Client entry point
│   │   ├── components/          # Shared UI atoms + layout
│   │   ├── features/            # Feature modules (backlog, board, etc.)
│   │   ├── hooks/               # Global hooks
│   │   ├── lib/                 # Query client setup
│   │   ├── pages/               # Route-level orchestrators
│   │   ├── routes/              # TanStack Router config
│   │   ├── services/            # API service layer
│   │   ├── store/               # Auth context, theme registry
│   │   ├── styles/              # Global CSS + Tailwind
│   │   ├── types/               # Global TypeScript types
│   │   └── utils/               # Pure utility functions
│   └── vite.config.ts
├── .env.example                 # Environment variables template
└── package.json                 # Root scripts (backend only)
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express.js (JavaScript) |
| **Frontend** | React 19, TypeScript, Vite, TanStack Router & Query |
| **UI Components** | shadcn/ui (Radix primitives), Tailwind CSS v4 |
| **Primary DB** | MongoDB (Mongoose ODM) |
| **Auth & Storage** | Supabase (Auth + BLOB storage) |
| **AI** | DeepSeek API (via backend proxy) |
| **Email** | Nodemailer |
| **Auth (session)** | express-session + bcrypt |

---

## Setup

### 1. Clone and install root dependencies

```bash
cd ScrumHub
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MongoDB
MONGODB_URI=mongodb+srv://...

# DeepSeek AI
DEEPSEEK_API_KEY=sk-...

# Email (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=app_password

# Session
SESSION_SECRET=your_secret_here

# Ports
PORT=3000          # Backend API
```

### 3. Start the backend

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Backend runs on **http://localhost:3000**
- For Docker: set `VITE_API_URL_DOCKER=http://backend:3000/api` in your `.env`

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:8080**

### 5. Open in browser

- Landing: http://localhost:8080/
- Login: http://localhost:8080/login
- Dashboard: http://localhost:8080/app/projects

---

## Test Credentials

- **Email:** admin@proyecto.com
- **Password:** admin123

---

## API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |

### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/all` | List all projects |
| GET | `/api/projects/:id` | Project details |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/my-tasks` | Current user's tasks |
| GET | `/api/tasks/project/:projectId` | Project tasks |
| GET | `/api/tasks/:id` | Task details |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |

### AI
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/chat` | Chat with AI assistant |

---

## AI Assistant Commands

The AI chat accepts natural language commands:

### Create tasks
- `crear tarea [title]`
- `nueva tarea [title]`
- `crear task [title]`

### Assign tasks
- `asignar a [name] #123` — assigns task #123 to a team member

### Change priority
- `cambiar prioridad alta #123`
- `prioridad baja #123`

### Set due date
- `fecha 25/12/2024 #123`
- `vencimiento 31/12/2024`

### Create projects
- `crear proyecto [name]`

### Search tasks
- `buscar [term]`

---

## Development Notes

- Email alerts are checked and sent every 60 minutes automatically
- AI processes commands in Spanish natively
- The frontend communicates with the backend via REST API on port 3000
- CORS is configured to allow the frontend dev server on port 8080

---
## Future
A specialized Task manager directly connected to the GitHub and documentation managment of a project. 
Using a documentation system and architecture for AI Agents and highly technical developers, the system should server and appear as part of the different documentation on a project that complement each other:
