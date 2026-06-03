import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { projectQuery } from "@/features/projects/api";

export const Route = createFileRoute("/app/projects/$projectId")({
  loader: async ({ params, context: { queryClient } }) => {
    console.log('[route loader] params.projectId =', params.projectId);
    if (!params.projectId || params.projectId === 'undefined') {
      console.warn('[route loader] invalid projectId, skipping loader');
      return null;
    }
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
