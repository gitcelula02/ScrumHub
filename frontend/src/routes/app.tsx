import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

/**
 * @route _auth
 * Layout route for authenticated pages.
 * In a real app, this would check for a session via a loader or hook.
 */
export const Route = createFileRoute("/app")({
  component: () => (
    <AppShell />
  ),
});
