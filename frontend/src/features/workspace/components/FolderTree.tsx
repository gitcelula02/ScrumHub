/**
 * @component FolderTree
 * Recursive tree renderer for folders and projects.
 * Passes folder selection and expand state to each FolderNode.
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
  onSelectFolder?: (folder: FolderTreeNode) => void;
  selectedProjectId?: string | null;
  selectedFolderId?: string | null;
}

function FolderTreeComponent({
  folders = [],
  level = 0,
  viewSize,
  expandedFolderIds,
  onToggleFolder,
  onSelectFolder,
  selectedProjectId,
  selectedFolderId,
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
          isFolderSelected={folder.id === selectedFolderId}
          onToggle={onToggleFolder}
          onSelectFolder={onSelectFolder}
          selectedProjectId={selectedProjectId}
          selectedFolderId={selectedFolderId}
          canCreateSubfolder={level < 4}
        />
      ))}
    </div>
  );
}

export const FolderTree = memo(FolderTreeComponent);
