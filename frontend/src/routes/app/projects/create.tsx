import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { CreateProjectForm } from "@/features/projects/components/CreateProjectForm";
import { ProjectCreationAssistant } from "@/features/projects/components/ProjectCreationAssistant";
import { Button } from "@/components/ui/button";
import type { ProjectSuggestion } from "@/features/projects/components/ProjectCreationAssistant";

export const Route = createFileRoute("/app/projects/create")({
  component: CreateProjectPage,
});

function CreateProjectPage() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<ProjectSuggestion>>({});
  const [formKey, setFormKey] = useState(0);

  const handleSuggestionApply = (suggestion: ProjectSuggestion) => {
    setInitialValues(suggestion);
    setFormKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-editor">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Create Project
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Set up a new project for your team
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsAssistantOpen(true)}
              className="gap-2 bg-status-bar hover:bg-status-bar/90"
            >
              <Sparkles size={16} />
              AI Assistant
            </Button>
          </div>
          <CreateProjectForm key={formKey} defaultValues={initialValues} />
        </div>
      </div>

      <ProjectCreationAssistant
        open={isAssistantOpen}
        onOpenChange={setIsAssistantOpen}
        onSuggestionApply={handleSuggestionApply}
      />
    </div>
  );
}
