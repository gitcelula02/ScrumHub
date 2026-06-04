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
    try {
      return await queryClient.ensureQueryData(projectQuery(params.projectId));
    } catch (error) {
      console.warn('[route loader] project prefetch skipped', error);
      return null;
    }
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
