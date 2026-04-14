import { useState, useCallback } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useEntityTheme } from '@/hooks/useEntityTheme';

/**
 * @component Sidebar
 * @description Primary application sidebar with project navigation tree.
 * Renders a folder/project list where each project expands to show its views.
 *
 * COLOR CONTRACT:
 * Each project node uses useEntityTheme scoped to the nav item dot indicator.
 * Active nav links use Bootstrap's .active class + brand accent.
 *
 * @param {{ collapsed: boolean, onToggle: Function }} props
 */
export function Sidebar({ collapsed, onToggle }) {
  const { user, logout }        = useAuth();
  const { projects, loading }   = useProjects();
  const { projectId }           = useParams();
  const navigate                = useNavigate();
  const [expanded, setExpanded] = useState({});

  const toggleProject = useCallback((id) => {
    setExpanded(s => ({ ...s, [id]: !s[id] }));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside
      className={`app-sidebar ${collapsed ? 'app-sidebar--collapsed' : ''}`}
      aria-label="Application sidebar"
      title="Navigation sidebar"
    >
      {/* Brand header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-mark" aria-hidden="true" />
        {!collapsed && <span className="sidebar-logo-text">ScrumHub</span>}
        <button
          className="sidebar-collapse-btn ms-auto"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav flex-grow-1" aria-label="Project navigation">
        {!collapsed && (
          <div className="sidebar-section-label" title="Your projects">Projects</div>
        )}

        {loading && (
          <div className="px-3 py-2">
            {[1,2,3].map(i => (
              <div key={i} className="placeholder-glow mb-2">
                <span className="placeholder col-10 rounded" style={{ height: '28px' }} />
              </div>
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && !collapsed && (
          <div className="px-3 py-2 text-xs text-secondary">No projects yet</div>
        )}

        {projects.map(project => (
          <ProjectNavItem
            key={project.id}
            project={project}
            activeProjectId={projectId}
            expanded={!!expanded[project.id]}
            collapsed={collapsed}
            onToggle={() => toggleProject(project.id)}
          />
        ))}

        <button
          className="sidebar-add-btn"
          title="Create a new project"
          aria-label="Create new project"
          onClick={() => {/* TODO: open new project modal */}}
        >
          <span aria-hidden="true">+</span>
          {!collapsed && <span className="text-xs">New project</span>}
        </button>
      </nav>

      {/* Bottom user zone */}
      <div className="sidebar-footer" aria-label="User menu area">
        {!collapsed && user && (
          <div className="sidebar-user" title={`Signed in as ${user?.name ?? user?.email}`}>
            <div className="sidebar-user-avatar" aria-hidden="true">
              {(user?.name ?? user?.email ?? 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs fw-medium mb-0 truncate">{user?.name ?? 'User'}</p>
              <p className="text-xs text-secondary mb-0 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <div className="d-flex gap-1 px-2 pb-1">
          <button
            className="sidebar-icon-btn flex-grow-1"
            title="Settings"
            aria-label="Open settings"
            onClick={() => {/* TODO: settings */}}
          >
            ⚙
          </button>
          <button
            className="sidebar-icon-btn flex-grow-1"
            onClick={handleLogout}
            title="Sign out of ScrumHub"
            aria-label="Sign out"
          >
            ↩
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── ProjectNavItem ──────────────────────────────────────────────── */
function ProjectNavItem({ project, activeProjectId, expanded, collapsed, onToggle }) {
  const theme = useEntityTheme(project.color);
  const isActive = project.id === activeProjectId;

  const views = [
    { label: 'Overview',  path: `/projects/${project.id}`,          icon: '◈' },
    { label: 'Backlog',   path: `/projects/${project.id}/backlog`,   icon: '≡' },
    { label: 'Board',     path: `/projects/${project.id}/board`,     icon: '⊞' },
    { label: 'Sprints',   path: `/projects/${project.id}/sprints`,   icon: '▷' },
    { label: 'Calendar',  path: `/projects/${project.id}/calendar`,  icon: '◻' },
    { label: 'Chat',      path: `/projects/${project.id}/chat`,      icon: '◉' },
  ];

  return (
    <div className="sidebar-project-group">
      <button
        className={`sidebar-project-btn ${isActive ? 'active' : ''}`}
        onClick={onToggle}
        title={`${project.name} — click to expand`}
        aria-label={`${project.name} project`}
        aria-expanded={expanded}
        style={isActive ? theme : {}}
      >
        {/* Color dot */}
        <span
          className="sidebar-project-dot"
          style={{ '--entity-solid': project.color ?? 'var(--color-brand-500)', ...theme }}
          aria-hidden="true"
        />
        {!collapsed && (
          <>
            <span className="truncate text-sm flex-grow-1 text-start">{project.name}</span>
            <span
              className="sidebar-chevron"
              aria-hidden="true"
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >›</span>
          </>
        )}
      </button>

      {/* Sub-nav — hidden when collapsed or closed */}
      {expanded && !collapsed && (
        <div className="sidebar-subnav" role="navigation" aria-label={`${project.name} views`}>
          {views.map(view => (
            <NavLink
              key={view.path}
              to={view.path}
              end={view.path === `/projects/${project.id}`}
              className={({ isActive }) =>
                `sidebar-subnav-link ${isActive ? 'active' : ''}`
              }
              title={`${view.label} — ${project.name}`}
              aria-label={`${view.label} for ${project.name}`}
            >
              <span className="sidebar-subnav-icon" aria-hidden="true">{view.icon}</span>
              {view.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
