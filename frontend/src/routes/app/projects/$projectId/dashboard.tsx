import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/projects/$projectId/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="h-full overflow-auto bg-editor p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground mb-4">Dashboard</h1>
        <p className="text-muted-foreground">Project dashboard content.</p>
      </div>
    </div>
  );
}