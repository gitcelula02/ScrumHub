# Project Templates

**Status: Planned**

---

## Overview

Project Templates provide pre-configured starting points for new projects. Templates include predefined backlogs, statuses, sample tasks, and suggested configurations to accelerate project setup.

**Key Features:**
- Pre-built templates for common project types
- AI-assisted project creation from natural language
- Templates include backlog structure, not just empty projects
- Custom templates can be saved by users

---

## Schema & API Reference

**Entity Definition:** See [ERD.md](/docs/ERD.md) — ProjectTemplate entity.

**API Endpoints:** See [ENDPOINTS.md](/docs/ENDPOINTS.md) — Project Templates section for full endpoint documentation with `is_implemented` flags.

---

## Frontend Views

### Template Selection Modal

**Triggered from:** Create Project button in Explorer

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Create New Project                              [X]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [🏃 Sprint Planning] [🔬 Research] [🐛 Bug Tracker]       │
│ [⚙️ Continuous]        [⭐ Custom]                         │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│ │ 🏃              │ │ 🔬              │ │ 🐛              ││
│ │ Sprint Planning │ │ Research Hub    │ │ Bug Tracker    ││
│ │                 │ │                 │ │                 ││
│ │ Perfect for...  │ │ For technical... │ │ For ongoing... ││
│ │                 │ │                 │ │                 ││
│ │ [Use Template]  │ │ [Use Template]  │ │ [Use Template]  ││
│ └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Or describe your project:                                ││
│ │ ┌─────────────────────────────────────────────────────┐ ││
│ │ │ Create a project called X for Y purpose...        │ ││
│ │ └─────────────────────────────────────────────────────┘ ││
│ │                                          [Create with AI]││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Template Cards

**Compact View (Template Picker):**
- Icon (large, centered)
- Name (bold)
- One-line description
- "Use Template" button

**Detailed View (Template Preview):**
- Full description
- Included features list
- Sample tasks preview
- Screenshot/preview if available

### AI Creation Input

**Location:** Search bar in Explorer OR template modal

**Behavior:**
1. User types natural language request
2. AI parses and extracts:
   - Project name
   - Project goal/description
   - Suggested features
3. Shows preview with editable fields
4. User confirms → Project created

**Example Flow:**
```
User: "Create a project for my team's code review workflow"

AI Preview:
┌─────────────────────────────────────────────────────┐
│ Project Name: Code Review Workflow                 │
│ Goal: Improve team code review process              │
│                                                     │
│ Suggested Backlog:                                  │
│ • Development Backlog (with statuses)              │
│                                                     │
│ Suggested Tasks:                                    │
│ • Epic: Code Review Process                         │
│   - Story: Assign reviewers automatically          │
│   - Task: Setup PR templates                       │
│                                                     │
│ [Edit] [Cancel] [Create Project]                    │
└─────────────────────────────────────────────────────┘
```

---

## Frontend Implementation

**New Components:**
```
features/project-templates/
├── components/
│   ├── TemplateSelector.tsx
│   ├── TemplateCard.tsx
│   ├── TemplatePreview.tsx
│   ├── AICreateProjectInput.tsx
│   ├── AICreateProjectPreview.tsx
│   └── CustomTemplateEditor.tsx
├── hooks/
│   ├── useProjectTemplates.ts
│   ├── useCreateFromTemplate.ts
│   └── useAICreateProject.ts
├── services/
│   └── templateService.ts
└── index.ts
```

---

## Implementation Checklist

- [ ] Database migration for project_templates
- [ ] Insert system templates
- [ ] Backend: TemplateService CRUD
- [ ] Backend: Create project from template
- [ ] Backend: AI project creation endpoint
- [ ] Frontend: project-templates feature module
- [ ] Frontend: TemplateSelector modal
- [ ] Frontend: TemplateCard component
- [ ] Frontend: AICreateProjectInput in explorer search
- [ ] Frontend: AICreateProjectPreview modal
- [ ] Frontend: Integration with CreateProjectModal
- [ ] E2E tests for template project creation
- [ ] Documentation update

---

## Notes

- System templates cannot be deleted, only disabled
- Custom templates inherit user's folder structure
- AI creation uses project-specific RAG context when available
- Templates include pre-configured statuses (not just empty backlogs)
- Template usage count tracks which templates are popular