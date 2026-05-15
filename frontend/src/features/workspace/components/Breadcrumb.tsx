/**
 * @component Breadcrumb
 * Clickable folder path navigation bar in the explorer sidebar header.
 * Each segment navigates to that folder level. Home returns to Welcome view.
 *
 * COLOR CONTRACT:
 * - Consumes no entity colors (neutral UI)
 */
import { memo } from "react";
import { ChevronRight, Home } from "lucide-react";
import type { FolderTreeNode } from "../types/explorerTypes";

interface BreadcrumbProps {
  path: FolderTreeNode[];
  onNavigate: (folder: FolderTreeNode | null) => void;
}

function BreadcrumbComponent({ path, onNavigate }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1 overflow-x-auto text-[11px] text-muted-foreground border-b border-panel-border shrink-0">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-list-hover hover:text-sidebar-fg transition-colors shrink-0"
        title="Home"
      >
        <Home size={12} />
      </button>
      {path.map((folder, index) => (
        <div key={folder.id} className="flex items-center gap-0.5 shrink-0">
          <ChevronRight size={10} className="text-muted-foreground/50" />
          <button
            onClick={() => onNavigate(folder)}
            className={`px-1 py-0.5 rounded hover:bg-list-hover transition-colors truncate max-w-[120px] ${
              index === path.length - 1
                ? "text-sidebar-fg font-medium"
                : "hover:text-sidebar-fg"
            }`}
          >
            {folder.name}
          </button>
        </div>
      ))}
    </div>
  );
}

export const Breadcrumb = memo(BreadcrumbComponent);
