/**
 * @component ExplorerSidebar
 * Main resizable left panel for the Project Explorer.
 * Contains search bar, pinned projects, folder tree, and view size toggle.
 *
 * COLOR CONTRACT:
 * - Consumes no entity colors (uses neutral sidebar colors)
 */

import { memo, useState } from "react";
import { Plus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExplorerState } from "../hooks/useExplorerState";
import { useExplorerProjects, usePinnedProjects } from "../hooks/useExplorerProjects";
import { useExplorerSearch } from "../hooks/useExplorerSearch";
import { explorerService } from "../services/explorerService";
import { SearchBar } from "./SearchBar";
import { PinnedProjects } from "./PinnedProjects";
import { FolderTree } from "./FolderTree";
import { ViewSizeToggle } from "./ViewSizeToggle";
import { CreateFolderModal } from "./CreateFolderModal";
import { CreateProjectModal } from "./CreateProjectModal";

interface ExplorerSidebarProps {
  onProjectSelect?: (projectId: string) => void;
}

function ExplorerSidebarComponent({ onProjectSelect }: ExplorerSidebarProps) {
  const { state, toggleFolder, setViewSize } = useExplorerState();
  const { folderTree, isLoading: treeLoading } = useExplorerProjects();
  const { data: pinnedData } = usePinnedProjects();
  const { query, setQuery } = useExplorerSearch();

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
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

  return (
    <aside className="w-[280px] bg-sidebar-bg border-r border-panel-border flex flex-col select-none shrink-0">
      {/* Header */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-panel-border shrink-0">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Explorer
        </span>
      </div>

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
          onClick={() => setShowCreateProject(true)}
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
      </div>

      {/* View Size Toggle */}
      <ViewSizeToggle
        value={state.view_size}
        onChange={setViewSize}
      />

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
            />
            <FolderTree
              folders={folderTree.data}
              viewSize={state.view_size}
              expandedFolderIds={state.expanded_folder_ids}
              onToggleFolder={toggleFolder}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-20 text-muted-foreground text-sm gap-2">
            <span>No projects yet</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateProject(true)}
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
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
      />
    </aside>
  );
}

export const ExplorerSidebar = memo(ExplorerSidebarComponent);