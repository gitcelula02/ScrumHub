import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSettings } from '@/features/settings/hooks';
import { SettingsLayout, UserProfileSettings, GeneralSettings, AISettings } from '@/features/settings/components';

/**
 * @page SettingsPage
 * @route /settings (global) and /projects/:projectId/settings (project)
 * @description User settings page with profile, preferences, and AI configuration.
 * Supports both global settings and project-level settings.
 */
export default function SettingsPage() {
  const { projectId } = useParams();
  const isProjectContext = !!projectId;
  const {
    profile,
    preferences,
    aiSettings,
    projectAISettings,
    loading,
    error,
    updateProfile,
    updatePreferences,
    updateAISettings,
    updateProjectAISettings,
  } = useSettings(projectId);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const showSaveMessage = (msg) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(''), 3000);
  };

const handleSaveProfile = async (data) => {
  setSaving(true);
  try {
    await updateProfile(data);
    showSaveMessage('Profile updated successfully');
  } catch {
    showSaveMessage('Failed to update profile');
  } finally {
    setSaving(false);
  }
};

const handleSavePreferences = async (data) => {
  setSaving(true);
  try {
    await updatePreferences(data);
    showSaveMessage('Preferences saved');
  } catch {
    showSaveMessage('Failed to save preferences');
  } finally {
    setSaving(false);
  }
};

const handleSaveAISettings = async (data) => {
  setSaving(true);
  try {
    await updateAISettings(data);
    showSaveMessage('AI settings saved');
  } catch {
    showSaveMessage('Failed to save AI settings');
  } finally {
    setSaving(false);
  }
};

const handleSaveProjectAISettings = async (data) => {
  setSaving(true);
  try {
    await updateProjectAISettings(data);
    showSaveMessage('Project AI settings saved');
  } catch {
    showSaveMessage('Failed to save project AI settings');
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="settings-shell">
        <div className="settings-loading">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
          <p className="text-secondary mt-3">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-shell">
        <div className="settings-error">
          <div className="mb-3" style={{ fontSize: '2.5rem', opacity: 0.4 }} aria-hidden="true">⚠</div>
          <h3 className="h5 fw-medium mb-2">Failed to load settings</h3>
          <p className="text-secondary mb-3">{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const renderContent = (activeSection) => {
    if (isProjectContext) {
      return renderProjectContent(activeSection);
    }
    return renderGlobalContent(activeSection);
  };

  const renderGlobalContent = (activeSection) => {
    switch (activeSection) {
      case 'profile':
        return (
          <UserProfileSettings
            profile={profile}
            onSave={handleSaveProfile}
            saving={saving}
          />
        );
      case 'preferences':
      case 'notifications':
        return (
          <GeneralSettings
            preferences={preferences}
            onSave={handleSavePreferences}
            saving={saving}
          />
        );
      case 'ai':
        return (
          <AISettings
            aiSettings={aiSettings}
            onSave={handleSaveAISettings}
            saving={saving}
            isProject={false}
          />
        );
      default:
        return (
          <UserProfileSettings
            profile={profile}
            onSave={handleSaveProfile}
            saving={saving}
          />
        );
    }
  };

  const renderProjectContent = (activeSection) => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="settings-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title">Project Settings</h2>
              <p className="settings-section-desc text-secondary">
                Configure project name, description, and settings.
              </p>
            </div>
            <p className="text-secondary">Project settings form coming soon.</p>
          </div>
        );
      case 'members':
        return (
          <div className="settings-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title">Project Members</h2>
              <p className="settings-section-desc text-secondary">
                Manage team members and their roles.
              </p>
            </div>
            <p className="text-secondary">Member management coming soon.</p>
          </div>
        );
      case 'ai':
        return (
          <AISettings
            projectAISettings={projectAISettings}
            onSaveProject={handleSaveProjectAISettings}
            saving={saving}
            isProject={true}
          />
        );
      case 'notifications':
        return (
          <GeneralSettings
            preferences={preferences}
            onSave={handleSavePreferences}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SettingsLayout>
      {(activeSection) => (
        <>
          {saveMsg && (
            <div className="settings-toast" role="alert" aria-live="polite">
              {saveMsg}
            </div>
          )}
          {renderContent(activeSection)}
        </>
      )}
    </SettingsLayout>
  );
}