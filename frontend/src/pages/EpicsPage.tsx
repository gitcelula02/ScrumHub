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
    navigate({
      to: "/app/projects/$projectId/tasks/$taskId",
      params: { projectId, taskId: task.id },
    });
  };

  const handleOpenEpic = (epic: Task) => {
    navigate({
      to: "/app/projects/$projectId/epics/$epicId",
      params: { projectId, epicId: epic.id },
    });
  };

  return (
    <EpicsView
      projectId={projectId}
      onOpenTask={handleOpenTask}
      onOpenEpic={handleOpenEpic}
    />
  );
}
