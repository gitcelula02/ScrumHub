/**
 * @component FolderTree
 * Recursive tree renderer for folders and projects.
 *
 * COLOR CONTRACT:
 * - Consumes no entity colors (uses neutral sidebar colors)
 */

import { memo } from "react";
import type { FolderTreeNode, ViewSize } from "../types/explorerTypes";
import { FolderNode } from "./FolderNode";

interface FolderTreeProps {
  folders?: FolderTreeNode[];
  level?: number;
  viewSize: ViewSize;
  expandedFolderIds: string[];
  onToggleFolder: (folderId: string) => void;
  selectedProjectId?: string | null;
}

function FolderTreeComponent({
  folders = [],
  level = 0,
  viewSize,
  expandedFolderIds,
  onToggleFolder,
  selectedProjectId,
}: FolderTreeProps) {
  return (
    <div className="text-[13px] text-sidebar-fg">
      {folders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          level={level}
          viewSize={viewSize}
          isExpanded={expandedFolderIds.includes(folder.id)}
          onToggle={onToggleFolder}
          selectedProjectId={selectedProjectId}
          canCreateSubfolder={level < 4}
        />
      ))}
    </div>
  );
}

export const FolderTree = memo(FolderTreeComponent);