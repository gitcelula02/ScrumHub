import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { GeneralSettings, PermissionsView } from "@/features/settings";

type Tab = "general" | "permissions";

/**
 * @page SettingsPage
 * Project-scoped settings view with tabbed interface.
 * Thin orchestrator — delegates to feature components.
 */
export function SettingsPage() {
  const { projectId } = useParams({
    from: "/app/projects/$projectId/settings",
  });
  const [activeTab, setActiveTab] = useState<Tab>("general");

  return (
    <div className="h-full overflow-auto bg-editor">
      <div className="border-b border-panel-border px-4">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 h-10 text-[13px] font-medium transition-colors ${
              activeTab === "general"
                ? "text-foreground border-b-2 border-status-bar -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`px-4 h-10 text-[13px] font-medium transition-colors ${
              activeTab === "permissions"
                ? "text-foreground border-b-2 border-status-bar -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Permisos
          </button>
        </div>
      </div>

      {activeTab === "general" && (
        <GeneralSettings
          projectId={projectId}
          projectName="Mi Proyecto"
          projectDescription="Descripción del proyecto"
        />
      )}

      {activeTab === "permissions" && <PermissionsView />}
    </div>
  );
}
