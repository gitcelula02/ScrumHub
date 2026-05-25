import { useEffect, useRef, useState } from "react";
import { Sparkles, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  {
    icon: Sparkles,
    label:
      "Crea una tarea: 'Refactor auth flow', alta prioridad, asígnalo a Ana",
  },
  { icon: Sparkles, label: "Mueve SCR-104 a En revisión y notifica a Carlos" },
  {
    icon: Sparkles,
    label: "Programa alerta diaria de tareas vencidas del Sprint 24",
  },
  { icon: Search, label: "Buscar tarea por ID o título…" },
  { icon: ArrowRight, label: "Ir a: Backlog" },
];

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = SUGGESTIONS.filter((s) =>
    s.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/30"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[640px] max-w-[90vw] bg-popover border border-panel-border shadow-2xl rounded-sm overflow-hidden"
      >
        <div className="flex items-center gap-2 px-3 h-10 border-b border-panel-border">
          <Sparkles size={16} className="text-status-bar" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pregunta a la IA o ejecuta un comando…"
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted-foreground"
          />
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 border border-panel-border rounded-sm text-muted-foreground">
            ESC
          </kbd>
        </div>
        <ul className="max-h-80 overflow-auto py-1">
          {filtered.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={i}>
                <button
                  onClick={onClose}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-list-active",
                  )}
                >
                  <Icon size={14} className="text-muted-foreground shrink-0" />
                  <span className="truncate">{s.label}</span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-3 text-[13px] text-muted-foreground">
              Sin resultados.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
