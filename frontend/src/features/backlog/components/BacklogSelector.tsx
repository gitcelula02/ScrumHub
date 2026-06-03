import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useBacklogs } from "../hooks/useBacklogs";
import { CreateBacklogModal } from "./CreateBacklogModal";

interface BacklogSelectorProps {
  projectId: string;
}

function getSearchParam(key: string): string | undefined {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) || undefined;
}

function setSearchParam(key: string, value: string | undefined) {
  const params = new URLSearchParams(window.location.search);
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}

/**
 * @component BacklogSelector
 * Dropdown to select a backlog scope + "Create New Backlog" button.
 * Reads/writes the `backlogId` URL search param.
 * Renders inside the header of backlog-scoped project views.
 */
export function BacklogSelector({ projectId }: BacklogSelectorProps) {
  const navigate = useNavigate();
  const { data } = useBacklogs(projectId);
  const backlogs = Array.isArray(data) ? data : [];
  const [modalOpen, setModalOpen] = useState(false);

  const currentBacklogId = getSearchParam("backlogId");

  const handleChange = useCallback(
    (value: string) => {
      setSearchParam("backlogId", value || undefined);
    },
    [navigate],
  );

  const handleBacklogCreated = useCallback(
    (backlogId: number) => {
      setSearchParam("backlogId", String(backlogId));
    },
    [navigate],
  );

  return (
    <>
      <div className="flex items-center gap-2">
        <select
          value={currentBacklogId ?? ""}
          onChange={(e) => handleChange(e.target.value)}
          className="h-8 px-2 text-[12px] bg-input border border-panel-border rounded-sm text-foreground outline-none focus:border-status-bar transition-colors min-w-[140px]"
          title="Select backlog scope"
        >
          <option value="">All Backlogs</option>
          {backlogs.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 h-8 text-[12px] bg-status-bar text-status-bar-fg rounded-sm hover:opacity-90 transition-opacity"
          title="Create new backlog"
        >
          <Plus size={14} />
          Create New Backlog
        </button>
      </div>

      <CreateBacklogModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        projectId={projectId}
        onBacklogCreated={handleBacklogCreated}
      />
    </>
  );
}
