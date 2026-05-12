/**
 * @hook useExplorerNavigation
 * Manages folder selection state, breadcrumb path, and main panel view state.
 * Extends useExplorerState with navigation-specific state.
 */
import { useState, useCallback, useEffect } from "react";
import { useExplorerState } from "./useExplorerState";
import { useExplorerProjects } from "./useExplorerProjects";
import type { FolderTreeNode, ViewSize } from "../types/explorerTypes";

export type MainPanelState = "home" | "folder";

export interface UseExplorerNavigationResult {
  selectedFolderId: string | null;
  breadcrumbPath: FolderTreeNode[];
  mainPanelState: MainPanelState;
  selectFolder: (folder: FolderTreeNode, path: FolderTreeNode[]) => void;
  goHome: () => void;
  viewSize: ViewSize;
  setViewSize: (size: ViewSize) => void;
}

function findFolderPath(
  folders: FolderTreeNode[],
  targetId: string,
  path: FolderTreeNode[] = [],
): FolderTreeNode[] | null {
  for (const folder of folders) {
    const currentPath = [...path, folder];
    if (folder.id === targetId) return currentPath;
    if (folder.children.length > 0) {
      const found = findFolderPath(folder.children, targetId, currentPath);
      if (found) return found;
    }
  }
  return null;
}

export function useExplorerNavigation(): UseExplorerNavigationResult {
  const { state, setActiveFolder, setViewSize: persistViewSize } = useExplorerState();
  const { folderTree } = useExplorerProjects();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    state.active_folder_id,
  );
  const [breadcrumbPath, setBreadcrumbPath] = useState<FolderTreeNode[]>([]);

  const mainPanelState: MainPanelState = selectedFolderId ? "folder" : "home";

  const selectFolder = useCallback(
    (folder: FolderTreeNode, path: FolderTreeNode[]) => {
      setSelectedFolderId(folder.id);
      setActiveFolder(folder.id);
      setBreadcrumbPath(path);
    },
    [setActiveFolder],
  );

  const goHome = useCallback(() => {
    setSelectedFolderId(null);
    setActiveFolder(null);
    setBreadcrumbPath([]);
  }, [setActiveFolder]);

  const viewSize = state.view_size;

  const setViewSize = useCallback(
    (size: ViewSize) => {
      persistViewSize(size);
    },
    [persistViewSize],
  );

  /** Recompute breadcrumb when folderTree loads and user had a saved active folder */
  useEffect(() => {
    if (folderTree?.data && selectedFolderId) {
      const path = findFolderPath(folderTree.data, selectedFolderId);
      if (path) setBreadcrumbPath(path);
    }
  }, [folderTree, selectedFolderId]);

  return {
    selectedFolderId,
    breadcrumbPath,
    mainPanelState,
    selectFolder,
    goHome,
    viewSize,
    setViewSize,
  };
}
