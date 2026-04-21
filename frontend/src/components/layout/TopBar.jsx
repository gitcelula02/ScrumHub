import { useState } from 'react';

/**
 * @component TopBar
 * @description Fixed top header with search bar.
 * Dark background to match sidebar, search bar centered.
 *
 * @param {{ onSidebarToggle?: Function, sidebarCollapsed?: boolean, onSidebarCollapse?: Function }} props
 */
export function TopBar({ onSidebarToggle, sidebarCollapsed = false, onSidebarCollapse }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.info('[Search] Query:', searchQuery);
  };

  return (
    <header
      className="app-topbar"
      role="banner"
      aria-label="Top navigation bar"
    >
      {/* Mobile hamburger menu button - only visible on mobile */}
      <button
        className="topbar-menu-btn d-md-none"
        onClick={onSidebarToggle}
        title="Open navigation menu"
        aria-label="Open navigation menu"
      >
        ☰
      </button>

      {/* Desktop sidebar toggle - visible on tablet and up */}
      {onSidebarCollapse && (
        <button
          className="topbar-sidebar-toggle d-none d-md-flex"
          onClick={onSidebarCollapse}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? '☰' : '‹'}
        </button>
      )}

      {/* Search bar - centered */}
      <form className="topbar-search" onSubmit={handleSearch} role="search">
        <span className="topbar-search-icon" aria-hidden="true">🔍</span>
        <input
          type="search"
          className="topbar-search-input"
          placeholder="Search tasks, epics, projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search"
          title="Search"
        />
      </form>

      {/* Right actions - placeholder for future use */}
      <div className="topbar-actions" aria-label="Quick actions">
        <button
          className="topbar-icon-btn"
          title="Notifications"
          aria-label="Notifications"
          onClick={() => {/* TODO: notifications */}}
        >
          🔔
        </button>
      </div>
    </header>
  );
}
