import { Star, MoreHorizontal, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Project, ProjectStatus } from "../types";

interface ProjectCardProps {
  project: Project;
  leadName: string;
  taskCount: number;
  epicCount: number;
  memberCount: number;
  isFeatured?: boolean;
  onClick: () => void;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Activo",
  planning: "Planificado",
  paused: "Pausado",
  archived: "Archivado",
};

const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string }> = {
  active: { bg: "bg-status-done/20", text: "text-status-done" },
  planning: { bg: "bg-status-progress/20", text: "text-status-progress" },
  paused: { bg: "bg-status-progress/20", text: "text-yellow-500" },
  archived: { bg: "bg-muted", text: "text-muted-foreground" },
};

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 30) return `hace ${diffDays}d`;
  return date.toLocaleDateString();
}

/**
 * @component ProjectCard
 * Dumb presentational component for displaying a project card.
 * Receives all data via props, no data fetching.
 */
export function ProjectCard({
  project,
  leadName,
  taskCount,
  epicCount,
  memberCount,
  isFeatured = false,
  onClick,
}: ProjectCardProps) {
  if (!project) return null;

  const initials = (project.key || "PR").slice(0, 2).toUpperCase();
  const projectStatus = (project.status || "active") as ProjectStatus;
  const statusStyle = STATUS_COLORS[projectStatus] || STATUS_COLORS.active;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-sidebar-bg p-4 cursor-pointer",
        "border-panel-border hover:border-sidebar-border/80",
        "transition-all duration-150 hover:bg-sidebar-bg/80"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Project Icon */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[13px] font-bold text-white"
            style={{ backgroundColor: project.color || "var(--primary)" }}
          >
            {initials}
          </div>

          {/* Project Name & Lead */}
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-foreground truncate pr-2">
              {project.name}
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              Lead · {leadName}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isFeatured && (
            <Star
              size={14}
              className="text-yellow-500 fill-yellow-500"
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1 hover:bg-list-hover rounded"
          >
            <MoreHorizontal size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-muted-foreground mb-3 line-clamp-2 flex-1">
        {project.description}
      </p>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-medium px-2 py-0 h-5",
            statusStyle.bg,
            statusStyle.text
          )}
        >
          {STATUS_LABELS[project.status]}
        </Badge>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-panel-border/50">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
          <span title="Tareas">{taskCount} tasks</span>
          <span title="Épicas">{epicCount} epics</span>
          <span title="Miembros">{memberCount} members</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock size={10} />
          <span>{getRelativeTime(project.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}