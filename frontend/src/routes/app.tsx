import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

function AppShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

/**
 * @route /app
 * Layout route for all authenticated pages.
 * Auth check is handled in root route's beforeLoad.
 */
export const Route = createFileRoute("/app")({
  component: AppShellLayout,
});
