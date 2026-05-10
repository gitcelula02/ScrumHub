# Report Hub

**Status: Planned**

---

## Overview

The Report Hub consolidates all reporting capabilities into a unified system with two distinct report types:

1. **Sprint Reports**: Created during a sprint, conclude when the sprint ends. These are ephemeral in their active form but persist in history.
2. **Project Reports**: Persistent reports that exist independent of any sprint cycle and continuously accumulate insights across the project lifetime.

**Key Principle**: Project Reports can be created at any time and influence the Product Backlog directly. Sprint Reports are bounded by sprint lifecycle.

---

## Schema & API Reference

**Entity Definition:** See [ERD.md](/docs/ERD.md) — Report entity and all report-type extensions (QAAudit, TechDebtReview, ProductFeedback, SprintRetrospective, SprintSummary).

**API Endpoints:** See [ENDPOINTS.md](/docs/ENDPOINTS.md) — Reports section (`#reports-report-hub`) for full endpoint documentation with `is_implemented` flags.

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