# Dockerization Plan - ScrumHub

## Project Overview

| Service | Technology | Port | Type |
|---------|------------|------|------|
| Backend | Express.js + Node.js | 3000 | CommonJS |
| Frontend | React + Vite + TanStack Start | 8080 | SSR/SSG React App |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Docker Network                      │
├─────────────────────┬───────────────────────────────────┤
│   Backend (Node)    │       Frontend (Node + Vite)       │
│   Port: 3000        │       Port: 8080                   │
│                     │                                   │
│  - Express API      │  - TanStack Start SSR             │
│  - Supabase client  │  - React SPA                       │
│  - MongoDB client   │  - Vite dev server                 │
│  - Static HTML      │                                   │
└─────────────────────┴───────────────────────────────────┘
```

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- `.env` file with all required environment variables (copy from `.env.example`)

## File Structure

```
ScrumHub/
├── backend/
│   └── Dockerfile                    # Backend Node.js container
├── frontend/
│   └── Dockerfile                    # Frontend Node.js + Vite container
├── docker-compose.yml                # Orchestration file
├── docker-compose.dev.yml            # Development with hot-reload
├── .dockerignore                     # Shared Docker ignores
├── backend/.dockerignore             # Backend-specific ignores
└── frontend/.dockerignore            # Frontend-specific ignores
```

## Services Configuration

### Backend Service

| Setting | Value |
|---------|-------|
| Image | node:20-alpine |
| Working Dir | /app |
| Port | 3000:3000 |
| Environment | From .env |
| Dependencies | npm ci (locked versions) |
| Health Check | GET /api/health |

**Dockerfile.features:**
- Multi-stage build for security
- Non-root user for production
- Locked dependency versions (package-lock.json)

### Frontend Service

| Setting | Value |
|---------|-------|
| Base Image | node:20-alpine |
| Build Stage | npm ci + npm run build |
| Port | 8080:8080 |
| API Endpoint | http://backend:3000/api |

**Dockerfile.features:**
- Multi-stage build (build → runtime)
- Serves static production build
- Could use nginx for production serving

## Docker Compose Configuration

### Development Mode (`docker-compose.dev.yml`)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev
    ports:
      - "8080:8080"
    depends_on:
      - backend
```

### Production Mode (`docker-compose.yml`)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "8080:8080"
    environment:
      - VITE_API_URL=http://localhost:3000/api
    depends_on:
      - backend
```

## Security Considerations

### Why Docker Helps with npm Security

1. **Isolation**: Containerized npm install cannot access host filesystem maliciously
2. **Reproducibility**: Locked versions in package-lock.json ensure consistent installs
3. **No global contamination**: Malware cannot reach host node_modules or global packages
4. **Non-root execution**: Containers run with limited privileges
5. **Read-only filesystem option**: Can mount code as read-only in production

### Best Practices Implemented

- ✅ Uses `npm ci` instead of `npm install` (reproducible builds)
- ✅ Multi-stage builds reduce image size and attack surface
- ✅ Non-root user in final image
- ✅ .dockerignore prevents credential leakage
- ✅ Health checks for container monitoring

## Environment Variables Required

Create a `.env` file based on `.env.example`:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# MongoDB Configuration
MONGODB_URI=mongodb+srv://...

# Session secret
SESSION_SECRET=your_session_secret_here

# Server port
PORT=3000

# Frontend API URL
VITE_API_URL=http://localhost:3000/api
```

## Usage Commands

### Development

```bash
# Start with hot-reload
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml down
```

### Production

```bash
# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Verify Containers

```bash
# Check running containers
docker ps

# Check backend health
curl http://localhost:3000

# Check frontend
curl http://localhost:8080
```

## Troubleshooting

### Container Won't Start

1. Check logs: `docker-compose logs <service>`
2. Verify .env file exists with required variables
3. Check port conflicts: `netstat -an | grep 3000`

### Database Connection Issues

1. Ensure Supabase URL and keys are correct
2. Check MongoDB URI is accessible
3. Verify network connectivity between containers

### Frontend Build Fails

1. Check Node version compatibility
2. Clear node_modules and retry: `docker-compose build --no-cache`

## Future Improvements

- [ ] Add nginx reverse proxy for single domain access
- [ ] Implement proper health check endpoints
- [ ] Add Let's Encrypt for HTTPS
- [ ] Use Docker secrets for sensitive data
- [ ] Implement proper logging with ELK stack
- [ ] Add monitoring with Prometheus/Grafana