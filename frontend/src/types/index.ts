/**
 * Global TypeScript definitions for ScrumHub.
 */

export type ID = string;

export interface Entity {
  id: ID;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'med' | 'high' | 'urgent';

export type Status = 'todo' | 'in-progress' | 'review' | 'done';

export interface Project extends Entity {
  name: string;
  description: string;
  color?: string;
}
