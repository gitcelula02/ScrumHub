import { useMemo } from "react";
import { useTasks } from "@/features/backlog";
import { epicService } from "../services/epicService";
import type { Task } from "@/types";

/**
 * @hook useEpicDetail
 * Fetches a single epic and its children by epicId.
 * Law 8: All queries are project-scoped for cache isolation.
 *
 * @param {string} projectId - The project identifier for cache scoping
 * @param {string} epicId - The epic task ID
 * @returns {Object} Epic, children array, loading state, error
 */
export function useEpicDetail(projectId: string, epicId: string) {
  const { data: tasks = [], isLoading, error } = useTasks(projectId);

  const epic = useMemo(
    () => tasks.find((t) => t.id === epicId && t.type === "EPIC"),
    [tasks, epicId],
  );

  const children = useMemo(
    () => epicService.getEpicChildren(tasks, epicId),
    [tasks, epicId],
  );

  return {
    epic,
    children,
    isLoading,
    error,
  };
}
