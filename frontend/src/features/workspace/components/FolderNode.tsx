/**
 * @component FolderNode
 * Displays a single folder row with separate expand (chevron) and select (name) actions.
 * Following Windows Explorer behavior: chevron click = expand/collapse, name click = select folder.
 *
 * COLOR CONTRACT:
 * - Consumes no entity colors (folder is neutral)
 */

import { memo, useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FolderTreeNode, ViewSize } from "../types/explorerTypes";
import { ProjectNode } from "./ProjectNode";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useDeleteFolder } from "../hooks/useExplorerProjects";

interface FolderNodeProps {
  folder: FolderTreeNode;
  level: number;
  viewSize: ViewSize;
  isExpanded: boolean;
  isFolderSelected?: boolean;
  onToggle: (folderId: string) => void;
  onSelectFolder?: (folder: FolderTreeNode) => void;
  selectedProjectId?: string | null;
  selectedFolderId?: string | null;
  canCreateSubfolder?: boolean;
}

function FolderNodeComponent({
  folder,
  level,
  viewSize,
  isExpanded,
  isFolderSelected = false,
  onToggle,
  onSelectFolder,
  selectedProjectId,
  selectedFolderId,
  canCreateSubfolder = true,
}: FolderNodeProps) {
  const deleteFolder = useDeleteFolder();
  const [showContext, setShowContext] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteConfirm = () => {
    deleteFolder.mutate(folder.id);
    setShowDeleteDialog(false);
  };

  const paddingLeft = 8 + level * 16;
  const childLevel = level + 1;
  const isSelected = isFolderSelected || folder.id === selectedFolderId;

  return (
    <div>
      <ContextMenu onOpenChange={setShowContext}>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "w-full flex items-center py-1 pr-2 transition-colors duration-100",
              isSelected
                ? "bg-list-active border-l-2 border-primary"
                : "hover:bg-list-hover",
            )}
            style={{ paddingLeft }}
          >
            {/* Chevron: expand/collapse only */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(folder.id);
              }}
              className="p-0.5 rounded hover:bg-list-hover shrink-0"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-muted-foreground" />
              ) : (
                <ChevronRight size={14} className="text-muted-foreground" />
              )}
            </button>

            {/* Folder name + icon: select folder */}
            <button
              onClick={() => onSelectFolder?.(folder)}
              className="flex-1 flex items-center gap-1 min-w-0 text-left"
            >
              <span className="text-sm shrink-0">📁</span>
              <span className="text-[13px] font-semibold text-sidebar-fg/80 truncate">
                {folder.name}
              </span>
            </button>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>New Project</ContextMenuItem>
          {canCreateSubfolder ? (
            <ContextMenuItem>New Subfolder</ContextMenuItem>
          ) : (
            <ContextMenuItem disabled title="Maximum folder depth reached">
              New Subfolder (max depth)
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem>Rename</ContextMenuItem>
          <ContextMenuItem>Duplicate</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Delete folder "{folder.name}"? Projects inside will be moved to root.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className={buttonVariants({ variant: "destructive" })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isExpanded && (
        <div>
          {folder.projects?.map((project) => (
            <ProjectNode
              key={project.id}
              project={project}
              viewSize={viewSize}
              isSelected={project.id === selectedProjectId}
            />
          ))}
          {folder.children?.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              level={childLevel}
              viewSize={viewSize}
              isExpanded={false}
              isFolderSelected={child.id === selectedFolderId}
              onToggle={onToggle}
              onSelectFolder={onSelectFolder}
              selectedProjectId={selectedProjectId}
              selectedFolderId={selectedFolderId}
              canCreateSubfolder={level < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const FolderNode = memo(FolderNodeComponent);
