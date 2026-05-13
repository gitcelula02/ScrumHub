import { useState, useMemo } from "react";
import { ListTodo, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks, BacklogSelector } from "@/features/backlog";
import type { Task, TaskStatus, Priority } from "@/types";

interface BacklogViewProps {
  projectId: string;
  onOpenTask: (t: Task) => void;
}

const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: "bg-status-todo",
  "in-progress": "bg-status-progress",
  review: "bg-priority-med",
  done: "bg-status-done",
};

const PRIORITY_DOT: Record<Priority, string> = {
  high: "bg-priority-high",
  medium: "bg-priority-med",
  low: "bg-priority-low",
  urgent: "bg-destructive",
};

const FILTER_STATUS: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "todo", label: "Por hacer" },
  { value: "in-progress", label: "En progreso" },
  { value: "review", label: "En revisión" },
  { value: "done", label: "Hecho" },
];

const LABEL_COLORS: Record<string, string> = {
  frontend: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  backend: "bg-green-500/20 text-green-400 border-green-500/40",
  bug: "bg-red-500/20 text-red-400 border-red-500/40",
  feature: "bg-purple-500/20 text-purple-400 border-purple-500/40",
};

/**
 * @component BacklogView
 * VS Code-style task list with filtering for the backlog.
 */
export function BacklogView({ projectId, onOpenTask }: BacklogViewProps) {
  const { data: tasks = [], isLoading } = useTasks(projectId);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tasks, statusFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground font-mono">
        Cargando backlog...
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-editor p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ListTodo size={18} className="text-status-bar" /> Backlog
          </h1>
          <span className="font-mono text-xs text-muted-foreground">
            {filteredTasks.length} de {tasks.length} tareas
          </span>
        </div>
        <BacklogSelector projectId={projectId} />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Buscar tarea..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-9 pr-3 text-[12px] bg-input border border-panel-border rounded-sm text-foreground outline-none focus:border-status-bar transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          <Filter size={14} className="text-muted-foreground mr-2" />
          {FILTER_STATUS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "px-2 h-6 text-[11px] rounded-sm transition-colors",
                statusFilter === f.value
                  ? "bg-status-bar text-status-bar-fg"
                  : "text-muted-foreground hover:text-foreground hover:bg-list-hover",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-sidebar-bg border border-panel-border rounded-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_100px_100px_100px_100px] gap-2 px-4 h-9 items-center border-b border-panel-border text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
          <span>Tarea</span>
          <span>Estado</span>
          <span>Prioridad</span>
          <span>Etiquetas</span>
          <span>Encargado</span>
          <span></span>
        </div>

        <div className="divide-y divide-panel-border">
          {filteredTasks.length === 0 ? (
            <div className="px-4 py-12 text-center text-[12px] text-muted-foreground italic">
              Ninguna tarea encontrada
            </div>
          ) : (
            filteredTasks.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_100px_100px_100px_100px_100px] gap-2 px-4 h-14 items-center hover:bg-list-hover cursor-pointer group"
                onClick={() => onOpenTask(t)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      STATUS_COLOR[t.status],
                    )}
                  />
                  <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                    {t.id}
                  </span>
                  <span className="truncate text-[13px]">{t.title}</span>
                </div>

                <span className="text-[11px] capitalize text-muted-foreground">
                  {t.status === "in-progress"
                    ? "en progreso"
                    : t.status === "review"
                      ? "revisión"
                      : t.status}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      PRIORITY_DOT[t.priority],
                    )}
                  />
                  <span className="text-[11px] capitalize text-muted-foreground">
                    {t.priority}
                  </span>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {(t.labels || []).slice(0, 2).map((label) => (
                    <span
                      key={label}
                      className={cn(
                        "px-1.5 py-0.5 text-[10px] rounded-sm border",
                        LABEL_COLORS[label.toLowerCase()] ||
                          "bg-muted text-muted-foreground border-panel-border",
                      )}
                    >
                      {label}
                    </span>
                  ))}
                  {(t.labels || []).length > 2 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{t.labels.length - 2}
                    </span>
                  )}
                </div>

                <span className="font-mono text-[11px] text-muted-foreground truncate">
                  {t.assignee}
                </span>

                <span className="font-mono text-[11px] text-muted-foreground text-right">
                  {t.points} pts
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
