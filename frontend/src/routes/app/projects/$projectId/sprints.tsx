import { createFileRoute } from "@tanstack/react-router";
import { SprintsPage } from "@/pages/SprintsPage";

export const Route = createFileRoute("/app/projects/$projectId/sprints")({
  component: SprintsPage,
});
