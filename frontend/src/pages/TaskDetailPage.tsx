import { useParams } from "@tanstack/react-router";
import { TaskView } from "@/features/tasks";

/**
 * @page TaskDetailPage
 * Task detail view for a specific task within a project.
 * Thin orchestrator — delegates to feature components.
 */
export function TaskDetailPage() {
  const { taskId } = useParams({ from: "/app/projects/$projectId/tasks/$taskId" });

  return <TaskView taskId={taskId} />;
}