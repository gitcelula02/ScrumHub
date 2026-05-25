import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/boardService";
import type { TaskStatus } from "@/types";

/**
 * @hook useMoveTask
 * Handles task state transitions on the Kanban board with optimistic updates support.
 * Law 8: Cache invalidation uses project-scoped keys for isolation.
 *
 * @param {string} projectId - The project identifier for cache scoping
 * @returns {UseMutation} Mutation for moving tasks
 */
export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      boardService.moveTask(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId, "tasks"],
      });
    },
  });
}
