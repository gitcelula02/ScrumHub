import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';

/**
 * @component TopBar
 * @description Fixed top header showing breadcrumb path and user actions.
 * On mobile, shows hamburger menu button instead of sidebar toggle.
 *
 * @param {{ onSidebarToggle?: Function }} props
 */
export function TopBar({ onSidebarToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className="app-topbar"
      role="banner"
      aria-label="Top navigation bar"
    >
      {/* Mobile hamburger menu button - always visible on mobile */}
      <button
        className="topbar-menu-btn"
        onClick={onSidebarToggle}
        title="Open navigation menu"
        aria-label="Open navigation menu"
      >
        ☰
      </button>

      {/* Right actions */}
      <div className="topbar-actions" aria-label="User actions">
        {user && (
          <button
            className="topbar-user-btn"
            onClick={handleLogout}
            title={`Signed in as ${user?.name ?? user?.email} — click to sign out`}
            aria-label="User menu — sign out"
          >
            <div className="topbar-avatar" aria-hidden="true">
              {(user?.name ?? user?.email ?? 'U')[0].toUpperCase()}
            </div>
            <span className="text-sm fw-medium d-none d-sm-inline">
              {user?.name ?? user?.email}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
