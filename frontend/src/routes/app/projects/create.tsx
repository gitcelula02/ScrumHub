import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/projects/create")({
  component: CreateProjectPage,
});

function CreateProjectPage() {
  return (
    <div className="h-full flex items-center justify-center bg-editor">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Create Project
        </h1>
        <p className="text-muted-foreground">
          Project creation form coming soon.
        </p>
      </div>
    </div>
  );
}
