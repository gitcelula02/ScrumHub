import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar }  from './TopBar';

/**
 * @component AppShell
 * @description Authenticated layout wrapper. Composes Sidebar + TopBar
 * around any child route via React Router's <Outlet />.
 *
 * Manages the sidebar collapsed state so both Sidebar and TopBar
 * can respond to the same toggle action.
 *
 * RESPONSIVE:
 * On mobile (<768px) the sidebar can be toggled via the TopBar hamburger button.
 */
export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = useCallback(() => setCollapsed(c => !c), []);

  return (
    <div className={`app-shell ${collapsed ? 'app-shell--sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={toggle} />

      <div className="app-main">
        <TopBar onSidebarToggle={toggle} />
        <main className="app-content" id="main-content" aria-label="Page content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
