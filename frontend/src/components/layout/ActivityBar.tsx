import { FolderKanban, ListTodo, Zap, GitBranch, Settings, Search, Bell, Layers, Shield, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useTasks } from "@/features/backlog";
import { exportSprintReport } from "@/features/workspace/utils/exportPdf";

export type ActivityView = "projects" | "backlog" | "sprints" | "search" | "branches" | "epics" | "permissions";

interface ActivityBarProps {
  onNotifications: () => void;
}

const items: { id: ActivityView; icon: React.ElementType; label: string; path: string }[] = [
  { id: "projects", icon: FolderKanban, label: "Proyectos", path: "/app/projects" },
  { id: "backlog", icon: ListTodo, label: "Backlog", path: "/app/projects/$projectId/backlog" },
  { id: "sprints", icon: Zap, label: "Sprints", path: "/app/projects/$projectId/sprints" },
  { id: "epics", icon: Layers, label: "Épicas", path: "/app/projects/$projectId/dashboard" },
  { id: "permissions", icon: Shield, label: "Permisos", path: "/app/projects/$projectId/settings" },
  { id: "search", icon: Search, label: "Buscar", path: "/app/projects/$projectId/dashboard" },
  { id: "branches", icon: GitBranch, label: "Ramas", path: "/app/projects/$projectId/dashboard" },
];

/**
 * @component ActivityBar
 * VS Code-style vertical activity bar for main view switching.
 * Uses TanStack Router for navigation instead of state callbacks.
 */
export function ActivityBar({ onNotifications }: ActivityBarProps) {
  const navigate = useNavigate();
  const params = useParams({ from: "/app/projects/$projectId" });
  const routerState = useRouterState();
  const { data: tasks = [] } = useTasks();

  const currentPath = routerState.location.pathname;

  const isActive = (path: string) => {
    if (path === "/app/projects") return currentPath === "/app/projects";
    if (path.includes("$projectId")) return currentPath.includes(path.split("$projectId")[1]);
    return false;
  };

  const handleNavigate = (path: string, id: ActivityView) => {
    if (id === "projects") {
      navigate({ to: path });
    } else {
      navigate({ to: path, params: { projectId: params.projectId } });
    }
  };

  const handleExport = () => {
    exportSprintReport(tasks);
  };

  const alertCount = tasks.filter((t) => {
    if (t.status === "done") return false;
    const now = new Date("2026-04-29");
    const d = new Date(t.due);
    const days = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    return days < 0 || (days <= 2 && t.priority === "high");
  }).length + 1;

  return (
    <aside className="w-12 bg-activity-bar flex flex-col items-center justify-between border-r border-panel-border select-none">
      <div className="flex flex-col">
        {items.map(({ id, icon: Icon, label, path }) => {
          const active = isActive(path);
          return (
            <button
              key={id}
              onClick={() => handleNavigate(path, id)}
              title={label}
              className={cn(
                "relative w-12 h-12 flex items-center justify-center text-activity-bar-fg hover:text-activity-bar-active transition-colors",
                active && "text-activity-bar-active"
              )}
            >
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-activity-bar-active" />
              )}
              <Icon size={24} strokeWidth={1.5} />
            </button>
          );
        })}
      </div>
      <div className="flex flex-col">
        <button
          onClick={handleExport}
          title="Exportar reporte PDF"
          className="w-12 h-12 flex items-center justify-center text-activity-bar-fg hover:text-activity-bar-active"
        >
          <FileDown size={22} strokeWidth={1.5} />
        </button>
        <button
          onClick={onNotifications}
          title="Notificaciones IA"
          className="relative w-12 h-12 flex items-center justify-center text-activity-bar-fg hover:text-activity-bar-active"
        >
          <Bell size={22} strokeWidth={1.5} />
          {alertCount > 0 && (
            <span className="absolute top-2 right-2 min-w-4 h-4 px-1 rounded-full bg-priority-high text-[9px] font-bold text-white flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate({ to: "/app/projects/$projectId/settings", params: { projectId: params.projectId } })}
          title="Ajustes"
          className="w-12 h-12 flex items-center justify-center text-activity-bar-fg hover:text-activity-bar-active"
        >
          <Settings size={22} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
