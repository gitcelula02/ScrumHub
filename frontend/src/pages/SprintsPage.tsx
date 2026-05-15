import { useParams } from "@tanstack/react-router";
import { SprintsView } from "@/features/sprints";

/**
 * @page SprintsPage
 * Thin orchestrator for the sprints view.
 */
export function SprintsPage() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/sprints" });
  return <SprintsView projectId={projectId} />;
}
