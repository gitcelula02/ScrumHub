import { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

/**
 * @component AppShell
 * @description Authenticated layout wrapper. Composes Sidebar + TopBar
 * around any child route via React Router's <Outlet />.
 *
 * Manages the sidebar collapsed state so both Sidebar and TopBar
 * can respond to the same toggle action.
 *
 * AUTH GUARD:
 * Redirects to /login if user is not authenticated (after auth loading completes).
 *
 * RESPONSIVE:
 * On mobile (<768px) the sidebar can be toggled via the TopBar hamburger button.
 */
export function AppShell() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const toggle = useCallback(() => setCollapsed(c => !c), []);

  if (authLoading) {
    return (
      <div className="app-shell">
        <div className="d-flex align-items-center justify-content-center w-100 h-100">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (!user) return null;

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
