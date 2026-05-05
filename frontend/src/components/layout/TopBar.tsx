import React from 'react';

/**
 * @component TopBar
 * Global top bar for context and user profile.
 */
export const TopBar: React.FC = () => {
  return (
    <header className="h-12 border-b border-border bg-titlebar flex items-center px-4 justify-between">
      <div className="text-sm font-medium">ScrumHub / Project</div>
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs">U</div>
      </div>
    </header>
  );
};
