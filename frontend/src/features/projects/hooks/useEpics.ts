import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTasks } from "@/features/backlog";
import { epicService } from "../services/epicService";
import type { Task } from "@/types";

/**
 * @hook useEpics
 * Fetches and manages project epics from the dedicated epic API.
 * Law 8: All queries are project-scoped for cache isolation.
 *
 * @param {string} projectId - The project identifier for cache scoping
 * @returns {Object} Epic list and child tasks mapped by epicId
 */
export function useEpics(projectId: string) {
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } =
    useTasks(projectId);
  const {
    data: epics = [],
    isLoading: epicsLoading,
    error: epicsError,
  } = useQuery<Task[]>({
    queryKey: ["project", projectId, "epics"],
    queryFn: () => epicService.getEpics(projectId),
  });

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
    isLoading: tasksLoading || epicsLoading,
    error: tasksError || epicsError,
  };
}
