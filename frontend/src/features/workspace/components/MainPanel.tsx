/**
 * @component MainPanel
 * Two-state container for the main content area.
 * State "home": Shows WelcomePanel with pinned and recent projects.
 * State "folder": Shows FolderGrid with selected folder contents.
 *
 * COLOR CONTRACT:
 * - Delegates entity colors to child components
 */

import { memo } from "react";
import { WelcomePanel } from "./WelcomePanel";
import { FolderGrid } from "./FolderGrid";
import type { FolderTreeNode, ExplorerProject, ViewSize } from "../types/explorerTypes";

interface MainPanelProps {
  state: "home" | "folder";
  pinnedProjects: ExplorerProject[];
  recentProjects: ExplorerProject[];
  selectedFolder: FolderTreeNode | null;
  viewSize: ViewSize;
  onViewSizeChange: (size: ViewSize) => void;
  onSubfolderClick?: (folder: FolderTreeNode) => void;
}

function MainPanelComponent({
  state,
  pinnedProjects,
  recentProjects,
  selectedFolder,
  viewSize,
  onViewSizeChange,
  onSubfolderClick,
}: MainPanelProps) {
  if (state === "folder" && selectedFolder) {
    return (
      <FolderGrid
        folder={selectedFolder}
        viewSize={viewSize}
        onViewSizeChange={onViewSizeChange}
        onSubfolderClick={onSubfolderClick}
      />
    );
  }

  return (
    <WelcomePanel
      pinnedProjects={pinnedProjects}
      recentProjects={recentProjects}
    />
  );
}

export const MainPanel = memo(MainPanelComponent);
