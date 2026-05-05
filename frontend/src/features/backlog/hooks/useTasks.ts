import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backlogService } from '../services/backlogService';
import type { Task } from '@/types';

/**
 * @hook useTasks
 * Manages the state and fetching of all tasks in the project backlog.
 */
export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => backlogService.getTasks(),
  });
}

/**
 * @hook useTask
 * Fetches a single task by its unique identifier.
 */
export function useTask(id: string) {
  return useQuery<Task>({
    queryKey: ['tasks', id],
    queryFn: () => backlogService.getTaskById(id),
    enabled: !!id,
  });
}

/**
 * @hook useUpdateTask
 * Mutation for updating task properties with automatic cache invalidation.
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      backlogService.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
    },
  });
}
