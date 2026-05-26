## SQL Schema Reference

This section contains the PostgreSQL CREATE TABLE statements for all entities. Schema definitions are the authoritative source for database structure.

### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  default_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SCRUM Role Preferences (user's preferred roles)
CREATE TABLE scrum_role_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_type VARCHAR(50) NOT NULL, -- 'product_owner', 'scrum_master', 'qa', 'developer', 'devops', 'tech_lead'
  specialization VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal TEXT,
  icon VARCHAR(10),
  color VARCHAR(7),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'completed'
  created_by_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Members (User ↔ Project many-to-many)
CREATE TABLE project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scrum_role VARCHAR(50) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- User Folders (personal organization per user)
CREATE TABLE user_folders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES user_folders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_folder_name_per_parent UNIQUE (user_id, parent_id, name),
  CONSTRAINT max_nesting_depth CHECK (nest_level(user_id, parent_id) <= 5)
);

-- User Folder Projects (folder ↔ project many-to-many via user)
CREATE TABLE user_folder_projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id INTEGER REFERENCES user_folders(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Project Custom Sections (vision, mission, goals - feeds RAG context)
CREATE TABLE project_custom_sections (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  key VARCHAR(255) NOT NULL,
  value TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Templates
CREATE TABLE project_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  category VARCHAR(50) DEFAULT 'custom', -- 'sprint_planning', 'research', 'bug_tracker', 'continuous', 'custom'
  is_system BOOLEAN DEFAULT false,
  created_by_user_id INTEGER REFERENCES users(id),
  config JSONB DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Task & Backlog Tables

```sql
-- Backlogs (multiple per project)
CREATE TABLE backlogs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'custom', -- 'development', 'qa_testing', 'strategic', 'custom'
  color VARCHAR(7),
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks (Epic, Story, Task, Subtask - unified by type field)
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  backlog_id INTEGER REFERENCES backlogs(id),
  parent_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL, -- 'epic', 'story', 'task'
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status_id INTEGER REFERENCES statuses(id),
  "index" INTEGER, -- Hierarchy level for NoSQL-like traversal
  due_date TIMESTAMP,
  created_by_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Task Assignees (Task ↔ User many-to-many)
CREATE TABLE task_assignees (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_cascade_override BOOLEAN DEFAULT false, -- true if explicitly assigned (not inherited from parent)
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- Task Dependencies
CREATE TABLE task_dependencies (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, -- dependent task
  depends_on_task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, -- blocking task
  dependency_type VARCHAR(50) DEFAULT 'blocks_start', -- 'blocks_start', 'blocks_completion'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Acceptance Criteria (QA checklist items)
CREATE TABLE acceptance_criteria (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  is_marked BOOLEAN DEFAULT false,
  created_by_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Attachments
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  mime_type VARCHAR(100),
  size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Statuses (Kanban columns per project)
CREATE TABLE statuses (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7),
  associated_role VARCHAR(50),
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
```

### Sprint Tables

```sql
-- Sprints
CREATE TABLE sprints (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal TEXT,
  color VARCHAR(7),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'active', 'completed', 'cancelled'
  is_parallel BOOLEAN DEFAULT true,
  team_tag VARCHAR(100),
  created_by_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sprint Groups (for organizing related sprints)
CREATE TABLE sprint_groups (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sprint Group Membership
CREATE TABLE sprint_group_memberships (
  sprint_id INTEGER NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  group_id INTEGER NOT NULL REFERENCES sprint_groups(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (sprint_id, group_id)
);

-- Mini-Sprints (short tactical sprints, 1-3 days)
CREATE TABLE mini_sprints (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'custom', -- 'hotfix', 'research', 'polish', 'qa', 'spike', 'custom'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_hours INTEGER,
  status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'active', 'completed', 'cancelled'
  color VARCHAR(7),
  auto_complete BOOLEAN DEFAULT true,
  priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_mini_sprint_duration CHECK (end_date <= start_date + INTERVAL '3 days')
);

-- Mini-Sprint Task Assignments
CREATE TABLE mini_sprint_tasks (
  id SERIAL PRIMARY KEY,
  mini_sprint_id INTEGER NOT NULL REFERENCES mini_sprints(id) ON DELETE CASCADE,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  source VARCHAR(50) DEFAULT 'moved_from_backlog', -- 'moved_from_backlog', 'moved_from_sprint', 'created_directly'
  notes TEXT,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(mini_sprint_id, task_id)
);

-- Quick Capture Backlogs (for rapid task capture in mini-sprints)
CREATE TABLE quick_capture_backlogs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) DEFAULT 'Quick Tasks',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Retrospective & Report Tables

```sql
-- Retrospectives (one-to-one with Sprint - for backward compatibility)
CREATE TABLE retrospectives (
  id SERIAL PRIMARY KEY,
  sprint_id INTEGER NOT NULL UNIQUE REFERENCES sprints(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sections JSONB DEFAULT '[{"type":"what_went_wrong","content":"","order":1},{"type":"what_went_good","content":"","order":2},{"type":"improvements","content":"","order":3},{"type":"action_items","content":"","order":4}]',
  created_by_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reports (base table - Project Reports and Sprint Reports)
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL, -- null = Project Report, set = Sprint Report
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'sprint_retrospective', 'sprint_summary', 'qa_audit', 'tech_debt_review', 'product_feedback', 'velocity_report', 'custom'
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_active BOOLEAN DEFAULT true, -- soft delete flag
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Sprint Report Extensions (stores type-specific data)
CREATE TABLE sprint_retrospectives (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  sprint_id INTEGER NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  sections JSONB DEFAULT '{"what_went_well":"","what_could_improve":"","action_items":"","team_acknowledgments":""}',
  ai_insights TEXT,
  participants INTEGER[] DEFAULT '{}'
);

CREATE TABLE sprint_summaries (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  sprint_id INTEGER NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  metrics JSONB NOT NULL DEFAULT '{}', -- {planned_tasks, completed_tasks, completion_rate, etc.}
  burndown_data JSONB,
  ai_narrative TEXT
);

CREATE TABLE qa_audits (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  scope VARCHAR(50) NOT NULL, -- 'project', 'backlog', 'sprint'
  scope_id INTEGER,
  metrics JSONB NOT NULL DEFAULT '{}', -- {total_test_cases, passed, failed, blocked, pass_rate, test_coverage_percentage}
  findings JSONB DEFAULT '[]',
  ai_recommendations TEXT
);

CREATE TABLE tech_debt_reviews (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  scope VARCHAR(50) NOT NULL,
  scope_id INTEGER,
  debt_items JSONB DEFAULT '[]',
  metrics JSONB NOT NULL DEFAULT '{}',
  ai_insights TEXT
);

CREATE TABLE product_feedbacks (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
  feedback_sources VARCHAR(50)[] DEFAULT '{}', -- ['github_issues', 'user_feedback', 'chat_transcriptions', 'surveys']
  sentiment_analysis JSONB NOT NULL DEFAULT '{}', -- {positive, neutral, negative}
  themes JSONB DEFAULT '[]',
  backlog_impact JSONB DEFAULT '[]'
);

-- Report Backlog Items (suggestions from reports that can become tasks)
CREATE TABLE report_backlog_items (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL, -- null if not yet created
  suggested_title VARCHAR(255) NOT NULL,
  suggested_type VARCHAR(50) NOT NULL, -- 'epic', 'story', 'task'
  suggested_description TEXT,
  priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(50) DEFAULT 'suggested', -- 'suggested', 'approved', 'rejected', 'created'
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  converted_at TIMESTAMP
);
```

### Chatroom & Communication Tables

```sql
-- Chatrooms (one-to-one with Project)
CREATE TABLE chatrooms (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Channels (text or voice within a chatroom)
CREATE TABLE channels (
  id SERIAL PRIMARY KEY,
  chatroom_id INTEGER NOT NULL REFERENCES chatrooms(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'text', 'voice'
  name VARCHAR(100) NOT NULL,
  "order" INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- Messages
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Voice Sessions
CREATE TABLE voice_sessions (
  id SERIAL PRIMARY KEY,
  channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'ended'
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

-- Voice Session Participants
CREATE TABLE voice_session_participants (
  id SERIAL PRIMARY KEY,
  voice_session_id INTEGER NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP
);

-- Daily Standups
CREATE TABLE daily_standups (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  channel_id INTEGER NOT NULL REFERENCES channels(id),
  scheduled_at TIMESTAMP NOT NULL,
  voice_session_id INTEGER REFERENCES voice_sessions(id),
  state_summary TEXT,
  stoppers_detected JSONB DEFAULT '[]',
  expected_latencies JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Transcriptions (RAG-stored for AI context)
CREATE TABLE ai_transcriptions (
  id SERIAL PRIMARY KEY,
  voice_session_id INTEGER REFERENCES voice_sessions(id),
  daily_standup_id INTEGER REFERENCES daily_standups(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  project_id INTEGER NOT NULL REFERENCES projects(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### AI & RAG Tables

```sql
-- AI Chat Sessions
CREATE TABLE ai_chat_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id), -- nullable for global sessions
  agent_type VARCHAR(50) DEFAULT 'chat-assistant', -- 'backlog-assistant', 'chat-assistant', 'retrospective-agent'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Chat Messages (vectorized for RAG)
CREATE TABLE ai_chat_messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  model VARCHAR(100),
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Automation & Integration Tables

```sql
-- Triggers (Inter-Backlog Automation)
CREATE TABLE triggers (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_backlog_id INTEGER REFERENCES backlogs(id),
  target_backlog_id INTEGER REFERENCES backlogs(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL, -- 'status_change', 'task_created', 'task_assigned', 'comment_added', 'sprint_started', 'sprint_ended'
  conditions JSONB DEFAULT '{}',
  action_type VARCHAR(50) NOT NULL, -- 'create_task', 'duplicate_task', 'send_notification', 'update_task'
  action_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Task Links (for tracking relationships across backlogs)
CREATE TABLE task_links (
  id SERIAL PRIMARY KEY,
  source_task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  target_task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  trigger_id INTEGER REFERENCES triggers(id) ON DELETE SET NULL,
  link_type VARCHAR(50) DEFAULT 'manual', -- 'automation_created', 'manual', 'dependency'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_task_id, target_task_id)
);

-- Canvases (Free Board / Visual Roadmap)
CREATE TABLE canvases (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  viewport JSONB DEFAULT '{"x":0,"y":0,"zoom":1}',
  settings JSONB DEFAULT '{"grid_enabled":true,"snap_to_grid":true,"background_color":"#1E293B"}',
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Canvas Elements
CREATE TABLE canvas_elements (
  id SERIAL PRIMARY KEY,
  canvas_id INTEGER NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'rectangle', 'circle', 'arrow', 'text', 'sticky_note', 'image', 'task_card', 'connector'
  position JSONB NOT NULL DEFAULT '{"x":0,"y":0}',
  size JSONB NOT NULL DEFAULT '{"width":100,"height":100}',
  rotation INTEGER DEFAULT 0,
  style JSONB DEFAULT '{}',
  content TEXT,
  z_index INTEGER DEFAULT 0,
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Canvas Element Task Links (bidirectional linking to tasks)
CREATE TABLE canvas_element_task_links (
  id SERIAL PRIMARY KEY,
  element_id INTEGER NOT NULL REFERENCES canvas_elements(id) ON DELETE CASCADE,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  link_type VARCHAR(50) DEFAULT 'visual_state', -- 'visual_state', 'navigation', 'reference'
  state_binding JSONB DEFAULT '{"sync_direction":"task_to_canvas","status_mappings":[]}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Settings & Subscription Tables

```sql
-- Settings (polymorphic)
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'general', 'project', 'user', 'user_project_override'
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API Key Vault (encrypted storage)
CREATE TABLE api_key_vault (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'deepseek', 'openai', 'anthropic'
  encrypted_value TEXT NOT NULL,
  public_alias VARCHAR(255) NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  allow_project_share BOOLEAN DEFAULT false,
  max_credit_per_user DECIMAL(10,2) DEFAULT 10.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  plan VARCHAR(50) DEFAULT 'free', -- 'free', 'starter', 'pro', 'enterprise'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'past_due'
  credits_remaining DECIMAL(10,2) DEFAULT 0,
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual'
  current_period_start DATE,
  current_period_end DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'email', 'push', 'in_app'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'email', 'push', 'in_app'
  enabled BOOLEAN DEFAULT true,
  UNIQUE(user_id, type)
);

-- Project AI Usage Tracking
CREATE TABLE project_ai_usage (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  api_key_id INTEGER NOT NULL REFERENCES api_key_vault(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_user_folders_user ON user_folders(user_id);
CREATE INDEX idx_user_folders_parent ON user_folders(parent_id);
CREATE INDEX idx_user_folder_projects_user ON user_folder_projects(user_id);
CREATE INDEX idx_user_folder_projects_folder ON user_folder_projects(folder_id);
CREATE INDEX idx_project_sections_project ON project_custom_sections(project_id);
CREATE INDEX idx_backlogs_project ON backlogs(project_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_backlog ON tasks(backlog_id);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_id);
CREATE INDEX idx_tasks_status ON tasks(status_id);
CREATE INDEX idx_task_assignees_task ON task_assignees(task_id);
CREATE INDEX idx_task_assignees_user ON task_assignees(user_id);
CREATE INDEX idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);
CREATE INDEX idx_acceptance_criteria_task ON acceptance_criteria(task_id);
CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_attachments_task ON attachments(task_id);
CREATE INDEX idx_statuses_project ON statuses(project_id);
CREATE INDEX idx_sprints_project ON sprints(project_id);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_mini_sprints_project ON mini_sprints(project_id);
CREATE INDEX idx_mini_sprints_parent ON mini_sprints(parent_sprint_id);
CREATE INDEX idx_mini_sprints_status ON mini_sprints(status);
CREATE INDEX idx_reports_project ON reports(project_id);
CREATE INDEX idx_reports_sprint ON reports(sprint_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_report_backlog_items_report ON report_backlog_items(report_id);
CREATE INDEX idx_chatrooms_project ON chatrooms(project_id);
CREATE INDEX idx_channels_chatroom ON channels(chatroom_id);
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_voice_sessions_channel ON voice_sessions(channel_id);
CREATE INDEX idx_daily_standups_project ON daily_standups(project_id);
CREATE INDEX idx_daily_standups_scheduled ON daily_standups(scheduled_at);
CREATE INDEX idx_ai_transcriptions_project ON ai_transcriptions(project_id);
CREATE INDEX idx_ai_transcriptions_user ON ai_transcriptions(user_id);
CREATE INDEX idx_ai_chat_sessions_user ON ai_chat_sessions(user_id);
CREATE INDEX idx_ai_chat_sessions_project ON ai_chat_sessions(project_id);
CREATE INDEX idx_ai_chat_messages_session ON ai_chat_messages(session_id);
CREATE INDEX idx_triggers_project ON triggers(project_id);
CREATE INDEX idx_triggers_backlog ON triggers(source_backlog_id, target_backlog_id);
CREATE INDEX idx_task_links_source ON task_links(source_task_id);
CREATE INDEX idx_task_links_target ON task_links(target_task_id);
CREATE INDEX idx_canvases_project ON canvases(project_id);
CREATE INDEX idx_canvas_elements_canvas ON canvas_elements(canvas_id);
CREATE INDEX idx_canvas_element_task_links_element ON canvas_element_task_links(element_id);
CREATE INDEX idx_canvas_element_task_links_task ON canvas_element_task_links(task_id);
CREATE INDEX idx_project_ai_usage_project ON project_ai_usage(project_id);
CREATE INDEX idx_project_ai_usage_period ON project_ai_usage(period_start, period_end);
```

---
