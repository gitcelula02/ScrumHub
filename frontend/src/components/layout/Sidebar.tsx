import React from 'react';

/**
 * @component Sidebar
 * Primary navigation sidebar with VS Code-like aesthetics.
 */
export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-sidebar-bg border-r border-border flex flex-col h-full">
      <div className="h-12 flex items-center px-4 border-b border-border bg-titlebar font-bold">
        ScrumHub
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Navigation links will go here */}
      </div>
    </div>
  );
};
