import { useMemo } from "react";
import { useTasks } from "@/features/backlog";
import { epicService } from "../services/epicService";
import type { Task } from "@/types";

/**
 * @hook useEpics
 * Fetches and manages project epics using the hierarchical task structure.
 * Law 8: All queries are project-scoped for cache isolation.
 *
 * @param {string} projectId - The project identifier for cache scoping
 * @returns {Object} Epic list and child tasks mapped by epicId
 */
export function useEpics(projectId: string) {
  const { data: tasks = [], isLoading, error } = useTasks(projectId);

  const epics = useMemo(() => epicService.filterEpics(tasks), [tasks]);

  const epicChildren = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const epic of epics) {
      const children = epicService.getEpicChildren(tasks, epic.id);
      map.set(epic.id, children);
    }
    return map;
  }, [epics, tasks]);

  return {
    epics,
    epicChildren,
    isLoading,
    error,
  };
}
