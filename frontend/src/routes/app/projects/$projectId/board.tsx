import { createFileRoute } from "@tanstack/react-router";
import { BoardPage } from "@/pages/BoardPage";

export const Route = createFileRoute("/app/projects/$projectId/board")({
  component: BoardPage,
});