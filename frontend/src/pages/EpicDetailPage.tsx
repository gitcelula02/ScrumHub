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
    if (!projectId) return;
    navigate({ to: `/app/projects/${projectId}/epics/` });
  };

  const handleOpenTask = (task: Task) => {
    if (!projectId) return;
    navigate({ to: `/app/projects/${projectId}/tasks/${task.id}` });
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
