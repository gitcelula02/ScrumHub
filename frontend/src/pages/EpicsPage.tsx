import { useParams, useNavigate } from "@tanstack/react-router";
import { EpicsView } from "@/features/projects";
import type { Task } from "@/types";

/**
 * @page EpicsPage
 * Thin orchestrator for the epics list view.
 */
export function EpicsPage() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/epics/" });
  const navigate = useNavigate();

  const handleOpenTask = (task: Task) => {
    if (!projectId) return;
    navigate({ to: `/app/projects/${projectId}/tasks/${task.id}` });
  };

  const handleOpenEpic = (epic: Task) => {
    if (!projectId) return;
    navigate({ to: `/app/projects/${projectId}/epics/${epic.id}` });
  };

  return (
    <EpicsView
      projectId={projectId}
      onOpenTask={handleOpenTask}
      onOpenEpic={handleOpenEpic}
    />
  );
}
