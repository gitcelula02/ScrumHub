# Mini-Sprints

**Status:** Planned

---

## Overview

Short-duration (1-3 days) tactical sprint bursts for urgent work outside normal sprint rhythm. Used for hotfixes, quick research, last-minute polish, or time-sensitive tasks.

**Key Distinction from Regular Sprints:**

| Aspect | Regular Sprint | Mini-Sprint |
|--------|----------------|-------------|
| Duration | 1-4 weeks | 1-3 days |
| Purpose | Planned development | Tactical, time-sensitive |
| Planning | Full ceremony | Lightweight, async |
| Scope | Feature development | Hotfixes, research, polish, QA |

**Use Cases:**
1. **Hotfix**: Critical bug needs fixing within 24-48h
2. **PO Research**: Validate user feedback within 2 days
3. **Polish**: Final UI/UX before demo/release
4. **QA Regression**: Quick testing cycle
5. **Spike**: Time-boxed technical research

**Entity Definition:** See [domain/ERD.md](/docs/domain/ERD.md) — MiniSprint, MiniSprintTask entities.

**API Endpoints:** See [api/ENDPOINTS.md](/docs/api/ENDPOINTS.md) — Mini-Sprints section.

---

## Frontend Views

### Mini-Sprint Banner (Dashboard)

**Display:**
```
┌────────────────────────────────────────────────────────────────┐
│ ⚡ MINI-SPRINTS                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🔥 [CRITICAL] PO User Feedback Research     24h remaining  │ │
│ │    Research · Ends May 16                                 │ │
│ │    [Open]                                                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│ + Create Mini-Sprint                                          │
└────────────────────────────────────────────────────────────────┘
```

### Mini-Sprint Board

**Route:** `/app/projects/:projectId/mini-sprints/:miniSprintId/board`

- Compact Kanban (To Do, In Progress, Done)
- Larger task cards for quick scanning
- Prominent countdown timer
- Quick add task input always visible

### Mini-Sprint List

**Route:** `/app/projects/:projectId/mini-sprints`

- **MiniSprintCard:** Name, type badge, duration, status
- **FilterTabs:** All, Active, Completed, Cancelled
- **QuickCreateButton**

---

## Routes

| View | Route |
|------|-------|
| Mini-Sprint List | `/app/projects/:projectId/mini-sprints` |
| Mini-Sprint Board | `/app/projects/:projectId/mini-sprints/:miniSprintId/board` |

---

## Notes

- Distinct visual styling (amber/orange tones)
- Duration strictly enforced (max 72 hours / 3 days)
- Auto-complete triggers notifications
- Quick Capture mode for keyboard-first workflow
- Type icons: 🔥 (hotfix), 📊 (research), ✨ (polish), 🧪 (QA), 💡 (spike)