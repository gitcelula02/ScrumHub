import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/DashboardPage";

/**
 * @route /app/dashboard
 * Main workspace dashboard page.
 * Renders the DashboardPage which delegates to the Board feature component.
 */
export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});
