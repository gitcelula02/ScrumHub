import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTickets } from "@/features/backlog";
import { useMoveTicket } from "@/features/board";
import type { Ticket, TicketStatus } from "@/types";

interface BoardProps {
  onOpenTicket: (t: Ticket) => void;
}

const COLUMNS: { id: TicketStatus; label: string }[] = [
  { id: "todo", label: "Por hacer" },
  { id: "in-progress", label: "En progreso" },
  { id: "review", label: "En revisión" },
  { id: "done", label: "Hecho" },
];

const PRIORITY_DOT = {
  high: "bg-priority-high",
  medium: "bg-priority-med",
  low: "bg-priority-low",
  urgent: "bg-destructive",
} as const;

/**
 * @component Board
 * Feature component for the Kanban board.
 * Connects to useTickets and useMoveTicket for data and state transitions.
 */
export function Board({ onOpenTicket }: BoardProps) {
  const { data: tickets = [], isLoading } = useTickets();
  const { mutate: moveTicket } = useMoveTicket();
  
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TicketStatus | null>(null);

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-muted-foreground font-mono">Cargando tablero...</div>;
  }

  return (
    <div className="h-full overflow-auto bg-editor p-6">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-xl font-semibold text-foreground">Tablero · Sprint 24</h1>
        <span className="font-mono text-xs text-muted-foreground">
          {tickets.length} tickets · branch <span className="text-status-bar">main</span>
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = tickets.filter((t) => t.status === col.id);
          const isOver = overCol === col.id;
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (overCol !== col.id) setOverCol(col.id);
              }}
              onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) moveTicket({ id: dragId, status: col.id });
                setDragId(null);
                setOverCol(null);
              }}
              className={cn(
                "bg-sidebar-bg border rounded-sm flex flex-col min-h-[200px] transition-colors",
                isOver ? "border-status-bar" : "border-panel-border"
              )}
            >
              <div className="flex items-center justify-between px-3 h-9 border-b border-panel-border">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                    {col.label}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground bg-editor px-1.5 rounded">
                    {items.length}
                  </span>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <Plus size={14} />
                </button>
              </div>
              <div className="p-2 flex flex-col gap-2 flex-1">
                {items.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    onClick={() => onOpenTicket(t)}
                    className={cn(
                      "cursor-grab active:cursor-grabbing text-left bg-editor hover:bg-list-hover border border-panel-border hover:border-status-bar/60 transition-colors rounded-sm p-3",
                      dragId === t.id && "opacity-40"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-[11px] text-muted-foreground">{t.id}</span>
                      <MoreHorizontal size={14} className="text-muted-foreground" />
                    </div>
                    <p className="text-[13px] text-foreground leading-snug mb-3">{t.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", PRIORITY_DOT[t.priority as keyof typeof PRIORITY_DOT] || "bg-muted")} />
                        <span className="text-[11px] text-muted-foreground capitalize">
                          {t.priority}
                        </span>
                      </div>
                      <div
                        className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center"
                        title={t.assignee}
                      >
                        {t.assignee
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-[11px] text-muted-foreground/60 italic py-6">
                    Suelta aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
