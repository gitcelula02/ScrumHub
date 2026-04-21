import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';

/**
 * @component UserProfileSettings
 * @description User profile settings form with Scrum role selection.
 * White-heavy workspace design.
 *
 * @param {Object} props
 * @param {Object} props.profile - User profile data
 * @param {Function} props.onSave - Save handler
 * @param {boolean} props.saving - Loading state
 */
export function UserProfileSettings({ profile, onSave, saving }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SCRUM_ROLES = [
    { value: 'scrum_master', label: 'Scrum Master' },
    { value: 'product_owner', label: 'Product Owner' },
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'qa_engineer', label: 'QA Engineer' },
    { value: 'devops', label: 'DevOps Engineer' },
    { value: 'stakeholder', label: 'Stakeholder' },
    { value: 'observer', label: 'Observer' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSave({
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      title: formData.get('title'),
      timezone: formData.get('timezone'),
    });
  };

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Profile</h2>
        <p className="settings-section-desc text-secondary">
          Your personal information and Scrum role.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-field">
          <label htmlFor="profile-name" className="settings-label">
            Full name
          </label>
          <input
            id="profile-name"
            type="text"
            name="name"
            className="form-control"
            defaultValue={profile?.name ?? ''}
            required
          />
        </div>

        <div className="settings-field">
          <label htmlFor="profile-email" className="settings-label">
            Email address
          </label>
          <input
            id="profile-email"
            type="email"
            name="email"
            className="form-control"
            defaultValue={profile?.email ?? ''}
            required
          />
        </div>

        <div className="settings-field">
          <label htmlFor="profile-title" className="settings-label">
            Job title
          </label>
          <input
            id="profile-title"
            type="text"
            name="title"
            className="form-control"
            placeholder="e.g. Senior Developer"
            defaultValue={profile?.title ?? ''}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="profile-role" className="settings-label">
            Scrum role <span className="text-danger">*</span>
          </label>
          <select
            id="profile-role"
            name="role"
            className="form-select"
            defaultValue={profile?.role ?? ''}
            required
          >
            <option value="" disabled>Select your role</option>
            {SCRUM_ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <p className="form-text">
            Your Scrum role determines your permissions in projects.
          </p>
        </div>

        <div className="settings-field">
          <label htmlFor="profile-timezone" className="settings-label">
            Timezone
          </label>
          <select
            id="profile-timezone"
            name="timezone"
            className="form-select"
            defaultValue={profile?.timezone ?? 'America/New_York'}
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Central European (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
          </select>
        </div>

        <div className="settings-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>

      <div className="settings-form mt-4">
        <div className="settings-section-header">
          <h3 className="settings-subsection-title">Account</h3>
          <p className="settings-section-desc text-secondary">
            Manage your account session.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}