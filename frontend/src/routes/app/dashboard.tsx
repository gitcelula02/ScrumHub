import { createFileRoute } from "@tanstack/react-router";

/**
 * @route /dashboard
 * Main workspace entry point. 
 * Since _auth.tsx already renders AppShell, this can be empty or show a summary.
 * For now, it will just trigger the AppShell's default view.
 */
export const Route = createFileRoute("/app/dashboard")({
  component: () => null, // AppShell handles the internal routing/state for now
});
