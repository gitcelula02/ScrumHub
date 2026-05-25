import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCreateBacklog, useBacklogTypes, useCreateBacklogType } from "../hooks/useBacklogs";

const BACKLOG_TYPES = [
  { value: "development", label: "Development" },
  { value: "qa_testing", label: "QA/Testing" },
  { value: "strategic", label: "Strategic" },
  { value: "custom", label: "Custom" },
] as const;

interface CreateBacklogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onBacklogCreated: (backlogId: number) => void;
}

export function CreateBacklogModal({
  open,
  onOpenChange,
  projectId,
  onBacklogCreated,
}: CreateBacklogModalProps) {
  const { mutateAsync: createBacklog, isPending } = useCreateBacklog(projectId);
  const { data: existingTypes = [] } = useBacklogTypes();
  const { mutateAsync: createBacklogType } = useCreateBacklogType();

  const [name, setName] = useState("");
  const [type, setType] = useState<string>("development");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6B5CFF");
  const [customTypeMode, setCustomTypeMode] = useState<"select" | "create">("select");
  const [selectedCustomTypeId, setSelectedCustomTypeId] = useState<string>("");
  const [customTypeName, setCustomTypeName] = useState("");
  const [customTypeDesc, setCustomTypeDesc] = useState("");

  const resetForm = () => {
    setName("");
    setType("development");
    setDescription("");
    setColor("#6B5CFF");
    setCustomTypeMode("select");
    setSelectedCustomTypeId("");
    setCustomTypeName("");
    setCustomTypeDesc("");
  };

  const handleSubmit = async () => {
    const payload: Record<string, unknown> = {
      name,
      type,
      description,
      color,
    };

    if (type === "custom") {
      if (customTypeMode === "create") {
        const newType = await createBacklogType({
          name: customTypeName,
          description: customTypeDesc,
        });
        payload.custom_type_id = newType.id;
      } else {
        payload.custom_type_id = Number(selectedCustomTypeId);
      }
    }

    const backlog = await createBacklog(payload as never);
    resetForm();
    onOpenChange(false);
    onBacklogCreated(backlog.id as unknown as number);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-sidebar-bg border-panel-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Backlog</DialogTitle>
          <DialogDescription>
            Add a new backlog to organize tasks within this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Documentation Backlog"
              className="w-full h-9 px-3 text-[13px] bg-input border border-panel-border rounded-sm text-foreground outline-none focus:border-status-bar transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-9 px-3 text-[13px] bg-input border border-panel-border rounded-sm text-foreground outline-none focus:border-status-bar transition-colors"
            >
              {BACKLOG_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {type === "custom" && (
            <div className="space-y-3 pl-3 border-l-2 border-status-bar/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomTypeMode("select")}
                  className={`px-2 h-6 text-[11px] rounded-sm transition-colors ${
                    customTypeMode === "select"
                      ? "bg-status-bar text-status-bar-fg"
                      : "text-muted-foreground hover:text-foreground hover:bg-list-hover"
                  }`}
                >
                  Select existing
                </button>
                <button
                  type="button"
                  onClick={() => setCustomTypeMode("create")}
                  className={`px-2 h-6 text-[11px] rounded-sm transition-colors ${
                    customTypeMode === "create"
                      ? "bg-status-bar text-status-bar-fg"
                      : "text-muted-foreground hover:text-foreground hover:bg-list-hover"
                  }`}
                >
                  Create new
                </button>
              </div>

              {customTypeMode === "select" ? (
                <div>
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">
                    Custom Type
                  </label>
                  <select
                    value={selectedCustomTypeId}
                    onChange={(e) => setSelectedCustomTypeId(e.target.value)}
                    className="w-full h-9 px-3 text-[13px] bg-input border border-panel-border rounded-sm text-foreground outline-none focus:border-status-bar transition-colors"
                  >
                    <option value="">Select a type...</option>
                    {existingTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {t.description}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">
                      Type Name
                    </label>
                    <input
                      type="text"
                      value={customTypeName}
                      onChange={(e) => setCustomTypeName(e.target.value)}
                      placeholder="e.g. Documentation"
                      className="w-full h-9 px-3 text-[13px] bg-input border border-panel-border rounded-sm text-foreground outline-none focus:border-status-bar transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">
                      Type Description
                    </label>
                    <input
                      type="text"
                      value={customTypeDesc}
                      onChange={(e) => setCustomTypeDesc(e.target.value)}
                      placeholder="e.g. Docs and technical writing tasks"
                      className="w-full h-9 px-3 text-[13px] bg-input border border-panel-border rounded-sm text-foreground outline-none focus:border-status-bar transition-colors"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this backlog for?"
              rows={2}
              className="w-full px-3 py-2 text-[13px] bg-input border border-panel-border rounded-sm text-foreground outline-none focus:border-status-bar transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-9 h-9 rounded-sm border border-panel-border bg-transparent cursor-pointer"
              />
              <span className="font-mono text-[12px] text-muted-foreground">
                {color}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            className="px-4 h-8 text-[12px] text-muted-foreground hover:text-foreground transition-colors rounded-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="flex items-center gap-2 px-4 h-8 text-[12px] bg-status-bar text-status-bar-fg rounded-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <Plus size={14} />
            {isPending ? "Creating..." : "Create Backlog"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
