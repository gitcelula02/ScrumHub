import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsIndex,
});

function ProjectsIndex() {
  return (
    <div className="h-full flex items-center justify-center bg-editor text-foreground">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Projects</h1>
        <p className="text-muted-foreground">Select a project from the workspace.</p>
      </div>
    </div>
  );
}