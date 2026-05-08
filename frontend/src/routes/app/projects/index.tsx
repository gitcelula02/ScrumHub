import { createFileRoute } from "@tanstack/react-router";
import { ProjectsView } from "@/features/projects";

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsIndex,
});

function ProjectsIndex() {
  return <ProjectsView />;
}