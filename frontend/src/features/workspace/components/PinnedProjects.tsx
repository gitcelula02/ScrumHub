/**
 * @component PinnedProjects
 * Displays the pinned projects section with collapse toggle.
 *
 * COLOR CONTRACT:
 * - Consumes no entity colors (uses neutral sidebar colors)
 */

import { memo, useState } from "react";
import { ChevronRight, ChevronDown, Pin } from "lucide-react";
import type { ExplorerProject, ViewSize } from "../types/explorerTypes";
import { ProjectNode } from "./ProjectNode";

interface PinnedProjectsProps {
  projects?: ExplorerProject[];
  viewSize: ViewSize;
  selectedProjectId?: string | null;
}

function PinnedProjectsComponent({
  projects = [],
  viewSize,
  selectedProjectId,
}: PinnedProjectsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="mb-2">
      <button
        className="w-full flex items-center gap-1 px-2 py-1 hover:bg-list-hover text-left"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
        )}
        <Pin size={12} className="text-yellow-500/70 shrink-0" />
        <span
          className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
        >
          Pinned
        </span>
        <span className="text-[10px] text-muted-foreground/50 ml-1">
          ({projects.length})
        </span>
      </button>

      {!isCollapsed && (
        <div className="mt-1">
          {projects.map((project) => (
            <ProjectNode
              key={project.id}
              project={project}
              viewSize={viewSize}
              isSelected={project.id === selectedProjectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const PinnedProjects = memo(PinnedProjectsComponent);