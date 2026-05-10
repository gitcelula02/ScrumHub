/**
 * @component ExplorerView
 * Main project explorer view that combines sidebar and welcome panel.
 * This is a GENERAL VIEW - no AppShell, no ActivityBar, standalone page.
 *
 * Uses ResizablePanelGroup for VS Code-style drag handle resizing (260-320px range).
 *
 * COLOR CONTRACT:
 * - Uses useEntityTheme for welcome panel project cards
 */

import { useState, useMemo } from "react";
import { ExplorerSidebar } from "./ExplorerSidebar";
import { WelcomePanel } from "./WelcomePanel";
import { useExplorerProjects, usePinnedProjects } from "../hooks/useExplorerProjects";
import { useExplorerState } from "../hooks/useExplorerState";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export function ExplorerView() {
  const { folderTree } = useExplorerProjects();
  const { data: pinnedData } = usePinnedProjects();
  const { state, setLastOpenedProject } = useExplorerState();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const pinnedProjects = useMemo(() => {
    return pinnedData?.pinned ?? [];
  }, [pinnedData]);

  const recentProjects = useMemo(() => {
    if (!state.last_opened_project_id || !folderTree) return [];
    const lastId = state.last_opened_project_id;
    const allProjects = folderTree.data.flatMap((f) => f.projects ?? []);
    const lastProject = allProjects.find((p) => p.id === lastId);
    return lastProject ? [lastProject] : [];
  }, [state.last_opened_project_id, folderTree]);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setLastOpenedProject(projectId);
  };

  return (
    <div className="flex h-screen w-full bg-editor">
      <ResizablePanelGroup direction="horizontal" className="w-full h-full">
        <ResizablePanel defaultSize={25} className="h-full shrink-0">
          <ExplorerSidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} className="h-full flex-1">
          {selectedProjectId ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading project...</p>
            </div>
          ) : (
            <WelcomePanel
              pinnedProjects={pinnedProjects}
              recentProjects={recentProjects}
              onCreateProject={() => setShowCreateProject(true)}
            />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}