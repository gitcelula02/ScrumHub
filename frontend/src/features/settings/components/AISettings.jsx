import { useState } from 'react';

/**
 * @component AISettings
 * @description AI configuration settings component. Shows different content
 * based on whether it's for a project or global settings.
 * White-heavy workspace design.
 *
 * @param {Object} props
 * @param {Object} props.aiSettings - Global AI settings (for user-level)
 * @param {Object} props.projectAISettings - Project AI settings (for project-level)
 * @param {Function} props.onSave - Save handler
 * @param {Function} props.onSaveProject - Project save handler
 * @param {boolean} props.saving - Loading state
 * @param {boolean} props.isProject - Whether this is project-level settings
 */
export function AISettings({
  aiSettings,
  projectAISettings,
  onSave,
  onSaveProject,
  saving,
  isProject = false
}) {
  const [activeTab, setActiveTab] = useState('skills');

  const settings = isProject ? projectAISettings : aiSettings;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (isProject) {
      onSaveProject({
        enabled: e.target.querySelector('[name="ai.enabled"]').checked,
        context: {
          includeBacklog: e.target.querySelector('[name="ai.context.includeBacklog"]').checked,
          includeSprints: e.target.querySelector('[name="ai.context.includeSprints"]').checked,
          includeChat: e.target.querySelector('[name="ai.context.includeChat"]').checked,
          includeActivity: e.target.querySelector('[name="ai.context.includeActivity"]').checked,
        },
        skills: {
          sprintSuggestions: e.target.querySelector('[name="ai.skills.sprintSuggestions"]').checked,
          taskEstimation: e.target.querySelector('[name="ai.skills.taskEstimation"]').checked,
          riskPrediction: e.target.querySelector('[name="ai.skills.riskPrediction"]').checked,
          meetingSummaries: e.target.querySelector('[name="ai.skills.meetingSummaries"]').checked,
        },
      });
    } else {
      onSave({
        enabled: e.target.querySelector('[name="ai.enabled"]').checked,
        model: formData.get('ai.model'),
        temperature: parseFloat(formData.get('ai.temperature')) || 0.7,
        maxTokens: parseInt(formData.get('ai.maxTokens')) || 2000,
        skills: {
          codeReview: e.target.querySelector('[name="ai.skills.codeReview"]').checked,
          sprintPlanning: e.target.querySelector('[name="ai.skills.sprintPlanning"]').checked,
          backlogRefinement: e.target.querySelector('[name="ai.skills.backlogRefinement"]').checked,
          riskAnalysis: e.target.querySelector('[name="ai.skills.riskAnalysis"]').checked,
          reportGeneration: e.target.querySelector('[name="ai.skills.reportGeneration"]').checked,
        },
        agents: {
          assistant: e.target.querySelector('[name="ai.agents.assistant"]').checked,
          analytics: e.target.querySelector('[name="ai.agents.analytics"]').checked,
          automation: e.target.querySelector('[name="ai.agents.automation"]').checked,
        },
        permissions: {
          readProjects: e.target.querySelector('[name="ai.permissions.readProjects"]').checked,
          writeTasks: e.target.querySelector('[name="ai.permissions.writeTasks"]').checked,
          manageMembers: e.target.querySelector('[name="ai.permissions.manageMembers"]').checked,
          accessReports: e.target.querySelector('[name="ai.permissions.accessReports"]').checked,
        },
      });
    }
  };

  const tabs = isProject
    ? [
        { id: 'skills', label: 'Skills' },
        { id: 'context', label: 'Context' },
      ]
    : [
        { id: 'skills', label: 'Skills' },
        { id: 'agents', label: 'Agents' },
        { id: 'permissions', label: 'Permissions' },
        { id: 'model', label: 'Model' },
      ];

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">
          {isProject ? 'AI Configuration' : 'AI Settings'}
        </h2>
        <p className="settings-section-desc text-secondary">
          {isProject
            ? 'Configure how AI assists with this project.'
            : 'Configure global AI behavior and permissions across all projects.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* AI Enable Toggle */}
        <div className="settings-field">
          <label className="settings-toggle-item">
            <input
              type="checkbox"
              name="ai.enabled"
              defaultChecked={settings?.enabled ?? true}
              className="form-check-input"
            />
            <span className="settings-toggle-label">
              <span className="fw-medium">Enable AI Assistant</span>
              <span className="text-secondary text-sm">
                {isProject
                  ? 'Enable AI features for this project'
                  : 'Enable AI assistant globally'}
              </span>
            </span>
          </label>
        </div>

        <div className="settings-divider" />

        {/* Tabs for project or general AI settings */}
        <div className="settings-tabs" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="settings-tab-content" role="tabpanel">
            <h3 className="settings-subsection-title">
              {isProject ? 'Project AI Skills' : 'AI Skills'}
            </h3>
            <p className="settings-subsection-desc text-secondary mb-3">
              {isProject
                ? 'Choose which AI capabilities are available for this project.'
                : 'Enable specific AI capabilities you want to use.'}
            </p>

            <div className="settings-toggle-list">
              {isProject ? (
                <>
                  <ToggleItem
                    name="ai.skills.sprintSuggestions"
                    label="Sprint suggestions"
                    desc="AI suggests sprint goals and task assignments"
                    defaultChecked={settings?.skills?.sprintSuggestions ?? true}
                  />
                  <ToggleItem
                    name="ai.skills.taskEstimation"
                    label="Task estimation"
                    desc="AI estimates story points and effort"
                    defaultChecked={settings?.skills?.taskEstimation ?? true}
                  />
                  <ToggleItem
                    name="ai.skills.riskPrediction"
                    label="Risk prediction"
                    desc="AI identifies potential blockers and risks"
                    defaultChecked={settings?.skills?.riskPrediction ?? true}
                  />
                  <ToggleItem
                    name="ai.skills.meetingSummaries"
                    label="Meeting summaries"
                    desc="AI summarizes sprint meetings and notes"
                    defaultChecked={settings?.skills?.meetingSummaries ?? true}
                  />
                </>
              ) : (
                <>
                  <ToggleItem
                    name="ai.skills.codeReview"
                    label="Code review"
                    desc="AI reviews code changes and suggests improvements"
                    defaultChecked={settings?.skills?.codeReview ?? true}
                  />
                  <ToggleItem
                    name="ai.skills.sprintPlanning"
                    label="Sprint planning"
                    desc="AI assists with sprint planning and backlog grooming"
                    defaultChecked={settings?.skills?.sprintPlanning ?? true}
                  />
                  <ToggleItem
                    name="ai.skills.backlogRefinement"
                    label="Backlog refinement"
                    desc="AI helps refine user stories and acceptance criteria"
                    defaultChecked={settings?.skills?.backlogRefinement ?? true}
                  />
                  <ToggleItem
                    name="ai.skills.riskAnalysis"
                    label="Risk analysis"
                    desc="AI identifies project risks and suggests mitigations"
                    defaultChecked={settings?.skills?.riskAnalysis ?? true}
                  />
                  <ToggleItem
                    name="ai.skills.reportGeneration"
                    label="Report generation"
                    desc="AI generates sprint reports and analytics"
                    defaultChecked={settings?.skills?.reportGeneration ?? true}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Context Tab (Project only) */}
        {activeTab === 'context' && isProject && (
          <div className="settings-tab-content" role="tabpanel">
            <h3 className="settings-subsection-title">AI Context</h3>
            <p className="settings-subsection-desc text-secondary mb-3">
              Choose which project data the AI can access for context.
            </p>

            <div className="settings-toggle-list">
              <ToggleItem
                name="ai.context.includeBacklog"
                label="Include backlog"
                desc="AI can read and analyze your backlog"
                defaultChecked={settings?.context?.includeBacklog ?? true}
              />
              <ToggleItem
                name="ai.context.includeSprints"
                label="Include sprints"
                desc="AI can read sprint goals and task status"
                defaultChecked={settings?.context?.includeSprints ?? true}
              />
              <ToggleItem
                name="ai.context.includeChat"
                label="Include chat history"
                desc="AI can read project chat conversations"
                defaultChecked={settings?.context?.includeChat ?? true}
              />
              <ToggleItem
                name="ai.context.includeActivity"
                label="Include activity log"
                desc="AI can read recent team activity"
                defaultChecked={settings?.context?.includeActivity ?? false}
              />
            </div>
          </div>
        )}

        {/* Agents Tab (General only) */}
        {activeTab === 'agents' && !isProject && (
          <div className="settings-tab-content" role="tabpanel">
            <h3 className="settings-subsection-title">AI Agents</h3>
            <p className="settings-subsection-desc text-secondary mb-3">
              Enable or disable specific AI agents.
            </p>

            <div className="settings-toggle-list">
              <ToggleItem
                name="ai.agents.assistant"
                label="AI Assistant"
                desc="General purpose AI assistant for questions and help"
                defaultChecked={settings?.agents?.assistant ?? true}
              />
              <ToggleItem
                name="ai.agents.analytics"
                label="Analytics Agent"
                desc="Dedicated agent for data analysis and reports"
                defaultChecked={settings?.agents?.analytics ?? true}
              />
              <ToggleItem
                name="ai.agents.automation"
                label="Automation Agent"
                desc="Agent that can perform automated tasks"
                defaultChecked={settings?.agents?.automation ?? false}
              />
            </div>
          </div>
        )}

        {/* Permissions Tab (General only) */}
        {activeTab === 'permissions' && !isProject && (
          <div className="settings-tab-content" role="tabpanel">
            <h3 className="settings-subsection-title">AI Permissions</h3>
            <p className="settings-subsection-desc text-secondary mb-3">
              Control what AI can do across your workspace.
            </p>

            <div className="settings-toggle-list">
              <ToggleItem
                name="ai.permissions.readProjects"
                label="Read projects"
                desc="AI can read project data for context"
                defaultChecked={settings?.permissions?.readProjects ?? true}
              />
              <ToggleItem
                name="ai.permissions.writeTasks"
                label="Write tasks"
                desc="AI can create and update tasks"
                defaultChecked={settings?.permissions?.writeTasks ?? true}
              />
              <ToggleItem
                name="ai.permissions.manageMembers"
                label="Manage members"
                desc="AI can invite and manage team members"
                defaultChecked={settings?.permissions?.manageMembers ?? false}
              />
              <ToggleItem
                name="ai.permissions.accessReports"
                label="Access reports"
                desc="AI can view and generate reports"
                defaultChecked={settings?.permissions?.accessReports ?? true}
              />
            </div>
          </div>
        )}

        {/* Model Tab (General only) */}
        {activeTab === 'model' && !isProject && (
          <div className="settings-tab-content" role="tabpanel">
            <h3 className="settings-subsection-title">Model Configuration</h3>
            <p className="settings-subsection-desc text-secondary mb-3">
              Configure the AI model behavior.
            </p>

            <div className="settings-row">
              <div className="settings-field">
                <label htmlFor="ai-model" className="settings-label">
                  AI Model
                </label>
                <select
                  id="ai-model"
                  name="ai.model"
                  className="form-select"
                  defaultValue={settings?.model ?? 'gpt-4'}
                >
                  <option value="gpt-4">GPT-4 (Most capable)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo (Faster)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Budget)</option>
                  <option value="claude-3">Claude 3 (Balanced)</option>
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="ai-temp" className="settings-label">
                  Temperature ({settings?.temperature ?? 0.7})
                </label>
                <input
                  id="ai-temp"
                  type="range"
                  name="ai.temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue={settings?.temperature ?? 0.7}
                  className="form-range"
                />
                <p className="form-text">
                  Lower = more focused. Higher = more creative.
                </p>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="ai-tokens" className="settings-label">
                Max response tokens
              </label>
              <input
                id="ai-tokens"
                type="number"
                name="ai.maxTokens"
                className="form-control"
                min="100"
                max="8000"
                step="100"
                defaultValue={settings?.maxTokens ?? 2000}
              />
              <p className="form-text">
                Maximum length of AI responses.
              </p>
            </div>
          </div>
        )}

        <div className="settings-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save AI settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── ToggleItem ─────────────────────────────────────── */
function ToggleItem({ name, label, desc, defaultChecked }) {
  return (
    <label className="settings-toggle-item">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="form-check-input"
      />
      <span className="settings-toggle-label">
        <span className="fw-medium">{label}</span>
        <span className="text-secondary text-sm">{desc}</span>
      </span>
    </label>
  );
}