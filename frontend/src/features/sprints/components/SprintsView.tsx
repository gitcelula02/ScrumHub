import { Zap, Calendar, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BacklogSelector } from "@/features/backlog";
import { useSprints } from "../hooks/useSprints";
import type { Sprint } from "../types";

const STATUS_BADGE: Record<Sprint["status"], string> = {
  active:
    "bg-status-progress/20 text-status-progress border-status-progress/40",
  planned: "bg-status-bar/20 text-status-bar border-status-bar/40",
  completed: "bg-status-done/20 text-status-done border-status-done/40",
};

const STATUS_LABEL: Record<Sprint["status"], string> = {
  active: "Activo",
  planned: "Planificado",
  completed: "Completado",
};

interface SprintsViewProps {
  projectId: string;
}

/**
 * @component SprintsView
 * Sprint management interface showing active and planned sprints.
 */
export function SprintsView({ projectId }: SprintsViewProps) {
  const { data: sprints = [], isLoading, error } = useSprints(projectId);
  const activeSprints = sprints.filter((s) => s.status === "active");
  const plannedSprints = sprints.filter((s) => s.status === "planned");

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground font-mono">
        Cargando sprints...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-destructive font-mono">
        No se pudieron cargar los sprints.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-editor p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Zap size={18} className="text-status-bar" /> Sprints
          </h1>
          <span className="font-mono text-xs text-muted-foreground">
            {sprints.length} sprints
          </span>
        </div>
        <div className="flex items-center gap-3">
          <BacklogSelector projectId={projectId} />
          <button className="flex items-center gap-2 px-3 h-8 text-[12px] bg-status-bar text-status-bar-fg rounded-sm hover:opacity-90">
            <Plus size={14} /> Nuevo Sprint
          </button>
        </div>
      </div>

      {activeSprints.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[12px] font-semibold tracking-wider uppercase text-muted-foreground mb-3">
            Activos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSprints.map((sprint) => (
              <SprintCard key={sprint.id} sprint={sprint} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-[12px] font-semibold tracking-wider uppercase text-muted-foreground mb-3">
          Planificados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plannedSprints.length > 0 ? (
            plannedSprints.map((sprint) => (
              <SprintCard key={sprint.id} sprint={sprint} />
            ))
          ) : (
            <div className="col-span-full text-[13px] text-muted-foreground">
              No hay sprints planificados todavía.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SprintCard({ sprint }: { sprint: Sprint }) {
  const pct = sprint.taskCount
    ? Math.round((sprint.completedCount / sprint.taskCount) * 100)
    : 0;

  return (
    <div className="bg-sidebar-bg border border-panel-border rounded-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-foreground">
            {sprint.name}
          </h3>
          <span
            className={cn(
              "px-2 py-0.5 text-[10px] rounded-sm border uppercase",
              STATUS_BADGE[sprint.status],
            )}
          >
            {STATUS_LABEL[sprint.status]}
          </span>
        </div>
        <button className="p-1 hover:bg-list-hover rounded-sm transition-colors">
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>
            {new Date(sprint.startDate).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })}{" "}
            -{" "}
            {new Date(sprint.endDate).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-1.5 bg-editor rounded-sm overflow-hidden">
          <div
            className="h-full bg-status-done transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {pct}%
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
        <span>
          {sprint.completedCount}/{sprint.taskCount} tareas
        </span>
      </div>
    </div>
  );
}
