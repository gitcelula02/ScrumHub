import { Outlet } from 'react-router-dom';

/**
 * @component AppShell
 * @description Authenticated layout wrapper. Renders the Sidebar and TopBar
 * around any child route via React Router's <Outlet />.
 *
 * All authenticated pages are children of this component in App.jsx.
 * It never fetches data — layout only.
 *
 * RESPONSIVE:
 * On mobile (<768px) the sidebar collapses to a bottom nav.
 * Add a useSidebarToggle hook here when implementing mobile support.
 */
export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="p-3 border-bottom d-flex align-items-center gap-2">
          <span style={{
            width: '24px', height: '24px', borderRadius: 'var(--radius-sm)',
            background: 'var(--color-brand-500)', display: 'inline-block',
          }} />
          <span className="fw-medium text-sm">ScrumHub</span>
        </div>
        <nav className="p-2 flex-grow-1">
          {/* Sidebar nav items — replace with SidebarNav feature component */}
          <p className="text-xs text-secondary px-2 mt-3 mb-1">Projects</p>
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <span className="text-sm text-secondary ms-auto">User menu</span>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
