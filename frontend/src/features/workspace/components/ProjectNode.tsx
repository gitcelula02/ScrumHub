/**
 * @component ProjectNode
 * Displays a project row with three view size options.
 * Uses useEntityTheme for dynamic color theming.
 *
 * COLOR CONTRACT:
 * - Consumes --entity-solid, --entity-bg, --entity-fg, --entity-border from parent via useEntityTheme
 */

import { memo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useEntityTheme } from "@/hooks/useEntityTheme";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { useUnpinProject, usePinProject, useMoveProject } from "../hooks/useExplorerProjects";
import type { ExplorerProject, ViewSize } from "../types/explorerTypes";

interface ProjectNodeProps {
  project: ExplorerProject;
  viewSize: ViewSize;
  isSelected?: boolean;
  onSelect?: (project: ExplorerProject) => void;
}

function ProjectNodeComponent({ project, viewSize, isSelected, onSelect }: ProjectNodeProps) {
  const navigate = useNavigate();
  const theme = useEntityTheme(project.id, project.color);
  const unpinProject = useUnpinProject();
  const pinProject = usePinProject();
  const moveProject = useMoveProject();
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  const handleClick = () => {
    if (onSelect) {
      onSelect(project);
    } else {
      navigate({
        to: "/app/projects/$projectId/dashboard",
        params: { projectId: project.id },
      });
    }
  };

  const handleOpen = () => {
    navigate({
      to: "/app/projects/$projectId/dashboard",
      params: { projectId: project.id },
    });
  };

  const handleArchive = () => {
    // Archive would update project status - stub for now
    console.log("Archive project:", project.id);
  };

  const handleDelete = () => {
    // Delete would remove project - stub for now
    console.log("Delete project:", project.id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "group flex items-center w-full cursor-pointer transition-colors duration-100",
            isSelected && "bg-list-active border-l-2 border-primary"
          )}
          style={{ paddingLeft: "12px", paddingRight: "8px", ...theme }}
          onClick={handleClick}
        >
          <div
            className={cn(
              "flex items-center gap-2 min-w-0 w-full",
              viewSize === "compact" && "h-7",
              viewSize === "medium" && "h-10",
              viewSize === "big" && "h-16 flex-col items-start"
            )}
          >
            <span className="text-sm shrink-0">{project.icon || "📁"}</span>
            <span className="truncate text-[13px] text-sidebar-fg">
              {project.name}
            </span>

            {viewSize === "big" && project.description && (
              <span className="text-[11px] text-sidebar-fg/70 truncate max-w-48">
                {project.description}
              </span>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleOpen}>Open</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>Rename</ContextMenuItem>
        <ContextMenuItem disabled>Move to...</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleArchive}>
          {project.status === "archived" ? "Unarchive" : "Archive"}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const ProjectNode = memo(ProjectNodeComponent);