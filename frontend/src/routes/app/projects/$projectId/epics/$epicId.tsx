import { createFileRoute } from "@tanstack/react-router";
import { EpicDetailPage } from "@/pages/EpicDetailPage";

export const Route = createFileRoute("/app/projects/$projectId/epics/$epicId")({
  component: EpicDetailPage,
});