/**
 * @component WelcomePanel
 * Main content panel shown when no project is selected.
 * Displays pinned projects, recent projects, and create button.
 *
 * COLOR CONTRACT:
 * - Uses useEntityTheme for project color cards
 */

import { memo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Pin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEntityTheme } from "@/hooks/useEntityTheme";
import type { ExplorerProject } from "../types/explorerTypes";

interface WelcomePanelProps {
  pinnedProjects: ExplorerProject[];
  recentProjects: ExplorerProject[];
  onCreateProject?: () => void;
}

interface ProjectCardProps {
  project: ExplorerProject;
  onClick: () => void;
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
  const theme = useEntityTheme(project.color);

  return (
    <button
      className="flex flex-col items-start gap-2 p-4 rounded-md border border-panel-border bg-card hover:bg-card-hover transition-colors text-left w-full"
      style={theme}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{project.icon || "📁"}</span>
        <span className="font-semibold text-[14px]" style={{ color: "var(--entity-fg)" }}>
          {project.name}
        </span>
      </div>
      <div
        className="w-full h-1 rounded-full bg-sidebar-border/30 overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-[--entity-solid]"
          style={{ width: "75%" }}
        />
      </div>
      <span className="text-[11px] font-mono" style={{ color: "var(--entity-fg)", opacity: 0.7 }}>
        75% complete
      </span>
    </button>
  );
}

function WelcomePanelComponent({
  pinnedProjects,
  recentProjects,
  onCreateProject,
}: WelcomePanelProps) {
  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    navigate({
      to: "/app/projects/$projectId/dashboard",
      params: { projectId },
    });
  };

  return (
    <div className="flex flex-col h-full bg-editor p-8 overflow-auto">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Welcome to ScrumHub
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Select a project from the explorer to get started, or create a new one.
        </p>

        {pinnedProjects.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Pin size={14} className="text-yellow-500/70" />
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Pinned Projects
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pinnedProjects.slice(0, 3).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project.id)}
                />
              ))}
            </div>
          </section>
        )}

        {recentProjects.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} className="text-muted-foreground" />
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Recent
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects.slice(0, 2).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project.id)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <Button onClick={onCreateProject} className="gap-2">
            <Plus size={16} />
            Create New Project
          </Button>
        </section>
      </div>
    </div>
  );
}

export const WelcomePanel = memo(WelcomePanelComponent);