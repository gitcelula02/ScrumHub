# ScrumHub Documentation

Complete documentation index for the ScrumHub project.

---

## Start Here

| Document | Purpose |
|----------|---------|
| **[TRUTH.md](./TRUTH.md)** | **Source of Truth** — Architecture, entities, UI/UX, features. Always read this first. |
| **[AGENTS.md](./AGENTS.md)** | AI Assistant coding guide. Stack, conventions, component patterns. |
| **[BRAND_CONTEXT.md](./BRAND_CONTEXT.md)** | Visual design language. Typography, colors, layout principles. |

---

## Technical Documentation

| Document | Purpose |
|----------|---------|
| **[ERD.md](./ERD.md)** | Entity-Relationship Diagram. Data structures, JSON examples. |
| **[ENDPOINTS.md](./ENDPOINTS.md)** | API endpoints specification. All REST endpoints, WebSocket events. |
| **[CONCEPTS.md](./CONCEPTS.md)** | SCRUM methodology concepts and terminology. |

---

## UX & Features

| Document | Purpose |
|----------|---------|
| **[UX.md](./UX.md)** | User experience specifications. Interaction patterns. |
| **[FEATURES.md](./FEATURES.md)** | Complete feature descriptions and overview. |

---

## Quick Reference

### Documentation Hierarchy
```
TRUTH.md (start here)
    ↓
AGENTS.md (coding conventions)
    ↓
ERD.md (data) ←→ ENDPOINTS.md (API)
    ↓
FEATURES.md (what we build)
    ↓
UX.md / BRAND_CONTEXT.md (how it looks)
```

### When Working On...

| Task | Read First |
|------|------------|
| Any code | TRUTH.md + AGENTS.md |
| UI Components | BRAND_CONTEXT.md + AGENTS.md |
| Backend/Data | TRUTH.md + ERD.md |
| API Integration | TRUTH.md + ENDPOINTS.md |
| UX Design | UX.md + BRAND_CONTEXT.md |

---

## Key Principles

1. **TRUTH.md is the source of truth** — If docs conflict, TRUTH.md wins
2. **AGENTS.md defines coding conventions** — Follow these patterns strictly
3. **ERD.md and ENDPOINTS.md must stay in sync** — Update both when changing data
4. **BRAND_CONTEXT.md is design reference** — UI must match visual language

---

## Stack Overview

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Router & Query |
| Backend | Express (TypeScript), PostgreSQL, Supabase |
| AI | DeepSeek API |
| Storage | RAG with vectorized databases for AI context |