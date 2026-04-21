import { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileMenu } from './MobileMenu';
import { AIAssistantButton } from '@/components/AIAssistantButton';

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
 * - Desktop (>=768px): Shows sidebar + main content
 * - Mobile (<768px): Hides sidebar, shows hamburger in TopBar,
 *   opens full-screen MobileMenu overlay
 */
export function AppShell() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const toggleSidebar = useCallback(() => setSidebarCollapsed(c => !c), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen(o => !o), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

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
    <>
      <div className={`app-shell ${sidebarCollapsed ? 'app-shell--sidebar-collapsed' : ''}`}>
        {/* Sidebar only visible on desktop */}
        <div className="d-none d-md-flex">
          <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </div>

<div className="app-main">
        <TopBar
          onSidebarToggle={toggleMobileMenu}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarCollapse={toggleSidebar}
        />
        <main className="app-content" id="main-content" aria-label="Page content">
          <Outlet />
        </main>
      </div>
      </div>

      {/* Mobile menu overlay */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />

      {/* AI Assistant button - always visible */}
      <AIAssistantButton />
    </>
  );
}
