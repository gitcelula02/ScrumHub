import { apiClient } from '@/services/apiClient';
import type { Ticket, TicketStatus } from '@/types';

/**
 * @service BoardService
 * Manages Kanban board operations and state transitions.
 */
export const boardService = {
  /**
   * Moves a ticket to a new status.
   */
  moveTicket: async (ticketId: string, status: TicketStatus): Promise<Ticket> => {
    return apiClient.patch<Ticket>(`/tickets/${ticketId}`, { status });
  },

  /**
   * Fetches tickets filtered by status for a specific column.
   */
  getColumnTickets: async (status: TicketStatus): Promise<Ticket[]> => {
    return apiClient.get<Ticket[]>(`/tickets?status=${status}`);
  }
};
