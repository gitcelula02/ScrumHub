import { Board } from "@/features/board/components/Board";
import type { Task } from "@/types";

/**
 * @page DashboardPage
 * Main workspace dashboard showing the Kanban board.
 * Thin orchestrator — delegates to feature components.
 */
export function DashboardPage() {
  return <Board onOpenTask={(task: Task) => {
    // TODO: Open task in detail view
    console.log("Open task:", task.id);
  }} />;
}