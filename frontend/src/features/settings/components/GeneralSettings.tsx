import { useState } from "react";
import { Settings } from "lucide-react";
import { useEntityTheme } from "@/hooks/useEntityTheme";

interface GeneralSettingsProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
  projectColor?: string;
}

const COLORS = [
  "#6B5CFF",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
];

/**
 * @component GeneralSettings
 * Form for editing project-level metadata (name, description, color).
 */
export function GeneralSettings({
  projectId,
  projectName,
  projectDescription,
  projectColor,
}: GeneralSettingsProps) {
  const [name, setName] = useState(projectName);
  const [description, setDescription] = useState(projectDescription);
  const [color, setColor] = useState(projectColor || COLORS[0]);

  const theme = useEntityTheme(projectId, color);

  const handleSave = () => {
    console.log("Saving project settings:", { name, description, color });
  };

  return (
    <div className="h-full overflow-auto bg-editor p-6">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Settings size={18} className="text-status-bar" /> Configuración
          general
        </h1>
        <span className="font-mono text-xs text-muted-foreground">
          {projectId}
        </span>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="bg-sidebar-bg border border-panel-border rounded-sm p-4 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-2">
              Nombre del proyecto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 text-[13px] bg-input border border-panel-border rounded-sm text-foreground outline-none focus:border-status-bar transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-[13px] bg-input border border-panel-border rounded-sm text-foreground outline-none focus:border-status-bar transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-2">
              Color del proyecto
            </label>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-sm border border-panel-border shrink-0"
                style={{ backgroundColor: "var(--entity-solid)" }}
              />
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-sm border-2 transition-all"
                    style={{ backgroundColor: c }}
                    data-selected={color === c}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 h-9 text-[13px] bg-status-bar text-status-bar-fg rounded-sm hover:opacity-90 transition-opacity"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
