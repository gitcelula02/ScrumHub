import { useParams } from "@tanstack/react-router";

/**
 * @page CalendarPage
 * Project-scoped calendar view.
 * Thin orchestrator — delegates to feature components.
 */
export function CalendarPage() {
  const { projectId } = useParams({
    from: "/app/projects/$projectId/calendar",
  });

  return (
    <div className="h-full overflow-auto bg-editor p-4">
      <div className="text-foreground">Calendar for project {projectId}</div>
    </div>
  );
}
