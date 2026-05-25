/**
 * @component ExplorerSidebar
 * Main resizable left panel for the Project Explorer.
 * Contains breadcrumb, search bar, action buttons, pinned projects, and folder tree.
 *
 * COLOR CONTRACT:
 * - Consumes no entity colors (uses neutral sidebar colors)
 */

import { memo, useState } from "react";
import { Plus, FolderPlus, Download } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useExplorerState } from "../hooks/useExplorerState";
import { useExplorerProjects, usePinnedProjects } from "../hooks/useExplorerProjects";
import { useExplorerSearch } from "../hooks/useExplorerSearch";
import { explorerService } from "../services/explorerService";
import { SearchBar } from "./SearchBar";
import { Breadcrumb } from "./Breadcrumb";
import { PinnedProjects } from "./PinnedProjects";
import { FolderTree } from "./FolderTree";
import { CreateFolderModal } from "./CreateFolderModal";
import type { FolderTreeNode } from "../types/explorerTypes";

interface ExplorerSidebarProps {
  onProjectSelect?: (projectId: string) => void;
  breadcrumbPath: FolderTreeNode[];
  selectedFolderId: string | null;
  onBreadcrumbNavigate: (folder: FolderTreeNode | null) => void;
  onFolderSelect: (folder: FolderTreeNode) => void;
}

function ExplorerSidebarComponent({
  onProjectSelect,
  breadcrumbPath,
  selectedFolderId,
  onBreadcrumbNavigate,
  onFolderSelect,
}: ExplorerSidebarProps) {
  const { state, toggleFolder } = useExplorerState();
  const { folderTree, isLoading: treeLoading } = useExplorerProjects();
  const { data: pinnedData } = usePinnedProjects();
  const navigate = useNavigate();
  const { query, setQuery } = useExplorerSearch();

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  const isLoading = treeLoading;

  const handleAiCommand = async () => {
    if (!query.trim()) return;
    try {
      const result = await explorerService.aiCommand(query);
      if (result.success) {
        setQuery("");
        setSearchMode(false);
      }
    } catch (err) {
      console.error("AI command failed:", err);
    }
  };

  const handleFolderSelect = (folder: FolderTreeNode) => {
    onFolderSelect(folder);
    if (!state.expanded_folder_ids.includes(folder.id)) {
      toggleFolder(folder.id);
    }
  };

  return (
    <aside className="h-full w-full bg-sidebar-bg border-r border-panel-border flex flex-col select-none shrink-0 flex-1">
      {/* Header */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-panel-border shrink-0">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Explorer
        </span>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb
        path={breadcrumbPath}
        onNavigate={onBreadcrumbNavigate}
      />

      {/* Search Bar */}
      <SearchBar
        value={query}
        onChange={setQuery}
        onAiCommand={handleAiCommand}
      />

      {/* Action Buttons */}
      <div className="px-2 py-1.5 flex items-center gap-1 border-b border-panel-border shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[11px] gap-1 flex-1"
          onClick={() => navigate({ to: "/app/projects/create", search: { folderId: selectedFolderId || undefined } })}
        >
          <Plus size={12} />
          <span>Project</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[11px] gap-1 flex-1"
          onClick={() => setShowCreateFolder(true)}
        >
          <FolderPlus size={12} />
          <span>Folder</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[11px] gap-1"
          title="Import (coming soon)"
          disabled
        >
          <Download size={12} />
          <span className="hidden sm:inline">Import</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : folderTree ? (
          <>
            <PinnedProjects
              projects={pinnedData?.pinned}
              viewSize={state.view_size}
              selectedProjectId={selectedFolderId}
            />
            <FolderTree
              folders={folderTree.data}
              level={0}
              viewSize={state.view_size}
              expandedFolderIds={state.expanded_folder_ids}
              onToggleFolder={toggleFolder}
              onSelectFolder={handleFolderSelect}
              selectedFolderId={selectedFolderId}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-20 text-muted-foreground text-sm gap-2">
            <span>No projects yet</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/app/projects/create", search: { folderId: selectedFolderId || undefined } })}
            >
              Create your first project
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
      />
    </aside>
  );
}

export const ExplorerSidebar = memo(ExplorerSidebarComponent);
