import { apiClient } from '@/services/apiClient';
import type { Ticket } from '@/types';

/**
 * @service BacklogService
 * Handles API interactions for the project backlog and tickets.
 */
export const backlogService = {
  /**
   * Fetches all tickets for the backlog.
   */
  getTickets: async (): Promise<Ticket[]> => {
    return apiClient.get<Ticket[]>('/tickets');
  },

  /**
   * Fetches a single ticket by ID.
   */
  getTicketById: async (id: string): Promise<Ticket> => {
    return apiClient.get<Ticket>(`/tickets/${id}`);
  },

  /**
   * Updates an existing ticket.
   */
  updateTicket: async (id: string, data: Partial<Ticket>): Promise<Ticket> => {
    return apiClient.patch<Ticket>(`/tickets/${id}`, data);
  },

  /**
   * Creates a new ticket.
   */
  createTicket: async (data: Partial<Ticket>): Promise<Ticket> => {
    return apiClient.post<Ticket>('/tickets', data);
  }
};
