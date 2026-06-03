import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } =
    useTasks(projectId);
  const {
    data: epic,
    isLoading: epicLoading,
    error: epicError,
  } = useQuery<Task | undefined>({
    queryKey: ["project", projectId, "epic", epicId],
    queryFn: () => epicService.getEpic(epicId),
    enabled: !!epicId,
  });

  const children = useMemo(
    () => epicService.getEpicChildren(tasks, epicId),
    [tasks, epicId],
  );

  return {
    epic,
    children,
    isLoading: tasksLoading || epicLoading,
    error: tasksError || epicError,
  };
}
