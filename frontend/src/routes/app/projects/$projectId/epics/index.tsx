import { createFileRoute } from "@tanstack/react-router";
import { EpicsPage } from "@/pages/EpicsPage";

export const Route = createFileRoute("/app/projects/$projectId/epics/")({
  component: EpicsPage,
});
