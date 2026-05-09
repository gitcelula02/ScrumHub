import { useParams, useNavigate } from "@tanstack/react-router";
import { Board } from "@/features/board";
import type { Task } from "@/types";

/**
 * @page BoardPage
 * Project-scoped board view.
 * Thin orchestrator — delegates to feature components.
 */
export function BoardPage() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/board" });
  const navigate = useNavigate();

  const handleOpenTask = (task: Task) => {
    navigate({
      to: "/app/projects/$projectId/tasks/$taskId",
      params: { projectId, taskId: task.id },
    });
  };

  return <Board onOpenTask={handleOpenTask} projectId={projectId} />;
}
