import { ExplorerView } from "@/features/workspace";

/**
 * @page ProjectsPage
 * Project explorer view - main entry point at /app/projects/
 * Thin orchestrator — delegates to ExplorerView feature component.
 */
export function ProjectsPage() {
  return <ExplorerView />;
}