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

## Backend Entities

### ProjectTemplate Entity

**Purpose:** Pre-defined project templates for common use cases.

```typescript
ProjectTemplate {
  id: UUID
  name: string
  description: string
  icon: string (emoji)
  category: "sprint_planning" | "research" | "bug_tracker" | "continuous" | "custom"
  is_system: boolean (true for built-in, false for user-created)
  created_by_user_id: UUID (FK, nullable - null for system templates)
  config: JSON (template configuration)
  usage_count: number (for sorting/popularity)
  created_at: timestamp
  updated_at: timestamp
}
```

### TemplateConfig Schema

```typescript
TemplateConfig {
  goal_template: string
  default_sections: Array<{ key: string, value: string, order: number }>
  backlogs: Array<{
    name: string
    type: "development" | "qa_testing" | "strategic" | "custom"
    description: string
    default_statuses: Array<{ name: string, color: string, order: number }>
  }>
  suggested_sprints: Array<{
    name: string
    duration_weeks: number
    goal: string
  }>
  sample_tasks: Array<{
    type: "epic" | "story" | "task"
    title: string
    description: string
    priority: "low" | "medium" | "high" | "urgent"
  }>
  role_suggestions: Array<{
    role_type: string
    count_suggested: number
  }>
}
```

### Built-in Templates

#### 1. Sprint Planning Starter
```json
{
  "name": "Sprint Planning Starter",
  "description": "Perfect for feature development with sprint-based delivery",
  "icon": "🏃",
  "category": "sprint_planning",
  "config": {
    "goal_template": "Deliver [feature] in [sprint_count] sprints",
    "default_sections": [
      { "key": "vision", "value": "", "order": 0 },
      { "key": "goals", "value": "", "order": 1 }
    ],
    "backlogs": [
      {
        "name": "Development",
        "type": "development",
        "description": "Main development backlog",
        "default_statuses": [
          { "name": "To Do", "color": "#6B7280", "order": 0 },
          { "name": "In Progress", "color": "#3B82F6", "order": 1 },
          { "name": "In Review", "color": "#F59E0B", "order": 2 },
          { "name": "Done", "color": "#10B981", "order": 3 }
        ]
      }
    ],
    "suggested_sprints": [
      { "name": "Sprint 1", "duration_weeks": 2, "goal": "Initial setup and core features" }
    ],
    "sample_tasks": [],
    "role_suggestions": [
      { "role_type": "developer", "count_suggested": 3 },
      { "role_type": "qa", "count_suggested": 1 },
      { "role_type": "scrum_master", "count_suggested": 1 }
    ]
  }
}
```

#### 2. Research Hub
```json
{
  "name": "Research Hub",
  "description": "For technical spikes, investigation, and proof-of-concept work",
  "icon": "🔬",
  "category": "research",
  "config": {
    "goal_template": "Research and validate [topic]",
    "default_sections": [
      { "key": "research_objectives", "value": "", "order": 0 },
      { "key": "hypotheses", "value": "", "order": 1 },
      { "key": "findings", "value": "", "order": 2 }
    ],
    "backlogs": [
      {
        "name": "Research",
        "type": "strategic",
        "description": "Research tasks and experiments",
        "default_statuses": [
          { "name": "To Explore", "color": "#6B7280", "order": 0 },
          { "name": "In Investigation", "color": "#8B5CF6", "order": 1 },
          { "name": "Validated", "color": "#10B981", "order": 2 }
        ]
      }
    ],
    "suggested_sprints": [
      { "name": "Spike Week", "duration_weeks": 1, "goal": "Initial research" }
    ],
    "sample_tasks": [
      { "type": "epic", "title": "Technical Investigation", "description": "Investigate technical approaches", "priority": "high" },
      { "type": "task", "title": "Literature Review", "description": "Review existing solutions", "priority": "medium" }
    ],
    "role_suggestions": [
      { "role_type": "developer", "count_suggested": 2 },
      { "role_type": "tech_lead", "count_suggested": 1 }
    ]
  }
}
```

#### 3. Bug Tracker
```json
{
  "name": "Bug Tracker",
  "description": "For ongoing bug tracking and issue management",
  "icon": "🐛",
  "category": "bug_tracker",
  "config": {
    "goal_template": "Track and resolve bugs for [product]",
    "default_sections": [
      { "key": "affected_versions", "value": "", "order": 0 },
      { "key": "known_issues", "value": "", "order": 1 }
    ],
    "backlogs": [
      {
        "name": "Bugs",
        "type": "qa_testing",
        "description": "Bug reports and tracking",
        "default_statuses": [
          { "name": "Reported", "color": "#EF4444", "order": 0 },
          { "name": "Triaged", "color": "#F59E0B", "order": 1 },
          { "name": "In Fix", "color": "#3B82F6", "order": 2 },
          { "name": "Verified", "color": "#10B981", "order": 3 }
        ]
      }
    ],
    "suggested_sprints": [],
    "sample_tasks": [],
    "role_suggestions": [
      { "role_type": "qa", "count_suggested": 2 },
      { "role_type": "developer", "count_suggested": 2 }
    ]
  }
}
```

#### 4. Continuous Improvement
```json
{
  "name": "Continuous Improvement",
  "description": "For ongoing maintenance, tech debt, and incremental improvements",
  "icon": "⚙️",
  "category": "continuous",
  "config": {
    "goal_template": "Continuously improve [system]",
    "default_sections": [
      { "key": "system_overview", "value": "", "order": 0 },
      { "key": "tech_debt_backlog", "value": "", "order": 1 }
    ],
    "backlogs": [
      {
        "name": "Maintenance",
        "type": "development",
        "description": "Ongoing maintenance tasks",
        "default_statuses": [
          { "name": "Backlog", "color": "#6B7280", "order": 0 },
          { "name": "Scheduled", "color": "#3B82F6", "order": 1 },
          { "name": "In Progress", "color": "#F59E0B", "order": 2 },
          { "name": "Completed", "color": "#10B981", "order": 3 }
        ]
      },
      {
        "name": "Tech Debt",
        "type": "qa_testing",
        "description": "Technical debt items",
        "default_statuses": [
          { "name": "Identified", "color": "#6B7280", "order": 0 },
          { "name": "Prioritized", "color": "#F59E0B", "order": 1 },
          { "name": "Resolved", "color": "#10B981", "order": 2 }
        ]
      }
    ],
    "suggested_sprints": [
      { "name": "Sprint 1", "duration_weeks": 2, "goal": "Initial assessment" }
    ],
    "sample_tasks": [
      { "type": "epic", "title": "Tech Debt Audit", "description": "Review and document tech debt", "priority": "medium" }
    ],
    "role_suggestions": [
      { "role_type": "developer", "count_suggested": 2 },
      { "role_type": "qa", "count_suggested": 1 },
      { "role_type": "devops", "count_suggested": 1 }
    ]
  }
}
```

---

## API Endpoints

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/templates` | Get all available templates (system + user) |
| GET | `/templates/:templateId` | Get template details |
| POST | `/templates` | Create custom template |
| PATCH | `/templates/:templateId` | Update template |
| DELETE | `/templates/:templateId` | Delete custom template |
| GET | `/templates/categories` | Get template categories |

### Project Creation from Template

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/templates/:templateId/create-project` | Create project from template |

### AI Project Creation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects/ai-create` | Create project using AI |

---

## Request/Response Examples

**Get Templates:**
```json
GET /templates

Response:
{
  "data": [
    {
      "id": "template-1",
      "name": "Sprint Planning Starter",
      "description": "Perfect for feature development with sprint-based delivery",
      "icon": "🏃",
      "category": "sprint_planning",
      "is_system": true,
      "usage_count": 156
    },
    {
      "id": "template-2",
      "name": "My Custom Template",
      "description": "Custom template for my team",
      "icon": "⭐",
      "category": "custom",
      "is_system": false,
      "usage_count": 5
    }
  ]
}
```

**Create Project from Template:**
```json
POST /templates/template-1/create-project
{
  "name": "New Feature Project",
  "goal": "Build user authentication system",
  "folder_id": "folder-uuid",
  "sprints_count": 3
}

Response:
{
  "data": {
    "project": {
      "id": "new-project-uuid",
      "name": "New Feature Project",
      "goal": "Build user authentication system",
      "color": "#3B82F6",
      "icon": "🏃"
    },
    "backlogs_created": ["backlog-uuid-1"],
    "sprints_created": ["sprint-1", "sprint-2", "sprint-3"]
  }
}
```

**AI Create Project:**
```json
POST /projects/ai-create
{
  "message": "Create a project called 'User Authentication' for managing login, signup and password reset features. It's for a web app."
}

Response:
{
  "data": {
    "project": {
      "id": "project-uuid",
      "name": "User Authentication",
      "description": "Project for managing user authentication features",
      "goal": "Implement complete authentication system",
      "color": "#6366F1",
      "icon": "🔐"
    },
    "sections": [
      { "key": "features", "value": "- Login\n- Signup\n- Password Reset" }
    ],
    "backlog": {
      "id": "backlog-uuid",
      "name": "Development Backlog",
      "statuses": [...]
    },
    "suggested_tasks": [
      { "type": "epic", "title": "User Authentication", "priority": "high" },
      { "type": "story", "title": "As a user, I can sign up", "priority": "high" },
      { "type": "task", "title": "Setup OAuth provider", "priority": "medium" }
    ]
  }
}
```

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

## Architecture Changes

### Database Migration

```sql
-- Project Templates
CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  category VARCHAR(50) NOT NULL DEFAULT 'custom',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by_user_id UUID REFERENCES users(id),
  config JSONB NOT NULL DEFAULT '{}',
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_category ON project_templates(category);
CREATE INDEX idx_templates_system ON project_templates(is_system);
CREATE INDEX idx_templates_usage ON project_templates(usage_count DESC);

-- Insert system templates
INSERT INTO project_templates (name, description, icon, category, is_system, config) VALUES
('Sprint Planning Starter', 'Perfect for feature development with sprint-based delivery', '🏃', 'sprint_planning', true, '...'),
('Research Hub', 'For technical spikes, investigation, and proof-of-concept work', '🔬', 'research', true, '...'),
('Bug Tracker', 'For ongoing bug tracking and issue management', '🐛', 'bug_tracker', true, '...'),
('Continuous Improvement', 'For ongoing maintenance, tech debt, and incremental improvements', '⚙️', 'continuous', true, '...');
```

### AI Integration

**AI Project Creation Flow:**
1. User submits natural language request
2. Backend sends to AI with prompt:
   ```
   Create a project plan from: "{user_message}"
   
   Extract:
   - project_name: string
   - project_description: string
   - project_goal: string
   - suggested_icon: emoji
   - suggested_color: hex
   - sections: array of {key, value}
   - backlogs: array of {name, type}
   - suggested_tasks: array of {type, title, description, priority}
   ```
3. AI returns structured JSON
4. Backend validates and creates project
5. Returns created project with full structure

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