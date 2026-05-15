import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { backlogService } from "../services/backlogService";
import type { Backlog, BacklogType } from "@/types";

/**
 * @hook useBacklogs
 * Fetches all backlogs for a given project.
 * Query key: ['project', projectId, 'backlogs']
 *
 * @param {string} projectId - The project identifier
 */
export function useBacklogs(projectId: string) {
  return useQuery<Backlog[]>({
    queryKey: ["project", projectId, "backlogs"],
    queryFn: () => backlogService.getBacklogs(projectId),
    enabled: !!projectId,
  });
}

/**
 * @hook useCreateBacklog
 * Mutation to create a new backlog within a project.
 * Invalidates the backlogs query on success.
 *
 * @param {string} projectId - The project identifier
 */
export function useCreateBacklog(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Backlog>) =>
      backlogService.createBacklog(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId, "backlogs"],
      });
    },
  });
}

/**
 * @hook useBacklogTypes
 * Fetches all registered backlog types (for custom type selection).
 */
export function useBacklogTypes() {
  return useQuery<BacklogType[]>({
    queryKey: ["backlog-types"],
    queryFn: () => backlogService.getBacklogTypes(),
  });
}

/**
 * @hook useCreateBacklogType
 * Mutation to create a new backlog type.
 * Invalidates the backlog-types query on success.
 */
export function useCreateBacklogType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      backlogService.createBacklogType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["backlog-types"],
      });
    },
  });
}
