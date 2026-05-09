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

  const handleOpenTask = (task: Task) => {
    navigate({
      to: "/app/projects/$projectId/tasks/$taskId",
      params: { projectId, taskId: task.id },
    });
  };

  return <BacklogView projectId={projectId} onOpenTask={handleOpenTask} />;
}
