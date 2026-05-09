import { useParams } from "@tanstack/react-router";

/**
 * @page SettingsPage
 * Project-scoped settings view.
 * Thin orchestrator — delegates to feature components.
 */
export function SettingsPage() {
  const { projectId } = useParams({
    from: "/app/projects/$projectId/settings",
  });

  return (
    <div className="h-full overflow-auto bg-editor p-4">
      <div className="text-foreground">Settings for project {projectId}</div>
    </div>
  );
}
