import { useState } from 'react';
import { useParams } from 'react-router-dom';

/**
 * @component SettingsLayout
 * @description Workspace-like settings layout with white-heavy design.
 * Uses sober, structured, sophisticated aesthetic per BRAND_CONTEXT.md.
 * Layout: Sidebar navigation on left, content area on right.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Active settings section content
 */
export function SettingsLayout({ children }) {
  const { projectId } = useParams();
  const [activeSection, setActiveSection] = useState('profile');

  const isProjectContext = !!projectId;

  const sections = isProjectContext
    ? [
        { id: 'profile', label: 'Project Settings', icon: '◈', description: 'Project name, description, color' },
        { id: 'members', label: 'Members', icon: '◉', description: 'Manage team members and roles' },
        { id: 'ai', label: 'AI Configuration', icon: '✦', description: 'Project AI skills and context' },
        { id: 'notifications', label: 'Notifications', icon: '◻', description: 'Project notification preferences' },
      ]
    : [
        { id: 'profile', label: 'Profile', icon: '◈', description: 'Your name, email, and role' },
        { id: 'preferences', label: 'Preferences', icon: '◻', description: 'Language, theme, and display' },
        { id: 'notifications', label: 'Notifications', icon: '◉', description: 'Email and push notifications' },
        { id: 'ai', label: 'AI Settings', icon: '✦', description: 'Global AI skills and permissions' },
      ];

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    if (typeof children === 'function') {
      children(sectionId);
    }
  };

  return (
    <div className="settings-shell">
      {/* Sidebar navigation */}
      <nav className="settings-nav" aria-label="Settings navigation">
        <div className="settings-nav-header">
          <h1 className="settings-nav-title">
            {isProjectContext ? 'Project Settings' : 'Settings'}
          </h1>
        </div>

        <div className="settings-nav-list">
          {sections.map(section => (
            <button
              key={section.id}
              className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => handleSectionChange(section.id)}
              aria-current={activeSection === section.id ? 'page' : undefined}
              title={section.description}
            >
              <span className="settings-nav-icon" aria-hidden="true">{section.icon}</span>
              <span className="settings-nav-label">{section.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-nav-footer">
          <p className="settings-nav-version text-xs text-secondary">
            ScrumHub v1.0.0
          </p>
        </div>
      </nav>

      {/* Content area */}
      <main className="settings-content" id="main-content" aria-label="Settings content">
        {typeof children === 'function' ? children(activeSection) : children}
      </main>
    </div>
  );
}