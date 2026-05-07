import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/DashboardPage";

export const Route = createFileRoute("/app/projects/$projectId/dashboard")({
  component: DashboardPage,
});