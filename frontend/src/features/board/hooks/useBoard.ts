import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services/boardService';
import type { TicketStatus } from '@/types';

/**
 * @hook useMoveTicket
 * Handles ticket state transitions on the Kanban board with optimistic updates support.
 */
export function useMoveTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      boardService.moveTicket(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
