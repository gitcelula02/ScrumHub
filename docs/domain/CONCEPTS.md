# ScrumHub Concepts
This document defines key concepts and terminology used in ScrumHub. For technical implementation details, see **[TRUTH.md](../core/TRUTH.md)**.

---

## SCRUM Framework Concepts

**SCRUM**: A framework for developing, delivering, and sustaining complex products.
Consists of key roles: **Product Owner**, **Scrum Master**, **Developers** and **QA**.

### Roles

**Product Owner**: Maximizes product value. Knows *what* the product must do, not *how*.

**Scrum Master**: Promotes and supports Scrum. Bridge between Product Owner and Developers. AI-augmented for facilitation.

**Developers**: Develop the product. Create and modify code, select architecture and technologies. May specialize in Frontend, Backend, AI, or Feature development.

**QA (Quality Assurance)**: Tests the product and ensures it fulfills user requirements. (Note: QA and Tester roles are merged in ScrumHub)

**DevOps**: CI/CD pipeline, deployment status, GitHub integration focus.

**Tech Lead**: Overview dashboards, architecture views, code review tools.

### Work Items

**Epics**: Large bodies of work containing multiple features. Can be broken down into user stories.

**User Stories**: Small bodies of work that translate to features or tasks. Main building blocks of the backlog.

**Acceptance Criteria**: Conditions a product must satisfy to be accepted. In natural language, no technical details.

**Sprint**: Time-boxed period (typically 1-4 weeks) for completing a set amount of work.

**Mini-Sprint**: Short-duration (1-3 days) tactical sprint for hotfixes, research, or last-minute polish.

**Sprint Retrospective**: Team reflection at sprint end. What went well, what could improve, action items.

---

## ScrumHub-Specific Concepts

### Backlog Model

**Backlog**: Container for organizing work items. In ScrumHub, a project can have **multiple backlogs**:
- **Development Backlog**: Feature development tasks
- **QA/Testing Backlog**: Testing and quality tasks
- **Strategic Planning Backlog**: Long-term planning items
- **Custom Backlogs**: User-defined specialized backlogs

Each backlog maintains its own workflow zones (Dev Zone, QA Zone, PO Zone).

### Multi-Backlog Orchestration

Managing multiple backlogs within a single project. Allows different sub-teams to work within their own context while maintaining project-wide visibility.

### Inter-Backlog Automation

AI-driven triggers linking backlogs. When specific events occur in one backlog (e.g., task moves to "Testing"), AI automatically creates linked tasks in another backlog (e.g., QA Backlog).

### Simultaneous Sprints

Multiple independent sprints running in parallel within the same project. Different sub-teams work on separate modules without interference.

### Report Hub

Unified reporting system with two report types:

**Sprint Reports**: Created during a sprint, conclude when the sprint ends:
- Sprint Retrospective: Process-focused reflection
- Sprint Summary: Product-focused metrics

**Project Reports**: Persistent across the project lifecycle:
- QA Audits: Testing coverage, defect density
- Tech Debt Reviews: Code quality, debt items
- Product Feedback: User feedback aggregation

Project Reports can directly influence the Product Backlog by spawning tasks.

### Free Board (Visual Roadmap)

Visual canvas for diagrams and schemes. Bidirectionally linked to backlog items — elements change appearance when linked items change state (e.g., turns green when User Story is marked "Done").

### Workspace

Shared space where users generate and review code based on project context. All changes to a working branch are shared among users (cloud-based shared computer metaphor).

### AI as Virtual Team Member

AI acts as proactive Backlog Refiner:
- Monitors work across backlogs
- Event-driven: triggered by user conversations, task changes, GitHub updates
- Manages inter-backlog automation triggers
- Can generate reports and suggest backlog improvements

### Chat

Shared space for communication with users and AI. Acts as terminal for AI instructions. Supports voice/video calls with AI transcription. Creates tasks or reports from conversations.

### Folders, Categories, Tags

**Folders**: Containers for organizing projects, backlogs, and boards. User-curated.

**Categories**: Group related items for AI context and organization.

**Tags**: Granular labels for item relationships within folders.

### Teams

Groups of users assigned to projects, boards, and chats.

### Roles & Permissions

**Roles**: Define user permissions within a project. Similar to Discord roles.

**Permissions**: Define what users and AI can do within a project.

---

## Relationships

| Concept | Relationship |
|---------|--------------|
| Project | Contains: backlogs, boards, sprints, chat, workspace |
| Backlog | Contains: tasks, has a type (development, qa, strategic) |
| Sprint | Groups: tasks, has duration, status (planning/active/completed) |
| Task | Belongs to: project, sprint (optional), backlog, status |
| Board | Represents: status columns, displays tasks by status |

---

## Document Hierarchy

| Document | Purpose |
| :--- | :--- |
| **[AGENTS.md](../AGENTS.md)** | Entry point. Task-based routing for AI agents. |
| **[core/TRUTH.md](../core/TRUTH.md)** | Source of truth. Non-negotiables and core rules. |
| **[domain/ERD.md](./ERD.md)** | Entity relationships and database schema. |
| **[domain/CONCEPTS.md](./CONCEPTS.md)** | Terminology and Scrum methodology. |
| **[api/ENDPOINTS.md](../api/ENDPOINTS.md)** | API Route Status & Dashboard. |
| **[api/SCHEMAS.md](../api/SCHEMAS.md)** | Technical JSON contracts and payloads. |
| **[features/](../features/)** | Detailed implementation specs and status per feature. |
| **[core/ARCHITECTURE.md](../core/ARCHITECTURE.md)** | Folder structure, TS norms, component patterns. |
| **[core/STYLING.md](../core/STYLING.md)** | Tailwind rules and layout conventions. |
| **[core/UX.md](../core/UX.md)** | Navigation flows and user interactions. |
| **[BACKEND_SUPPORT.md](../BACKEND_SUPPORT.md)** | Living log of required backend changes. |