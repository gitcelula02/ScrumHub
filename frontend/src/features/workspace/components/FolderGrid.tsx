/**
 * @component FolderGrid
 * Grid display for folder contents (subfolders and projects).
 * Respects ViewSizeToggle (compact/medium/big).
 *
 * COLOR CONTRACT:
 * - Uses useEntityTheme for project cards
 */

import { memo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Folder, ChevronRight } from "lucide-react";
import { useEntityTheme } from "@/hooks/useEntityTheme";
import type { FolderTreeNode, ExplorerProject, ViewSize } from "../types/explorerTypes";
import { ViewSizeToggle } from "./ViewSizeToggle";

interface FolderGridProps {
  folder: FolderTreeNode;
  viewSize: ViewSize;
  onViewSizeChange: (size: ViewSize) => void;
  onSubfolderClick?: (folder: FolderTreeNode) => void;
}

function ProjectCard({ project }: { project: ExplorerProject }) {
  const theme = useEntityTheme(project.id, project.color);
  const navigate = useNavigate();
  const completionPercent = project.status === "completed" ? 100 : project.status === "active" ? 50 : 20;

  const handleClick = () => {
    navigate({
      to: "/app/projects/$projectId/dashboard",
      params: { projectId: project.id },
    });
  };

  return (
    <button
      className="flex flex-col items-start gap-2 p-4 rounded-md border border-panel-border bg-card hover:bg-list-hover transition-colors text-left w-full"
      style={theme}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{project.icon || "📁"}</span>
        <span className="font-semibold text-[14px] truncate" style={{ color: "var(--entity-fg)" }}>
          {project.name}
        </span>
      </div>
      <div className="w-full h-1 rounded-full bg-sidebar-border/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-[--entity-solid]"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
      <span className="text-[11px] font-mono" style={{ color: "var(--entity-fg)", opacity: 0.7 }}>
        {completionPercent}% complete
      </span>
    </button>
  );
}

function SubfolderCard({ folder, onClick }: { folder: FolderTreeNode; onClick: () => void }) {
  return (
    <button
      className="flex items-center gap-3 p-4 rounded-md border border-panel-border bg-card hover:bg-list-hover transition-colors text-left w-full"
      onClick={onClick}
    >
      <Folder size={24} className="text-yellow-500/60 shrink-0" />
      <div className="min-w-0">
        <span className="font-semibold text-[14px] text-sidebar-fg block truncate">
          {folder.name}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {folder.children.length} subfolders &middot; {folder.projects?.length ?? 0} projects
        </span>
      </div>
      <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
    </button>
  );
}

function FolderGridComponent({
  folder,
  viewSize,
  onViewSizeChange,
  onSubfolderClick,
}: FolderGridProps) {
  const subfolders = folder.children ?? [];
  const projects = folder.projects ?? [];

  return (
    <div className="flex flex-col h-full bg-editor overflow-auto">
      <div className="px-6 py-4 border-b border-panel-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{folder.name}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {subfolders.length} folders &middot; {projects.length} projects
          </p>
        </div>
        <ViewSizeToggle value={viewSize} onChange={onViewSizeChange} />
      </div>

      <div className="flex-1 p-6">
        {subfolders.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">
              Folders
            </h2>
            <div
              className={
                viewSize === "compact"
                  ? "flex flex-col gap-2"
                  : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              }
            >
              {subfolders.map((sub) => (
                <SubfolderCard
                  key={sub.id}
                  folder={sub}
                  onClick={() => onSubfolderClick?.(sub)}
                />
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">
              Projects
            </h2>
            <div
              className={
                viewSize === "compact"
                  ? "flex flex-col gap-2"
                  : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              }
            >
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {subfolders.length === 0 && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Folder size={40} className="mb-2 opacity-40" />
            <p className="text-sm">This folder is empty</p>
            <p className="text-xs mt-1">Create a project or subfolder to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const FolderGrid = memo(FolderGridComponent);
