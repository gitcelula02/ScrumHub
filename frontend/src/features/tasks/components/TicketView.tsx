import { CalendarClock, Tag, GitBranch, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTicket } from "@/features/backlog";
import type { Ticket } from "@/types";

interface TicketViewProps {
  ticketId: string;
}

const PRIORITY_BADGE = {
  high: "bg-priority-high/20 text-priority-high border-priority-high/40",
  medium: "bg-priority-med/20 text-priority-med border-priority-med/40",
  low: "bg-priority-low/20 text-priority-low border-priority-low/40",
  urgent: "bg-destructive/20 text-destructive border-destructive/40",
} as const;

/**
 * @component TicketView
 * Smart feature component for viewing and managing a single ticket.
 * Automatically fetches ticket data based on the provided ticketId.
 */
export function TicketView({ ticketId }: TicketViewProps) {
  const { data: ticket, isLoading, error } = useTicket(ticketId);

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-muted-foreground font-mono">Cargando ticket...</div>;
  }

  if (error || !ticket) {
    return <div className="h-full flex items-center justify-center text-destructive font-mono">Error al cargar el ticket.</div>;
  }

  return (
    <div className="h-full overflow-auto bg-editor">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-2 mb-4 text-xs">
          <span className="font-mono text-muted-foreground">{ticket.project}</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-mono text-muted-foreground">{ticket.epic}</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-mono text-status-bar">{ticket.id}</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-6">{ticket.title}</h1>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className={cn("px-2 py-0.5 rounded-sm text-[11px] font-mono uppercase border", PRIORITY_BADGE[ticket.priority as keyof typeof PRIORITY_BADGE] || "border-panel-border")}>
            {ticket.priority}
          </span>
          <span className="px-2 py-0.5 rounded-sm text-[11px] font-mono uppercase border border-panel-border text-muted-foreground">
            {ticket.status}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-mono border border-panel-border text-muted-foreground">
            <GitBranch size={11} /> feature/{ticket.id.toLowerCase()}
          </span>
        </div>

        <section className="mb-8">
          <h2 className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-2">
            Descripción
          </h2>
          <p className="text-foreground/90 leading-relaxed">{ticket.description}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-2">
            <MessageSquare size={12} /> Comentarios
          </h2>
          <div className="space-y-3">
            {ticket.comments.map((c, i) => (
              <div key={i} className="border border-panel-border rounded-sm p-3 bg-sidebar-bg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[9px] font-semibold flex items-center justify-center">
                    {c.author.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <span className="text-[12px] text-foreground">{c.author}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{c.when}</span>
                </div>
                <p className="text-[13px] text-foreground/90 pl-7">{c.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * @component PropertiesPanel
 * Feature component for the ticket properties sidebar.
 */
export function PropertiesPanel({ ticketId }: { ticketId: string }) {
  const { data: ticket } = useTicket(ticketId);

  if (!ticket) return null;

  return (
    <aside className="w-72 bg-sidebar-bg border-l border-panel-border overflow-auto">
      <div className="h-9 px-4 flex items-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase border-b border-panel-border">
        Propiedades
      </div>
      <div className="p-4 space-y-5 text-[13px]">
        <Field label="Asignado a">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center">
              {ticket.assignee.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            <span>{ticket.assignee}</span>
          </div>
        </Field>
        <Field label="Reportado por">{ticket.reporter}</Field>
        <Field label="Sprint"><span className="font-mono">{ticket.sprint}</span></Field>
        <Field label="Story points"><span className="font-mono">{ticket.points}</span></Field>
        <Field label="Vencimiento">
          <div className="flex items-center gap-1.5 font-mono text-[12px]">
            <CalendarClock size={12} /> {ticket.due}
          </div>
        </Field>
        <Field label="Etiquetas">
          <div className="flex flex-wrap gap-1">
            {ticket.labels.map((l) => (
              <span
                key={l}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono border border-panel-border rounded-sm text-muted-foreground"
              >
                <Tag size={10} /> {l}
              </span>
            ))}
          </div>
        </Field>
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-1.5">
        {label}
      </div>
      <div className="text-foreground">{children}</div>
    </div>
  );
}
