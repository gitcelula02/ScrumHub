import { useParams } from "@tanstack/react-router";

/**
 * @page ChatSessionPage
 * Specific chat session view.
 * Thin orchestrator — delegates to feature components.
 */
export function ChatSessionPage() {
  const { sessionId } = useParams({ from: "/app/projects/$projectId/chat/$sessionId" });

  return (
    <div className="h-full overflow-auto bg-editor p-4">
      <div className="text-foreground">Chat session: {sessionId}</div>
    </div>
  );
}