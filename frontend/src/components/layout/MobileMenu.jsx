import { useCallback } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useEntityTheme } from '@/hooks/useEntityTheme';

/**
 * @component MobileMenu
 * @description Full-screen overlay menu for mobile navigation.
 * Replaces the sidebar on screens < 768px.
 *
 * @param {boolean} isOpen - Whether the menu is visible
 * @param {Function} onClose - Callback to close the menu
 */
export function MobileMenu({ isOpen, onClose }) {
  const { logout } = useAuth();
  const { projects } = useProjects();
  const { projectId } = useParams();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await logout();
    onClose();
    navigate('/');
  }, [logout, navigate, onClose]);

  const handleNavigate = useCallback((path) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="mobile-menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div className="mobile-menu-header">
        <button
          className="mobile-menu-close"
          onClick={onClose}
          title="Close menu"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <nav className="mobile-menu-nav" aria-label="Mobile navigation">
        <div className="mobile-menu-section">
          <button
            className="mobile-menu-item mobile-menu-item--home"
            onClick={() => handleNavigate('/projects')}
            title="Your Projects"
          >
            <span className="mobile-menu-icon" aria-hidden="true">◈</span>
            Your Projects
          </button>
        </div>

        <div className="mobile-menu-section">
          <div className="mobile-menu-section-label">Projects</div>
          {projects.map(project => (
            <MobileProjectItem
              key={project.id}
              project={project}
              isActive={project.id === projectId}
              onSelect={() => handleNavigate(`/projects/${project.id}`)}
            />
          ))}
        </div>

        {projectId && (
          <div className="mobile-menu-section">
            <div className="mobile-menu-section-label">Views</div>
            {[
              { label: 'Overview', path: `/projects/${projectId}`, icon: '◈' },
              { label: 'Backlog', path: `/projects/${projectId}/backlog`, icon: '≡' },
              { label: 'Board', path: `/projects/${projectId}/board`, icon: '⊞' },
              { label: 'Sprints', path: `/projects/${projectId}/sprints`, icon: '▷' },
              { label: 'Calendar', path: `/projects/${projectId}/calendar`, icon: '◻' },
              { label: 'Workspace', path: `/projects/${projectId}/workspace`, icon: '◇' },
              { label: 'Chat', path: `/projects/${projectId}/chat`, icon: '◉' },
            ].map(view => (
              <NavLink
                key={view.path}
                to={view.path}
                end={view.path === `/projects/${projectId}`}
                className={({ isActive }) =>
                  `mobile-menu-item ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
                title={view.label}
              >
                <span className="mobile-menu-icon" aria-hidden="true">{view.icon}</span>
                {view.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="mobile-menu-footer">
        <button
          className="mobile-menu-item mobile-menu-item--logout"
          onClick={handleLogout}
          title="Sign out"
        >
          <span className="mobile-menu-icon" aria-hidden="true">↩</span>
          Sign out
        </button>
      </div>
    </div>
  );
}

/* ── MobileProjectItem ──────────────────────────────────────────────── */
function MobileProjectItem({ project, isActive, onSelect }) {
  const theme = useEntityTheme(project.color);

  return (
    <button
      className={`mobile-menu-item ${isActive ? 'active' : ''}`}
      onClick={onSelect}
      title={project.name}
      style={isActive ? theme : {}}
    >
      <span
        className="mobile-project-dot"
        style={{ background: project.color || 'var(--color-brand-500)' }}
        aria-hidden="true"
      />
      <span className="truncate">{project.name}</span>
    </button>
  );
}