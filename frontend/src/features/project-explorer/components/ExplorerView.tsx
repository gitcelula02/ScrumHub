/**
 * @component ExplorerView
 * Main project explorer view that combines sidebar and welcome panel.
 * This is a GENERAL VIEW - no AppShell, no ActivityBar, standalone page.
 *
 * COLOR CONTRACT:
 * - Uses useEntityTheme for welcome panel project cards
 */

import { useState, useMemo } from "react";
import { ExplorerSidebar } from "./ExplorerSidebar";
import { WelcomePanel } from "./WelcomePanel";
import { useExplorerProjects, usePinnedProjects } from "../hooks/useExplorerProjects";
import { useExplorerState } from "../hooks/useExplorerState";

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
    const allProjects = [
      ...(folderTree.pinned ?? []),
      ...folderTree.data.flatMap((f) => f.projects ?? []),
    ];
    const lastProject = allProjects.find((p) => p.id === lastId);
    return lastProject ? [lastProject] : [];
  }, [state.last_opened_project_id, folderTree]);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setLastOpenedProject(projectId);
  };

  return (
    <div className="flex h-screen bg-editor">
      <ExplorerSidebar />
      <main className="flex-1 overflow-hidden">
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
      </main>
    </div>
  );
}