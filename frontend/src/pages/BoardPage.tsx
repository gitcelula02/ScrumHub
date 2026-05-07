import { useParams } from "@tanstack/react-router";

/**
 * @page BoardPage
 * Project-scoped board view.
 * Thin orchestrator — delegates to feature components.
 */
export function BoardPage() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/board" });

  return (
    <div className="h-full overflow-auto bg-editor p-4">
      <div className="text-foreground">Board for project {projectId}</div>
    </div>
  );
}