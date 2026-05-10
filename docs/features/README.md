# Features Documentation Index

This folder contains detailed documentation for each major feature of ScrumHub.

---

## Feature Files

| Feature | File | Status |
|---------|------|--------|
| **Workspace Explorer** | [PROJECT_EXPLORER.md](./PROJECT_EXPLORER.md) | Planned |
| **Project Templates** | [PROJECT_TEMPLATES.md](./PROJECT_TEMPLATES.md) | Planned |
| **Project Overview** | [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Planned |
| Multi-Backlog Orchestration | [MULTI_BACKLOG.md](./MULTI_BACKLOG.md) | Planned |
| Inter-Backlog Automation | [INTER_BACKLOG_AUTOMATION.md](./INTER_BACKLOG_AUTOMATION.md) | Planned |
| Simultaneous Sprints | [SIMULTANEOUS_SPRINTS.md](./SIMULTANEOUS_SPRINTS.md) | Planned |
| Mini-Sprints | [MINI_SPRINTS.md](./MINI_SPRINTS.md) | Planned |
| Report Hub | [REPORT_HUB.md](./REPORT_HUB.md) | Planned |
| Free Board (Visual Roadmap) | [FREE_BOARD.md](./FREE_BOARD.md) | Planned |

---

## Feature Overview

### Workspace Explorer (Project Explorer)
VS Code-inspired file explorer paradigm for project navigation. Replaces card-based dashboard with hierarchical folder tree. Features include: personal folder organization, pinned projects, search with filtering, view size options, context menus, and AI integration for natural language project creation.

### Project Templates
Pre-built starting points for new projects. Includes Sprint Planning, Research, Bug Tracker, and Continuous Improvement templates. Supports custom user templates and AI-assisted project creation from natural language descriptions.

### Project Overview
IDE-inspired workspace document landing view when opening a project. Features include: editable project header (icon, name, description), metadata pills (branch, sprints, AI cost in dollars), summary metrics grid, members section with editable roles, custom sections system, and add-new-section area with widget selector.

### Multi-Backlog Orchestration
Allows projects to contain multiple specialized backlogs (Development, QA/Testing, Strategic Planning) that can be switched between.

### Inter-Backlog Automation
AI-driven triggers that link backlogs together. When specific events occur in one backlog, the AI can automatically generate linked tasks in another backlog.

### Simultaneous Sprints
Multiple sprints can run in parallel within the same project, enabling different sub-teams to work on independent modules.

### Mini-Sprints
Short-duration (1-3 days) tactical sprints for hotfixes, quick research, or last-minute work. Designed for speed and focused execution outside normal sprint cadence.

### Report Hub
Unified reporting system with two types:
- **Sprint Reports**: Bound to sprint lifecycle (retrospectives, summaries)
- **Project Reports**: Persistent, influence backlog (QA Audits, Tech Debt Reviews, Product Feedback)

### Free Board (Visual Roadmap)
Visual canvas workspace for diagrams and schemes that are bidirectionally linked to backlog items. Elements update their appearance based on linked task states.

---

## Implementation Status Legend

| Status | Meaning |
|--------|---------|
| **Planned** | Not yet started |
| **In Progress** | Currently being developed |
| **Implemented** | Completed and deployed |
| **Deprecated** | No longer maintained |

---

## Reading Order Recommendation

For understanding the feature evolution:

1. **Start with TRUTH.md** to understand current architecture
2. **Read FEATURES.md** for high-level overview
3. **Read feature files** in the order above (each builds on concepts from previous)

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [TRUTH.md](../TRUTH.md) | Source of truth for all technical decisions |
| [ERD.md](../ERD.md) | Entity relationships and database schema |
| [ENDPOINTS.md](../ENDPOINTS.md) | API specification |
| [AGENTS.md](../AGENTS.md) | AI assistant coding guide |