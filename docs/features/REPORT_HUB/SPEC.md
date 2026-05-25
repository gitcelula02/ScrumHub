# Report Hub

**Status:** Planned

---

## Overview

Unified reporting system with two report types:

1. **Sprint Reports**: Created during a sprint, conclude when sprint ends. Ephemeral active form, persist in history.
2. **Project Reports**: Persistent, independent of sprint cycle. Can influence Product Backlog directly.

**Entity Definition:** See [domain/ERD.md](/docs/domain/ERD.md) — Report entity and extensions (QAAudit, TechDebtReview, ProductFeedback, SprintRetrospective, SprintSummary).

**API Endpoints:** See [api/ENDPOINTS.md](/docs/api/ENDPOINTS.md) — Reports section.

---

## Frontend Views

### Report Hub Main View

**Route:** `/app/projects/:projectId/reports`

**Components:**
- **ReportTypeTabs**: All | Sprint Reports | QA Audits | Tech Debt | Product Feedback
- **ReportCard**: Title, type badge, date, status, key metric
- **CreateReportButton**
- **QuickFilters**: Date range, creator, status

### Report Detail View

**Route:** `/app/projects/:projectId/reports/:reportId`

**Layout:** Full-page report with sidebar navigation

**Sections:**
- **ReportHeader**: Title, type badge, dates, publish status
- **ReportContent**: Type-specific display
- **ReportSidebar**: Metadata, suggested items count, actions

### Report Type Views

| Type | Display |
|------|---------|
| Sprint Retrospective | Sections (what went well/improve/action items), AI insights |
| Sprint Summary | Metrics dashboard, burndown chart, AI narrative |
| QA Audit | Pass rate, coverage, findings table, AI recommendations |
| Tech Debt Review | Debt summary cards, items table, prioritization |
| Product Feedback | Sentiment gauge, theme cloud, suggested backlog items |

---

## Routes

| View | Route |
|------|-------|
| Report Hub Main | `/app/projects/:projectId/reports` |
| Report Detail | `/app/projects/:projectId/reports/:reportId` |

---

## Notes

- Sprint Reports show warning when sprint near completion
- Project Reports can be regenerated
- AI-generated reports marked as "AI-assisted"
- Export to PDF/Markdown supported
- Permissions respect SCRUM roles