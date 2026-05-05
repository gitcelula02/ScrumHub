import { useState } from "react";
import { ChevronRight, ChevronDown, Circle, CircleDot, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types";
import type { ActivityView } from "@/components/layout/ActivityBar";

interface ExplorerProps {
  view: ActivityView;
  tickets: Ticket[];
  activeId: string | null;
  onOpen: (t: Ticket) => void;
}

const VIEW_TITLE: Record<ActivityView, string> = {
  projects: "EXPLORADOR",
  backlog: "BACKLOG",
  sprints: "SPRINTS",
  search: "BUSCAR",
  branches: "RAMAS",
  epics: "ÉPICAS",
  permissions: "EQUIPO",
};

const STATUS_ICON = {
  todo: Circle,
  "in-progress": CircleDot,
  review: AlertCircle,
  done: CheckCircle2,
} as const;

const STATUS_COLOR = {
  todo: "text-status-todo",
  "in-progress": "text-status-progress",
  review: "text-priority-med",
  done: "text-status-done",
} as const;

interface TreeNode {
  id: string;
  label: string;
  children: { id: string; label: string; tickets: Ticket[] }[];
}

function buildTree(tickets: Ticket[]): TreeNode[] {
  const map = new Map<string, Map<string, Ticket[]>>();
  for (const t of tickets) {
    if (!map.has(t.project)) map.set(t.project, new Map());
    const epics = map.get(t.project)!;
    if (!epics.has(t.epic)) epics.set(t.epic, []);
    epics.get(t.epic)!.push(t);
  }
  return Array.from(map.entries()).map(([project, epics]) => ({
    id: project,
    label: project,
    children: Array.from(epics.entries()).map(([epic, list]) => ({
      id: `${project}/${epic}`,
      label: epic,
      tickets: list,
    })),
  }));
}

/**
 * @component Explorer
 * Contextual sidebar that displays the file explorer, backlog, or other views based on activity.
 */
export function Explorer({ view, tickets, activeId, onOpen }: ExplorerProps) {
  const tree = buildTree(tickets);
  const [openProjects, setOpenProjects] = useState<Set<string>>(
    () => new Set(tree.map((n) => n.id))
  );
  const [openEpics, setOpenEpics] = useState<Set<string>>(
    () => new Set(tree.flatMap((n) => n.children.map((c) => c.id)))
  );

  const toggle = (set: Set<string>, setSet: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setSet(next);
  };

  return (
    <aside className="w-64 bg-sidebar-bg border-r border-panel-border flex flex-col select-none">
      <div className="h-9 px-4 flex items-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {VIEW_TITLE[view]}
      </div>
      <div className="flex-1 overflow-auto pb-2 text-[13px] text-sidebar-fg">
        {tree.map((proj) => {
          const projOpen = openProjects.has(proj.id);
          return (
            <div key={proj.id}>
              <button
                onClick={() => toggle(openProjects, setOpenProjects, proj.id)}
                className="w-full flex items-center gap-1 px-2 py-0.5 hover:bg-list-hover text-left"
              >
                {projOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="font-semibold uppercase text-[11px] tracking-wide">
                  {proj.label}
                </span>
              </button>
              {projOpen &&
                proj.children.map((epic) => {
                  const epicOpen = openEpics.has(epic.id);
                  return (
                    <div key={epic.id}>
                      <button
                        onClick={() => toggle(openEpics, setOpenEpics, epic.id)}
                        className="w-full flex items-center gap-1 pl-4 pr-2 py-0.5 hover:bg-list-hover text-left"
                      >
                        {epicOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span className="text-sidebar-fg/90">{epic.label}</span>
                      </button>
                      {epicOpen &&
                        epic.tickets.map((t) => {
                          const Icon = STATUS_ICON[t.status];
                          const isActive = t.id === activeId;
                          return (
                            <button
                              key={t.id}
                              onClick={() => onOpen(t)}
                              className={cn(
                                "w-full flex items-center gap-2 pl-9 pr-2 py-0.5 text-left hover:bg-list-hover",
                                isActive && "bg-list-active hover:bg-list-active"
                              )}
                            >
                              <Icon size={13} className={cn("shrink-0", STATUS_COLOR[t.status])} />
                              <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                                {t.id}
                              </span>
                              <span className="truncate">{t.title}</span>
                            </button>
                          );
                        })}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
