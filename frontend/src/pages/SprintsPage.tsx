import { useParams } from "@tanstack/react-router";

/**
 * @page SprintsPage
 * Project-scoped sprints view.
 * Thin orchestrator — delegates to feature components.
 */
export function SprintsPage() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/sprints" });

  return (
    <div className="h-full overflow-auto bg-editor p-4">
      <div className="text-foreground">Sprints for project {projectId}</div>
    </div>
  );
}