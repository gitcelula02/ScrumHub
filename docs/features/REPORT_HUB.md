# Report Hub

**Status: Planned**

---

## Overview

The Report Hub consolidates all reporting capabilities into a unified system with two distinct report types:

1. **Sprint Reports**: Created during a sprint, conclude when the sprint ends. These are ephemeral in their active form but persist in history.
2. **Project Reports**: Persistent reports that exist independent of any sprint cycle and continuously accumulate insights across the project lifetime.

**Key Principle**: Project Reports can be created at any time and influence the Product Backlog directly. Sprint Reports are bounded by sprint lifecycle.

---

## Backend Entities

### Report Entity (Base)

```typescript
Report {
  id: UUID
  project_id: UUID (FK)
  sprint_id: UUID (FK, nullable)
  title: string
  description: string (markdown)
  type: "sprint_retrospective" | "sprint_summary" | "qa_audit" | "tech_debt_review" | "product_feedback" | "velocity_report" | "custom"
  status: "draft" | "published" | "archived"
  created_by: UUID (FK to users)
  created_at: timestamp
  updated_at: timestamp
  published_at: timestamp (nullable)
}
```

### Sprint Report Extensions

```typescript
SprintRetrospective {
  report_id: UUID (FK)
  sprint_id: UUID (FK)
  sections: {
    what_went_well: string (markdown)
    what_could_improve: string (markdown)
    action_items: string (markdown)
    team_acknowledgments: string (markdown)
  }
  ai_insights: string (markdown, AI-generated)
  participants: UUID[] (FK to users)
}

SprintSummary {
  report_id: UUID (FK)
  sprint_id: UUID (FK)
  metrics: {
    planned_tasks: number
    completed_tasks: number
    completion_rate: number
    average_task_completion_time: number (hours)
    blocked_hours: number
    velocity: number (story points)
  }
  burndown_data: JSON (date -> remaining tasks)
  ai_narrative: string (markdown, AI-written summary)
}
```

### Project Report Extensions

```typescript
QAAudit {
  report_id: UUID (FK)
  scope: "project" | "backlog" | "sprint"
  scope_id: UUID (nullable)
  metrics: {
    total_test_cases: number
    passed: number
    failed: number
    blocked: number
    pass_rate: number
    test_coverage_percentage: number
  }
  findings: Array<{
    severity: "critical" | "high" | "medium" | "low"
    category: string
    description: string
    affected_tasks: UUID[]
    recommendation: string
  }>
  ai_recommendations: string (markdown)
}

TechDebtReview {
  report_id: UUID (FK)
  scope: "project" | "backlog"
  scope_id: UUID (nullable)
  debt_items: Array<{
    id: string
    task_id: UUID (FK, nullable)
    category: "code" | "test" | "documentation" | "architecture"
    title: string
    description: string
    estimated_hours: number
    severity: "critical" | "high" | "medium" | "low"
    status: "acknowledged" | "in_progress" | "resolved"
  }>
  metrics: {
    total_debt_items: number
    critical_count: number
    estimated_total_hours: number
    debt_ratio: number (debt items vs total tasks)
  }
  ai_insights: string (markdown)
}

ProductFeedback {
  report_id: UUID (FK)
  feedback_sources: string[] ("github_issues", "user_feedback", "chat_transcriptions", "surveys")
  sentiment_analysis: {
    positive: number (percentage)
    neutral: number (percentage)
    negative: number (percentage)
  }
  themes: Array<{
    theme: string
    frequency: number
    representative_quotes: string[]
  }>
  backlog_impact: Array<{
    suggested_epic_title: string
    priority: "low" | "medium" | "high" | "urgent"
    related_theme: string
  }>
}
```

### Report-Task Relationship

```typescript
ReportBacklogItem {
  id: UUID
  report_id: UUID (FK)
  task_id: UUID (FK, nullable - null if not yet created)
  suggested_title: string
  suggested_type: "epic" | "story" | "task"
  suggested_description: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "suggested" | "approved" | "rejected" | "created"
  created_by: UUID (FK to users)
  created_at: timestamp
  converted_at: timestamp (nullable - when task was created)
}
```

---

## API Endpoints

### Reports CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/reports` | List all reports (filterable by type, sprint_id, date range) |
| POST | `/projects/:projectId/reports` | Create a new report |
| GET | `/reports/:reportId` | Get report details with content |
| PATCH | `/reports/:reportId` | Update report |
| DELETE | `/reports/:reportId` | Delete report (soft delete) |
| POST | `/reports/:reportId/publish` | Publish draft report |
| POST | `/reports/:reportId/convert-to-task` | Convert suggestion to actual task |

### Report Type Specific

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects/:projectId/reports/qa-audit` | Generate QA Audit report |
| POST | `/projects/:projectId/reports/tech-debt` | Generate Tech Debt review |
| POST | `/projects/:projectId/reports/product-feedback` | Generate Product Feedback report |
| POST | `/sprints/:sprintId/reports/retrospective` | Create sprint retrospective |
| POST | `/sprints/:sprintId/reports/summary` | Generate sprint summary |
| GET | `/sprints/:sprintId/reports` | Get all reports for sprint |

### Report Backlog Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/:reportId/items` | Get suggested backlog items from report |
| POST | `/reports/:reportId/items` | Add manual suggestion |
| PATCH | `/reports/:reportId/items/:itemId` | Update suggestion |
| POST | `/reports/:reportId/items/:itemId/approve` | Approve and create task |

### Request/Response Examples

**Create Project Report (QA Audit):**
```json
POST /projects/123/reports/qa-audit
{
  "scope": "project",
  "title": "Q2 2026 QA Audit"
}
```

**Response:**
```json
{
  "id": "uuid",
  "project_id": "123",
  "type": "qa_audit",
  "title": "Q2 2026 QA Audit",
  "status": "published",
  "created_by": "user-uuid",
  "created_at": "2026-05-09T12:00:00Z",
  "qa_audit": {
    "metrics": {
      "total_test_cases": 150,
      "passed": 120,
      "failed": 15,
      "blocked": 5,
      "pass_rate": 80,
      "test_coverage_percentage": 65
    },
    "findings": [
      {
        "severity": "high",
        "category": "Authentication",
        "description": "Multiple login edge cases not covered",
        "affected_tasks": ["task-uuid-1"],
        "recommendation": "Add test cases for SSO scenarios"
      }
    ],
    "ai_recommendations": "Consider prioritizing test automation for the authentication module..."
  }
}
```

**Convert suggestion to task:**
```json
POST /reports/:reportId/items/:itemId/approve
{
  "create_as": "story",
  "assign_to_backlog": "backlog-uuid"
}

Response:
{
  "item_id": "uuid",
  "status": "created",
  "converted_at": "2026-05-09T14:00:00Z",
  "task": {
    "id": "new-task-uuid",
    "title": "Add test cases for SSO scenarios",
    "type": "story"
  }
}
```

---

## Frontend Views

### Report Hub Main View

**Route:** `/app/projects/:projectId/reports`

**Components:**
- **ReportTypeTabs**: All | Sprint Reports | QA Audits | Tech Debt | Product Feedback
- **ReportCard**: Title, type badge, date, status, key metric preview
- **CreateReportButton**: Opens report type selector
- **QuickFilters**: Date range, creator, status

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Report Hub                                    [+ Create Report] │
├─────────────────────────────────────────────────────────────────┤
│ [All] [Sprint] [QA Audit] [Tech Debt] [Product Feedback]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 📊 Q2 2026 QA Audit                          Published    │  │
│ │    Created May 9, 2026 · 65% test coverage               │  │
│ │    [View Report] [Create Tasks]                            │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 🔄 Sprint 12 Retrospective                   Published    │  │
│ │    Sprint 12 · May 1-14, 2026                              │  │
│ │    [View Report]                                           │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Report Detail View

**Route:** `/app/projects/:projectId/reports/:reportId`

**Layout:** Full-page report with sidebar navigation

**Sections:**
- **ReportHeader**: Title, type badge, dates, publish status
- **ReportContent**: Type-specific display
- **ReportSidebar**:
  - Report metadata (creator, last edited)
  - Suggested backlog items count
  - Actions (Edit, Publish, Delete, Export)

### Report Type Views

**Sprint Retrospective:**
- Sections: What went well, What could improve, Action items, Team acknowledgments
- AI Insights panel (collapsible)
- Participant list
- Link to Sprint Summary

**Sprint Summary:**
- Key metrics dashboard (completion rate, velocity, blocked hours)
- Burndown chart
- AI-written narrative

**QA Audit:**
- Metrics cards (pass rate, coverage, total tests)
- Findings table with severity indicators
- Affected tasks list
- AI Recommendations panel

**Tech Debt Review:**
- Debt summary cards
- Debt items table with category and severity
- Estimated hours per category
- AI-generated prioritization

**Product Feedback:**
- Sentiment gauge visualization
- Theme cloud/list
- Suggested backlog items with one-click conversion

### Create Report Modal

**Steps:**
1. **Select Type**: Choose report type from visual cards
2. **Configure Scope**: Select project/backlog/sprint
3. **Review & Create**: Show AI what data will be analyzed
4. **Generate**: AI processes and creates draft
5. **Edit & Publish**: User reviews, edits, and publishes

**For Sprint Reports:**
- Automatically scoped to current/selected sprint
- One-click creation with AI population

---

## Architecture Changes

### Database Migration

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

CREATE TABLE sprint_retrospectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  sections JSONB NOT NULL DEFAULT '{"what_went_well":"","what_could_improve":"","action_items":"","team_acknowledgments":""}',
  ai_insights TEXT,
  participants UUID[]
);

CREATE TABLE sprint_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  metrics JSONB NOT NULL,
  burndown_data JSONB,
  ai_narrative TEXT
);

CREATE TABLE qa_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  scope VARCHAR(50) NOT NULL,
  scope_id UUID,
  metrics JSONB NOT NULL,
  findings JSONB NOT NULL DEFAULT '[]',
  ai_recommendations TEXT
);

CREATE TABLE tech_debt_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  scope VARCHAR(50) NOT NULL,
  scope_id UUID,
  debt_items JSONB NOT NULL DEFAULT '[]',
  metrics JSONB NOT NULL,
  ai_insights TEXT
);

CREATE TABLE product_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  feedback_sources VARCHAR(50)[] NOT NULL,
  sentiment_analysis JSONB NOT NULL,
  themes JSONB NOT NULL DEFAULT '[]',
  backlog_impact JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE report_backlog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  suggested_title VARCHAR(255) NOT NULL,
  suggested_type VARCHAR(50) NOT NULL,
  suggested_description TEXT,
  priority VARCHAR(50) NOT NULL DEFAULT 'medium',
  status VARCHAR(50) NOT NULL DEFAULT 'suggested',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  converted_at TIMESTAMP
);

CREATE INDEX idx_reports_project ON reports(project_id);
CREATE INDEX idx_reports_sprint ON reports(sprint_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_report_items_report ON report_backlog_items(report_id);
```

### Backend Changes

1. **ReportService**: CRUD for all report types
2. **ReportGeneratorService**: AI-powered report generation
3. **BacklogItemService**: Manage report → task conversions
4. **AIAgent**: Enhanced to support report generation with RAG context

### Frontend Changes

1. **reportsFeature**: Enhanced module
   - `features/reports/` components
   - Report type-specific views
   - Create report wizard

2. **New Hooks:**
   - `useReports(projectId, filters)`
   - `useReportDetail(reportId)`
   - `useReportBacklogItems(reportId)`

3. **New Components:**
   - ReportHub (main view)
   - ReportCard
   - ReportDetailView
   - Type-specific report views (RetrospectiveView, QAAuditView, etc.)
   - CreateReportWizard
   - BacklogItemConverter

---

## Implementation Checklist

- [ ] Database migration for all report tables
- [ ] Backend: ReportService CRUD
- [ ] Backend: ReportGeneratorService (AI generation)
- [ ] Backend: BacklogItemService
- [ ] Backend: AI agent report generation
- [ ] Frontend: reports feature module
- [ ] Frontend: ReportHub main view
- [ ] Frontend: ReportCard component
- [ ] Frontend: Report detail views (all types)
- [ ] Frontend: CreateReportWizard
- [ ] Frontend: BacklogItemConverter
- [ ] E2E tests for report creation and conversion
- [ ] Documentation update (ERD.md, ENDPOINTS.md, TRUTH.md)

---

## Notes

- Sprint Reports should show warning when sprint is near completion
- Project Reports can be regenerated with updated data
- AI-generated reports should be marked as "AI-assisted" in UI
- Export to PDF/Markdown should be supported for all reports
- Report permissions should respect SCRUM roles (e.g., only QA can create QA Audits)