import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backlogService } from '../services/backlogService';
import type { Task } from '@/types';

/**
 * @hook useTasks
 * Manages the state and fetching of all tasks in the project backlog.
 * Law 8: All queries are project-scoped for cache isolation.
 *
 * @param {string} projectId - The project identifier for cache scoping
 * @returns {UseQueryResult<Task[]>} Query result with task list
 */
export function useTasks(projectId: string) {
  return useQuery<Task[]>({
    queryKey: ['project', projectId, 'tasks'],
    queryFn: () => backlogService.getTasks(),
  });
}

/**
 * @hook useTask
 * Fetches a single task by its unique identifier.
 * Law 8: Task is project-scoped through the query key structure.
 *
 * @param {string} projectId - The project identifier for cache scoping
 * @param {string} taskId - The task identifier
 * @returns {UseQueryResult<Task>} Query result with task data
 */
export function useTask(projectId: string, taskId: string) {
  return useQuery<Task>({
    queryKey: ['project', projectId, 'tasks', taskId],
    queryFn: () => backlogService.getTaskById(taskId),
    enabled: !!taskId,
  });
}

/**
 * @hook useUpdateTask
 * Mutation for updating task properties with automatic cache invalidation.
 * Law 8: Cache invalidation uses project-scoped keys.
 *
 * @param {string} projectId - The project identifier for cache scoping
 * @returns {UseMutation} Mutation for updating tasks
 */
export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      backlogService.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'tasks', variables.id] });
    },
  });
}
