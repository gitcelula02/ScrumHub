import { useParams } from "@tanstack/react-router";
import { TaskView, PropertiesPanel } from "@/features/tasks";

/**
 * @page TaskDetailPage
 * Task detail view for a specific task within a project.
 * Thin orchestrator — delegates to feature components.
 */
export function TaskDetailPage() {
  const { projectId, taskId } = useParams({ from: "/app/projects/$projectId/tasks/$taskId" });

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0">
        <TaskView taskId={taskId} projectId={projectId} />
      </div>
      <PropertiesPanel projectId={projectId} taskId={taskId} />
    </div>
  );
}