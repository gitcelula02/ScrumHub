import { X, LayoutDashboard, FileText, Layers, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tab } from "@/types";

interface Props {
  tabs: Tab[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

const KIND_ICON = {
  dashboard: LayoutDashboard,
  task: FileText,
  epics: Layers,
  permissions: Shield,
} as const;

export function Tabs({ tabs, activeId, onSelect, onClose }: Props) {
  return (
    <div className="flex bg-tab-inactive border-b border-panel-border h-9 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const Icon = KIND_ICON[tab.kind as keyof typeof KIND_ICON];
        return (
          <div
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "group flex items-center gap-2 pl-3 pr-2 h-full border-r border-panel-border cursor-pointer text-[13px] shrink-0",
              isActive
                ? "bg-tab-active text-foreground border-t-2 border-t-tab-border -mt-px"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={14} className={isActive ? "text-status-bar" : ""} />
            <span className={tab.kind === "task" ? "font-mono text-[12px]" : ""}>
              {tab.label}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.id);
              }}
              className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-list-hover opacity-0 group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
