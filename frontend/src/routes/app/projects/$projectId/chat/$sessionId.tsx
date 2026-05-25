import { createFileRoute } from "@tanstack/react-router";
import { ChatSessionPage } from "@/pages/ChatSessionPage";

export const Route = createFileRoute(
  "/app/projects/$projectId/chat/$sessionId",
)({
  component: ChatSessionPage,
});
