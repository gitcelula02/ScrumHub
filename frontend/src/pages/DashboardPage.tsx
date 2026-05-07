import { useParams, useNavigate } from "@tanstack/react-router";
import { Board } from "@/features/board";
import type { Task } from "@/types";

/**
 * @page DashboardPage
 * Project dashboard showing the Kanban board.
 * Thin orchestrator — delegates to feature components.
 */
export function DashboardPage() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/dashboard" });
  const navigate = useNavigate();

  const handleOpenTask = (task: Task) => {
    navigate({ to: "/app/projects/$projectId/tasks/$taskId", params: { projectId, taskId: task.id } });
  };

  return <Board onOpenTask={handleOpenTask} />;
}