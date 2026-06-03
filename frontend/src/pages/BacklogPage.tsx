import { useParams, useNavigate } from "@tanstack/react-router";
import { BacklogView } from "@/features/backlog";
import type { Task } from "@/types";

/**
 * @page BacklogPage
 * Thin orchestrator for the backlog view.
 */
export function BacklogPage() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/backlog" });
  const navigate = useNavigate();

  console.log('[BacklogPage] projectId =', projectId);

  const handleOpenTask = (task: Task) => {
    if (!projectId) return;
    navigate({ to: `/app/projects/${projectId}/tasks/${task.id}` });
  };

  return <BacklogView projectId={projectId} onOpenTask={handleOpenTask} />;
}
