import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * @route /app
 * Pass-through layout route for all authenticated pages.
 * Auth check is handled in root route's beforeLoad.
 * AppShell is only rendered inside /app/projects/$projectId/ routes.
 */
export const Route = createFileRoute("/app")({
  component: Outlet,
});
