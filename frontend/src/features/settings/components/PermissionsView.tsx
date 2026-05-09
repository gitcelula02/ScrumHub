import { useState } from "react";
import { Shield, UserPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "admin" | "maintainer" | "developer" | "viewer";

interface Member {
  name: string;
  email: string;
  role: Role;
  permissions: Record<string, boolean>;
}

const PERMS = [
  { key: "read", label: "Leer" },
  { key: "write", label: "Escribir tareas" },
  { key: "deploy", label: "Desplegar" },
  { key: "admin", label: "Administrar" },
] as const;

const ROLE_BADGE: Record<Role, string> = {
  admin: "bg-priority-high/20 text-priority-high border-priority-high/40",
  maintainer: "bg-status-bar/20 text-status-bar border-status-bar/40",
  developer: "bg-status-done/20 text-status-done border-status-done/40",
  viewer: "bg-muted text-muted-foreground border-panel-border",
};

const INITIAL: Member[] = [];

/**
 * @component PermissionsView
 * Administrative panel for managing team roles and granular permissions.
 * Currently uses local state, to be integrated with settingsService in future steps.
 */
export function PermissionsView() {
  const [members, setMembers] = useState<Member[]>(INITIAL);

  const togglePerm = (idx: number, key: string) => {
    setMembers((prev) =>
      prev.map((m, i) =>
        i === idx
          ? {
              ...m,
              permissions: { ...m.permissions, [key]: !m.permissions[key] },
            }
          : m,
      ),
    );
  };

  const setRole = (idx: number, role: Role) => {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, role } : m)));
  };

  return (
    <div className="h-full overflow-auto bg-editor p-6">
      <div className="mb-6 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield size={18} className="text-status-bar" /> Permisos del equipo
          </h1>
          <span className="font-mono text-xs text-muted-foreground">
            {members.length} miembros · scrumhub-core
          </span>
        </div>
        <button className="flex items-center gap-2 px-3 h-8 text-[12px] bg-status-bar text-status-bar-fg rounded-sm hover:opacity-90">
          <UserPlus size={14} /> Invitar
        </button>
      </div>

      <div className="bg-sidebar-bg border border-panel-border rounded-sm overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_repeat(4,minmax(0,90px))] gap-2 px-4 h-9 items-center border-b border-panel-border text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
          <span>Miembro</span>
          <span>Rol</span>
          {PERMS.map((p) => (
            <span key={p.key} className="text-center">
              {p.label}
            </span>
          ))}
        </div>
        {members.map((m, idx) => (
          <div
            key={m.email}
            className="grid grid-cols-[2fr_1fr_repeat(4,minmax(0,90px))] gap-2 px-4 h-12 items-center border-b border-panel-border last:border-b-0 hover:bg-list-hover"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center shrink-0">
                {m.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] truncate">{m.name}</div>
                <div className="font-mono text-[11px] text-muted-foreground truncate">
                  {m.email}
                </div>
              </div>
            </div>
            <select
              value={m.role}
              onChange={(e) => setRole(idx, e.target.value as Role)}
              className={cn(
                "h-7 px-2 text-[11px] font-mono uppercase rounded-sm border bg-transparent outline-none cursor-pointer",
                ROLE_BADGE[m.role as keyof typeof ROLE_BADGE] || "",
              )}
            >
              <option value="admin">admin</option>
              <option value="maintainer">maintainer</option>
              <option value="developer">developer</option>
              <option value="viewer">viewer</option>
            </select>
            {PERMS.map((p) => {
              const on = m.permissions[p.key];
              return (
                <div key={p.key} className="flex justify-center">
                  <button
                    onClick={() => togglePerm(idx, p.key)}
                    className={cn(
                      "w-5 h-5 rounded-sm border flex items-center justify-center transition-colors",
                      on
                        ? "bg-status-bar border-status-bar text-status-bar-fg"
                        : "border-panel-border bg-editor hover:border-status-bar/50",
                    )}
                  >
                    {on && <Check size={12} strokeWidth={3} />}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12px] text-muted-foreground font-mono">
        // Los permisos se evalúan vía{" "}
        <span className="text-status-bar">has_role(user, role)</span> en la base
        de datos.
      </p>
    </div>
  );
}
