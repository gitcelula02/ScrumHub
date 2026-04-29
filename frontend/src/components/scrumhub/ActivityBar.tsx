import { FolderKanban, ListTodo, Zap, GitBranch, Settings, Search, Bell, Layers, Shield, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivityView = "projects" | "backlog" | "sprints" | "search" | "branches" | "epics" | "permissions";

interface Props {
  active: ActivityView;
  onChange: (v: ActivityView) => void;
  onNotifications: () => void;
  onExport: () => void;
  alertCount: number;
}

const items: { id: ActivityView; icon: React.ElementType; label: string }[] = [
  { id: "projects", icon: FolderKanban, label: "Proyectos" },
  { id: "backlog", icon: ListTodo, label: "Backlog" },
  { id: "sprints", icon: Zap, label: "Sprints" },
  { id: "epics", icon: Layers, label: "Épicas" },
  { id: "permissions", icon: Shield, label: "Permisos" },
  { id: "search", icon: Search, label: "Buscar" },
  { id: "branches", icon: GitBranch, label: "Ramas" },
];

export function ActivityBar({ active, onChange, onNotifications, onExport, alertCount }: Props) {
  return (
    <aside className="w-12 bg-activity-bar flex flex-col items-center justify-between border-r border-panel-border select-none">
      <div className="flex flex-col">
        {items.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              title={label}
              className={cn(
                "relative w-12 h-12 flex items-center justify-center text-activity-bar-fg hover:text-activity-bar-active transition-colors",
                isActive && "text-activity-bar-active"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-activity-bar-active" />
              )}
              <Icon size={24} strokeWidth={1.5} />
            </button>
          );
        })}
      </div>
      <div className="flex flex-col">
        <button
          onClick={onExport}
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
          title="Ajustes"
          className="w-12 h-12 flex items-center justify-center text-activity-bar-fg hover:text-activity-bar-active"
        >
          <Settings size={22} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
