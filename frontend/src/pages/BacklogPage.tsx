import { useParams } from "@tanstack/react-router";

/**
 * @page BacklogPage
 * Project-scoped backlog view.
 * Thin orchestrator — delegates to feature components.
 */
export function BacklogPage() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/backlog" });

  return (
    <div className="h-full overflow-auto bg-editor p-4">
      <div className="text-foreground">Backlog for project {projectId}</div>
    </div>
  );
}
