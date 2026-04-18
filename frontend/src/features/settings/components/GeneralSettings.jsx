/**
 * @component GeneralSettings
 * @description General user preferences settings including language, theme, and notifications.
 * White-heavy workspace design.
 *
 * @param {Object} props
 * @param {Object} props.preferences - User preferences data
 * @param {Function} props.onSave - Save handler
 * @param {boolean} props.saving - Loading state
 */
export function GeneralSettings({ preferences, onSave, saving }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSave({
      language: formData.get('language'),
      theme: formData.get('theme'),
      dateFormat: formData.get('dateFormat'),
      timeFormat: formData.get('timeFormat'),
      notifications: {
        email: e.target.querySelector('[name="notifications.email"]').checked,
        push: e.target.querySelector('[name="notifications.push"]').checked,
        sprintReminder: e.target.querySelector('[name="notifications.sprintReminder"]').checked,
        taskAssigned: e.target.querySelector('[name="notifications.taskAssigned"]').checked,
        mentions: e.target.querySelector('[name="notifications.mentions"]').checked,
      },
    });
  };

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Preferences</h2>
        <p className="settings-section-desc text-secondary">
          Customize how ScrumHub looks and behaves for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-field">
          <label htmlFor="pref-language" className="settings-label">
            Language
          </label>
          <select
            id="pref-language"
            name="language"
            className="form-select"
            defaultValue={preferences?.language ?? 'en'}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
            <option value="zh">中文</option>
          </select>
        </div>

        <div className="settings-field">
          <label htmlFor="pref-theme" className="settings-label">
            Theme
          </label>
          <select
            id="pref-theme"
            name="theme"
            className="form-select"
            defaultValue={preferences?.theme ?? 'light'}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System default</option>
          </select>
        </div>

        <div className="settings-row">
          <div className="settings-field">
            <label htmlFor="pref-date" className="settings-label">
              Date format
            </label>
            <select
              id="pref-date"
              name="dateFormat"
              className="form-select"
              defaultValue={preferences?.dateFormat ?? 'MM/DD/YYYY'}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="settings-field">
            <label htmlFor="pref-time" className="settings-label">
              Time format
            </label>
            <select
              id="pref-time"
              name="timeFormat"
              className="form-select"
              defaultValue={preferences?.timeFormat ?? '12h'}
            >
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-field">
          <h3 className="settings-subsection-title">Notifications</h3>
          <p className="settings-subsection-desc text-secondary mb-3">
            Choose how you want to be notified about activity.
          </p>

          <div className="settings-toggle-list">
            <label className="settings-toggle-item">
              <input
                type="checkbox"
                name="notifications.email"
                defaultChecked={preferences?.notifications?.email ?? true}
                className="form-check-input"
              />
              <span className="settings-toggle-label">
                <span className="fw-medium">Email notifications</span>
                <span className="text-secondary text-sm">Receive updates via email</span>
              </span>
            </label>

            <label className="settings-toggle-item">
              <input
                type="checkbox"
                name="notifications.push"
                defaultChecked={preferences?.notifications?.push ?? false}
                className="form-check-input"
              />
              <span className="settings-toggle-label">
                <span className="fw-medium">Push notifications</span>
                <span className="text-secondary text-sm">Browser push notifications</span>
              </span>
            </label>

            <label className="settings-toggle-item">
              <input
                type="checkbox"
                name="notifications.sprintReminder"
                defaultChecked={preferences?.notifications?.sprintReminder ?? true}
                className="form-check-input"
              />
              <span className="settings-toggle-label">
                <span className="fw-medium">Sprint reminders</span>
                <span className="text-secondary text-sm">Reminder before sprint ceremonies</span>
              </span>
            </label>

            <label className="settings-toggle-item">
              <input
                type="checkbox"
                name="notifications.taskAssigned"
                defaultChecked={preferences?.notifications?.taskAssigned ?? true}
                className="form-check-input"
              />
              <span className="settings-toggle-label">
                <span className="fw-medium">Task assignments</span>
                <span className="text-secondary text-sm">When someone assigns you a task</span>
              </span>
            </label>

            <label className="settings-toggle-item">
              <input
                type="checkbox"
                name="notifications.mentions"
                defaultChecked={preferences?.notifications?.mentions ?? true}
                className="form-check-input"
              />
              <span className="settings-toggle-label">
                <span className="fw-medium">Mentions</span>
                <span className="text-secondary text-sm">When someone mentions you in chat</span>
              </span>
            </label>
          </div>
        </div>

        <div className="settings-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}