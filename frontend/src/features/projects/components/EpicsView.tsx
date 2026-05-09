import { Layers, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEpics } from "../hooks/useEpics";
import type { Task } from "@/types";

interface EpicsViewProps {
  projectId: string;
  onOpenTask: (t: Task) => void;
  onOpenEpic?: (t: Task) => void;
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
 * @component EpicsView
 * Smart feature component for viewing high-level epic progress.
 * Uses proper hierarchical task structure (type === 'EPIC' with parentId).
 */
export function EpicsView({
  projectId,
  onOpenTask,
  onOpenEpic,
}: EpicsViewProps) {
  const { epics, epicChildren, isLoading } = useEpics(projectId);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground font-mono">
        Cargando épicas...
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-editor p-6">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-xl font-semibold text-foreground">Épicas</h1>
        <span className="font-mono text-xs text-muted-foreground">
          {epics.length} épicas
        </span>
      </div>

      <div className="space-y-3">
        {epics.map((epic) => {
          const children = epicChildren.get(epic.id) || [];
          const total = children.length;
          const done = children.filter((t) => t.status === "done").length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          const points = children.reduce((s, t) => s + t.points, 0);

          return (
            <div
              key={epic.id}
              className="bg-sidebar-bg border border-panel-border rounded-sm"
            >
              <div className="flex items-center justify-between px-4 h-11 border-b border-panel-border">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-status-bar" />
                  <button
                    onClick={() => onOpenEpic?.(epic)}
                    className="text-[14px] font-semibold text-foreground hover:text-status-bar transition-colors"
                  >
                    {epic.title}
                  </button>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {done}/{total} · {points} pts
                  </span>
                </div>
                <div className="flex items-center gap-3 w-64">
                  <div className="flex-1 h-1.5 bg-editor rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-status-done transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground w-10 text-right">
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="divide-y divide-panel-border">
                {children.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onOpenTask(t)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-list-hover text-left text-[13px]"
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
                          PRIORITY_DOT[
                            t.priority as keyof typeof PRIORITY_DOT
                          ] || "bg-muted",
                        )}
                      />
                      {t.priority}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground w-24 truncate text-right">
                      {t.assignee}
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
