import { useParams, useNavigate } from "@tanstack/react-router";
import { EpicDetailView } from "@/features/projects";
import type { Task } from "@/types";

/**
 * @page EpicDetailPage
 * Thin orchestrator for the epic detail view.
 */
export function EpicDetailPage() {
  const { projectId, epicId } = useParams({
    from: "/app/projects/$projectId/epics/$epicId",
  });
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: "/app/projects/$projectId/epics/", params: { projectId } });
  };

  const handleOpenTask = (task: Task) => {
    navigate({
      to: "/app/projects/$projectId/tasks/$taskId",
      params: { projectId, taskId: task.id },
    });
  };

  return (
    <EpicDetailView
      projectId={projectId}
      epicId={epicId}
      onBack={handleBack}
      onOpenTask={handleOpenTask}
    />
  );
}
