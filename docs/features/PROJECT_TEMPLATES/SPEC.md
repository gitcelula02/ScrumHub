# Project Templates

**Status:** Planned

---

## Overview

Pre-configured starting points for new projects. Templates include predefined backlogs, statuses, sample tasks, and configurations to accelerate setup.

**Key Features:**
- Pre-built templates for common project types
- AI-assisted project creation from natural language
- Templates include backlog structure
- Custom templates can be saved by users

**Entity Definition:** See [domain/ERD.md](/docs/domain/ERD.md) — ProjectTemplate entity.

**API Endpoints:** See [api/ENDPOINTS.md](/docs/api/ENDPOINTS.md) — Project Templates section.

---

## Frontend Views

### Template Selection Modal

**Trigger:** Create Project button in Explorer

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [🏃 Sprint Planning] [🔬 Research] [🐛 Bug Tracker]       │
│ [⚙️ Continuous]        [⭐ Custom]                         │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│ │ 🏃              │ │ 🔬              │ │ 🐛              ││
│ │ Sprint Planning │ │ Research Hub    │ │ Bug Tracker    ││
│ │ [Use Template]  │ │ [Use Template]  │ │ [Use Template]  ││
│ └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Template Cards

**Compact View:**
- Icon (large, centered)
- Name (bold)
- One-line description
- "Use Template" button

**Detailed View:**
- Full description
- Included features
- Sample tasks preview

### AI Creation Input

**Location:** Search bar in Explorer OR template modal

**Flow:**
1. User types natural language request
2. AI extracts: name, goal, suggested features
3. Preview shows editable fields
4. User confirms → Project created

---

## Routes

| View | Route |
|------|-------|
| Project Creation | `/app/projects/create` |

---

## Notes

- System templates cannot be deleted, only disabled
- Custom templates inherit user's folder structure
- AI creation uses project-specific RAG context
- Templates include pre-configured statuses
- Template usage count tracks popularity