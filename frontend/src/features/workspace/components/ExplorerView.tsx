/**
 * @component ExplorerView
 * Main project explorer view that combines sidebar, breadcrumb, and main panel.
 * This is a GENERAL VIEW - no AppShell, no ActivityBar, standalone page.
 *
 * Main panel has two states:
 * - "home": WelcomePanel with pinned/recent projects (default)
 * - "folder": FolderGrid showing folder contents (when a folder is selected)
 *
 * Uses ResizablePanelGroup for VS Code-style drag handle resizing (260-320px range).
 */
import { useMemo } from "react";
import { ExplorerSidebar } from "./ExplorerSidebar";
import { MainPanel } from "./MainPanel";
import { useExplorerProjects, usePinnedProjects } from "../hooks/useExplorerProjects";
import { useExplorerState } from "../hooks/useExplorerState";
import { useExplorerNavigation } from "../hooks/useExplorerNavigation";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import type { FolderTreeNode } from "../types/explorerTypes";

export function ExplorerView() {
  const { folderTree } = useExplorerProjects();
  const { data: pinnedData } = usePinnedProjects();
  const { state } = useExplorerState();
  const {
    selectedFolderId,
    breadcrumbPath,
    mainPanelState,
    selectFolder,
    goHome,
    viewSize,
    setViewSize,
  } = useExplorerNavigation();

  const pinnedProjects = useMemo(() => {
    return pinnedData?.pinned ?? [];
  }, [pinnedData]);

  const recentProjects = useMemo(() => {
    if (!state.last_opened_project_id || !folderTree) return [];
    const lastId = state.last_opened_project_id;
    const allProjects = folderTree.data.flatMap((f) => f.projects ?? []);
    const lastProject = allProjects.find((p) => p.id === lastId);
    return lastProject ? [lastProject] : [];
  }, [state.last_opened_project_id, folderTree]);

  const selectedFolder = useMemo(() => {
    if (!selectedFolderId || !folderTree) return null;
    const findFolder = (f: FolderTreeNode[]): FolderTreeNode | null => {
      for (const node of f) {
        if (node.id === selectedFolderId) return node;
        const found = findFolder(node.children ?? []);
        if (found) return found;
      }
      return null;
    };
    return findFolder(folderTree.data);
  }, [selectedFolderId, folderTree]);

  const handleFolderSelect = (folder: FolderTreeNode) => {
    selectFolder(folder, []);
  };

  const handleBreadcrumbNavigate = (folder: FolderTreeNode | null) => {
    if (!folder) {
      goHome();
    } else {
      selectFolder(folder, []);
    }
  };

  const handleSubfolderClick = (folder: FolderTreeNode) => {
    selectFolder(folder, []);
  };

  return (
    <div className="flex h-screen w-full bg-editor">
      <ResizablePanelGroup direction="horizontal" className="w-full h-full">
        <ResizablePanel defaultSize={25} className="h-full shrink-0">
          <ExplorerSidebar
            breadcrumbPath={breadcrumbPath}
            selectedFolderId={selectedFolderId}
            onBreadcrumbNavigate={handleBreadcrumbNavigate}
            onFolderSelect={handleFolderSelect}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} className="h-full flex-1">
          <MainPanel
            state={mainPanelState}
            pinnedProjects={pinnedProjects}
            recentProjects={recentProjects}
            selectedFolder={selectedFolder}
            viewSize={viewSize}
            onViewSizeChange={setViewSize}
            onSubfolderClick={handleSubfolderClick}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
