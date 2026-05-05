import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services/boardService';
import type { TaskStatus } from '@/types';

/**
 * @hook useMoveTask
 * Handles task state transitions on the Kanban board with optimistic updates support.
 */
export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      boardService.moveTask(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
