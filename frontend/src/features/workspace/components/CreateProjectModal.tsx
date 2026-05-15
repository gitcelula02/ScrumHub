/**
 * @component CreateProjectModal
 * Modal dialog for creating a new project.
 *
 * COLOR CONTRACT:
 * - Consumes no entity colors (neutral UI)
 */

import { memo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProject } from "../hooks/useExplorerProjects";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string | null;
}

const DEFAULT_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const DEFAULT_ICONS = ["📁", "🚀", "💡", "🎯", "⚡", "🔮", "🏆", "💼"];

function CreateProjectModalComponent({ isOpen, onClose, folderId = null }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [icon, setIcon] = useState(DEFAULT_ICONS[0]);

  const createProject = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProject.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        goal: goal.trim(),
        color,
        icon,
        folder_id: folderId,
      },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          setGoal("");
          setColor(DEFAULT_COLORS[0]);
          setIcon(DEFAULT_ICONS[0]);
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Goal</label>
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What this project aims to achieve"
                rows={2}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${
                        color === c ? "border-foreground" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {DEFAULT_ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      className={`w-8 h-8 rounded flex items-center justify-center text-lg ${
                        icon === i ? "bg-list-active" : "bg-sidebar-bg"
                      }`}
                      onClick={() => setIcon(i)}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const CreateProjectModal = memo(CreateProjectModalComponent);