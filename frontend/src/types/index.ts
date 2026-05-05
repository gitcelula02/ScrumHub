/**
 * Global TypeScript definitions for ScrumHub.
 */

export type ID = string;

export interface Entity {
  id: ID;
  createdAt?: string;
  updatedAt?: string;
}

export type TicketStatus = 'todo' | 'in-progress' | 'review' | 'done';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Comment {
  author: string;
  when: string;
  body: string;
}

export interface Ticket extends Entity {
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  assignee: string;
  reporter: string;
  project: string;
  epic: string;
  sprint: string;
  points: number;
  due: string;
  labels: string[];
  comments: Comment[];
}

export interface Project extends Entity {
  name: string;
  description: string;
  color?: string;
}

export interface Tab {
  id: string;
  label: string;
  kind: 'dashboard' | 'ticket' | 'epics' | 'permissions';
  ticketId?: string;
}
