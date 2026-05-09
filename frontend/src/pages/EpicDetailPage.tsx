import { useParams } from "@tanstack/react-router";

/**
 * @page EpicDetailPage
 * Epic detail view for a specific epic within a project.
 * Thin orchestrator — delegates to feature components.
 */
export function EpicDetailPage() {
  const { epicId } = useParams({
    from: "/app/projects/$projectId/epics/$epicId",
  });

  return (
    <div className="h-full overflow-auto bg-editor p-4">
      <div className="text-foreground">Epic detail: {epicId}</div>
    </div>
  );
}
