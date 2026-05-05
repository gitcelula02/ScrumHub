import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * @component AppShell
 * Main layout container that integrates Sidebar, TopBar and Content area.
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar Placeholder */}
      <div className="hidden md:flex w-64 bg-sidebar-bg border-r border-border flex-col">
        <div className="p-4 font-bold border-b border-border">ScrumHub</div>
        <div className="flex-1 overflow-y-auto p-2">
          {/* Sidebar content will go here */}
          <nav className="space-y-1">
            <div className="px-3 py-2 text-sm text-muted-foreground uppercase font-semibold">Backlog</div>
            <div className="px-3 py-2 text-sm text-muted-foreground uppercase font-semibold">Board</div>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar Placeholder */}
        <header className="h-12 border-b border-border bg-titlebar flex items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Project Name</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-xs">
              JD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-editor">
          {children}
        </main>
      </div>
    </div>
  );
};
