import { useMemo } from "react";
import {
  Sparkles,
  AlertTriangle,
  Clock,
  TrendingUp,
  Mail,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/features/backlog";
import type { Task } from "@/types";

interface AINotificationsProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

type Severity = "critical" | "warning" | "info";

interface Alert {
  id: string;
  severity: Severity;
  icon: React.ElementType;
  title: string;
  detail: string;
  taskId?: string;
  action: string;
}

const SEV_COLOR: Record<Severity, string> = {
  critical: "border-l-priority-high text-priority-high",
  warning: "border-l-priority-med text-priority-med",
  info: "border-l-status-bar text-status-bar",
};

function buildAlerts(tasks: Task[]): Alert[] {
  const now = new Date("2026-04-29");
  const alerts: Alert[] = [];

  for (const t of tasks) {
    if (t.status === "done") continue;
    const due = new Date(t.due);
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / 86400000);

    if (daysLeft < 0) {
      alerts.push({
        id: `overdue-${t.id}`,
        severity: "critical",
        icon: AlertTriangle,
        title: `${t.id} vencido hace ${Math.abs(daysLeft)}d`,
        detail: `«${t.title}» asignado a ${t.assignee}. Sugiero reasignar o reprogramar.`,
        taskId: t.id,
        action: "Notificar al equipo",
      });
    } else if (daysLeft <= 2 && t.priority === "high") {
      alerts.push({
        id: `risk-${t.id}`,
        severity: "warning",
        icon: Clock,
        title: `${t.id} vence en ${daysLeft}d`,
        detail: `Prioridad alta. ${t.assignee} aún en estado "${t.status}".`,
        taskId: t.id,
        action: "Enviar recordatorio",
      });
    }
  }

  const wip = tasks.filter((t) => t.status === "in-progress").length;
  if (wip >= 3) {
    alerts.push({
      id: "wip-limit",
      severity: "warning",
      icon: TrendingUp,
      title: `WIP elevado: ${wip} tareas en progreso`,
      detail:
        "El equipo está sobrecargado. Considera mover tareas a revisión antes de tomar nuevas.",
      action: "Ver sugerencias",
    });
  }

  alerts.push({
    id: "ai-summary",
    severity: "info",
    icon: Sparkles,
    title: "Resumen IA del Sprint 24",
    detail: `${tasks.filter((t) => t.status === "done").length}/${tasks.length} tareas completadas. Riesgo: alertas de auth y notificaciones.`,
    action: "Ver reporte",
  });

  return alerts;
}

/**
 * @component AINotifications
 * Feature component for AI notifications and risk analysis.
 * Automatically fetches current tasks to generate insights.
 */
export function AINotifications({
  projectId,
  open,
  onClose,
}: AINotificationsProps) {
  const { data: tasks = [] } = useTasks(projectId);
  const alerts = useMemo(() => buildAlerts(tasks), [tasks]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="relative w-[420px] max-w-[92vw] h-full bg-sidebar-bg border-l border-panel-border flex flex-col shadow-2xl"
      >
        <div className="h-10 flex items-center justify-between px-4 border-b border-panel-border">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-status-bar" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
              Notificaciones IA
            </span>
            <span className="font-mono text-[11px] text-muted-foreground bg-editor px-1.5 rounded">
              {alerts.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-list-hover text-muted-foreground"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-2">
          {alerts.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                className={cn(
                  "bg-editor border border-panel-border border-l-2 rounded-sm p-3",
                  SEV_COLOR[a.severity as keyof typeof SEV_COLOR],
                )}
              >
                <div className="flex items-start gap-2 mb-1">
                  <Icon size={14} className="mt-0.5 shrink-0" />
                  <h3 className="text-[13px] font-semibold text-foreground flex-1 leading-snug">
                    {a.title}
                  </h3>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed mb-2 pl-6">
                  {a.detail}
                </p>
                <div className="flex items-center gap-2 pl-6">
                  <button className="flex items-center gap-1.5 h-6 px-2 text-[11px] bg-status-bar text-status-bar-fg rounded-sm hover:opacity-90">
                    <Mail size={11} /> {a.action}
                  </button>
                  {a.taskId && (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {a.taskId}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-panel-border p-3 text-[11px] text-muted-foreground font-mono">
          IA monitorea cada 15min. Próximo análisis:{" "}
          <span className="text-status-bar">14:42</span>
        </div>
      </aside>
    </div>
  );
}
