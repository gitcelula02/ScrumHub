import { Layers, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEpicDetail } from "../hooks/useEpicDetail";
import type { Task } from "@/types";

interface EpicDetailViewProps {
  projectId: string;
  epicId: string;
  onBack: () => void;
  onOpenTask: (t: Task) => void;
}

const STATUS_COLOR = {
  todo: "bg-status-todo",
  "in-progress": "bg-status-progress",
  review: "bg-priority-med",
  done: "bg-status-done",
} as const;

const PRIORITY_DOT = {
  high: "bg-priority-high",
  medium: "bg-priority-med",
  low: "bg-priority-low",
  urgent: "bg-destructive",
} as const;

/**
 * @component EpicDetailView
 * Shows a single epic's details and its child tasks.
 */
export function EpicDetailView({
  projectId,
  epicId,
  onBack,
  onOpenTask,
}: EpicDetailViewProps) {
  const { epic, children, isLoading, error } = useEpicDetail(projectId, epicId);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground font-mono">
        Cargando epic...
      </div>
    );
  }

  if (error || !epic) {
    return (
      <div className="h-full flex items-center justify-center text-destructive font-mono">
        Epic no encontrado
      </div>
    );
  }

  const done = children.filter((t) => t.status === "done").length;
  const total = children.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const points = children.reduce((s, t) => s + t.points, 0);

  return (
    <div className="h-full overflow-auto bg-editor p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Volver a épicas
      </button>

      <div className="mb-6 bg-sidebar-bg border border-panel-border rounded-sm p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-status-bar/20 text-status-bar flex items-center justify-center">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {epic.title}
              </h1>
              <p className="text-[12px] text-muted-foreground font-mono">
                {epic.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 w-32 bg-editor rounded-sm overflow-hidden">
              <div
                className="h-full bg-status-done transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {pct}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-[12px]">
          <div>
            <span className="text-muted-foreground">Estado</span>
            <p className="font-semibold capitalize">{epic.status}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Prioridad</span>
            <p className="font-semibold capitalize">{epic.priority}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Tareas</span>
            <p className="font-semibold">
              {done}/{total}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Puntos</span>
            <p className="font-semibold">{points}</p>
          </div>
        </div>

        {epic.description && (
          <p className="mt-4 text-[13px] text-muted-foreground border-t border-panel-border pt-4">
            {epic.description}
          </p>
        )}
      </div>

      <h2 className="text-[14px] font-semibold text-foreground mb-3">
        Tareas child ({children.length})
      </h2>

      <div className="bg-sidebar-bg border border-panel-border rounded-sm overflow-hidden">
        <div className="divide-y divide-panel-border">
          {children.length === 0 ? (
            <div className="px-4 py-8 text-center text-[12px] text-muted-foreground italic">
              Sin tareas child
            </div>
          ) : (
            children.map((t) => (
              <button
                key={t.id}
                onClick={() => onOpenTask(t)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-list-hover text-left text-[13px]"
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    STATUS_COLOR[t.status as keyof typeof STATUS_COLOR] ||
                      "bg-muted",
                  )}
                />
                <span className="font-mono text-[11px] text-muted-foreground w-20 shrink-0">
                  {t.id}
                </span>
                <span className="flex-1 truncate">{t.title}</span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      PRIORITY_DOT[t.priority as keyof typeof PRIORITY_DOT] ||
                        "bg-muted",
                    )}
                  />
                  {t.priority}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground w-24 truncate text-right">
                  {t.assignee}
                </span>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
