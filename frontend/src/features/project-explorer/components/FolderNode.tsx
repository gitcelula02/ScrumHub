/**
 * @component FolderNode
 * Displays a single folder row with collapse toggle and context menu trigger.
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useDeleteFolder } from "../hooks/useExplorerProjects";

interface FolderNodeProps {
  folder: FolderTreeNode;
  level: number;
  viewSize: ViewSize;
  isExpanded: boolean;
  onToggle: (folderId: string) => void;
  selectedProjectId?: string | null;
  canCreateSubfolder?: boolean;
}

function FolderNodeComponent({
  folder,
  level,
  viewSize,
  isExpanded,
  onToggle,
  selectedProjectId,
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

  return (
    <div>
      <ContextMenu onOpenChange={setShowContext}>
        <ContextMenuTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-1 py-1 text-left transition-colors duration-100",
              "hover:bg-sidebar-hover"
            )}
            style={{ paddingLeft }}
            onClick={() => onToggle(folder.id)}
          >
            {isExpanded ? (
              <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
            )}
            <span className="text-sm">📁</span>
            <span
              className="text-[13px] font-semibold text-sidebar-fg/80 truncate"
            >
              {folder.name}
            </span>
          </button>
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
              level={level + 1}
              viewSize={viewSize}
              isExpanded={false}
              onToggle={onToggle}
              canCreateSubfolder={level < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const FolderNode = memo(FolderNodeComponent);