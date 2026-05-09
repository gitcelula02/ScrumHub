import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { projectQuery } from "@/features/projects/api";

export const Route = createFileRoute("/app/projects/$projectId")({
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData(projectQuery(params.projectId));
  },
  component: ProjectLayout,
});

function ProjectLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
