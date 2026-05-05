import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backlogService } from '../services/backlogService';
import type { Ticket } from '@/types';

/**
 * @hook useTickets
 * Manages the state and fetching of all tickets in the project backlog.
 */
export function useTickets() {
  return useQuery<Ticket[]>({
    queryKey: ['tickets'],
    queryFn: () => backlogService.getTickets(),
  });
}

/**
 * @hook useTicket
 * Fetches a single ticket by its unique identifier.
 */
export function useTicket(id: string) {
  return useQuery<Ticket>({
    queryKey: ['tickets', id],
    queryFn: () => backlogService.getTicketById(id),
    enabled: !!id,
  });
}

/**
 * @hook useUpdateTicket
 * Mutation for updating ticket properties with automatic cache invalidation.
 */
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ticket> }) =>
      backlogService.updateTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
    },
  });
}
