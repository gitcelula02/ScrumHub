import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { z } from "zod";
import { ArrowLeft, Sparkles } from "lucide-react";
import { CreateProjectForm } from "@/features/projects/components/CreateProjectForm";
import { ProjectCreationAssistant } from "@/features/projects/components/ProjectCreationAssistant";
import { Breadcrumb } from "@/features/workspace/components/Breadcrumb";
import { useExplorerProjects } from "@/features/workspace/hooks/useExplorerProjects";
import { findFolderPath } from "@/features/workspace/hooks/useExplorerNavigation";
import { Button } from "@/components/ui/button";
import type { ProjectSuggestion } from "@/features/projects/components/ProjectCreationAssistant";
import type { FolderTreeNode } from "@/features/workspace/types/explorerTypes";

const createSearchSchema = z.object({
  folderId: z.string().optional(),
});

export const Route = createFileRoute("/app/projects/create")({
  validateSearch: createSearchSchema,
  component: CreateProjectPage,
});

function CreateProjectPage() {
  const { folderId } = Route.useSearch();
  const navigate = useNavigate();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<ProjectSuggestion>>({});
  const [formKey, setFormKey] = useState(0);

  const { folderTree } = useExplorerProjects();

  const breadcrumbPath = useMemo(() => {
    if (!folderId || !folderTree?.data) return [];
    return findFolderPath(folderTree.data, folderId) || [];
  }, [folderId, folderTree]);

  const handleSuggestionApply = (suggestion: ProjectSuggestion) => {
    setInitialValues(suggestion);
    setFormKey((prev) => prev + 1);
  };

  const handleBreadcrumbNavigate = () => {
    navigate({ to: "/app/projects" });
  };

  return (
    <div className="flex flex-col h-full bg-editor">
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate({ to: "/app/projects" })}
                  className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-list-hover transition-colors text-muted-foreground hover:text-foreground"
                  title="Back to explorer"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Create Project
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Set up a new project for your team
                  </p>
                </div>
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
            {breadcrumbPath.length > 0 && (
              <div className="mt-3 ml-1">
                <Breadcrumb path={breadcrumbPath} onNavigate={handleBreadcrumbNavigate} />
              </div>
            )}
          </div>

          {/* Form with card background */}
          <div className="rounded-lg border border-panel-border bg-card p-6">
            <CreateProjectForm key={formKey} defaultValues={initialValues} folderId={folderId} />
          </div>
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
