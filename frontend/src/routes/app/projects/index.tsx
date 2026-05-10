import { createFileRoute } from "@tanstack/react-router";
import { ExplorerView } from "@/features/project-explorer";

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsIndex,
});

function ProjectsIndex() {
  return <ExplorerView />;
}