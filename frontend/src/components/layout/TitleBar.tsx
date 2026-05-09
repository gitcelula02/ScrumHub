import { Search } from "lucide-react";

interface TitleBarProps {
  onPalette: () => void;
}

/**
 * @component TitleBar
 * VS Code-style global title bar with command palette access.
 */
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";

export function TitleBar({ onPalette }: TitleBarProps) {
  const { user } = useAuthSession();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <header className="h-8 bg-titlebar border-b border-panel-border flex items-center px-3 select-none">
      <div className="flex items-center gap-2 w-48">
        <div className="w-4 h-4 rounded-sm bg-status-bar flex items-center justify-center text-[9px] font-bold text-white">
          S
        </div>
        <span className="text-[12px] text-foreground">ScrumHub</span>
      </div>
      <div className="flex-1 flex justify-center">
        <button
          onClick={onPalette}
          className="flex items-center gap-2 h-6 w-[420px] max-w-[60%] px-2 bg-input border border-panel-border rounded-sm text-[12px] text-muted-foreground hover:border-status-bar/60"
        >
          <Search size={12} />
          <span className="truncate">
            ScrumHub — buscar tareas, ejecutar comandos IA…
          </span>
          <span className="ml-auto font-mono text-[10px] px-1 border border-panel-border rounded-sm">
            Ctrl+Shift+P
          </span>
        </button>
      </div>
      <div className="w-48 flex justify-end items-center gap-2 text-[12px] text-muted-foreground">
        <span className="font-mono">v0.1.0</span>
        <div className="w-6 h-6 rounded-sm bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center border border-panel-border">
          {initials}
        </div>
      </div>
    </header>
  );
}
