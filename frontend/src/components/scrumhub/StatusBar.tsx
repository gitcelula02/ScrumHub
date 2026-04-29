import { GitBranch, Check, Bell, Wifi, Sparkles } from "lucide-react";

interface Props {
  branch: string;
  onPalette: () => void;
  alertCount: number;
  onNotifications: () => void;
}

export function StatusBar({ branch, onPalette, alertCount, onNotifications }: Props) {
  return (
    <footer className="h-6 bg-status-bar text-status-bar-fg flex items-center text-[11px] font-mono select-none">
      <button className="h-full px-2 flex items-center gap-1 hover:bg-white/10">
        <GitBranch size={12} /> {branch}
      </button>
      <span className="h-full px-2 flex items-center gap-1">
        <Check size={12} /> 0 errores
      </span>
      <button
        onClick={onNotifications}
        className="h-full px-2 flex items-center gap-1 hover:bg-white/10"
      >
        <Bell size={12} /> {alertCount} alertas
      </button>
      <div className="flex-1" />
      <button
        onClick={onPalette}
        className="h-full px-2 flex items-center gap-1 hover:bg-white/10"
      >
        <Sparkles size={12} /> IA · Ctrl+Shift+P
      </button>
      <span className="h-full px-2 flex items-center gap-1">UTF-8</span>
      <span className="h-full px-2 flex items-center gap-1">Sprint 24</span>
      <span className="h-full px-2 flex items-center gap-1">
        <Wifi size={12} /> En línea
      </span>
    </footer>
  );
}
