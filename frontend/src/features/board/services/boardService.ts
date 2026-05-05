import { apiClient } from '@/services/apiClient';
import type { Task, TaskStatus } from '@/types';

/**
 * @service BoardService
 * Manages Kanban board operations and state transitions.
 */
export const boardService = {
  /**
   * Moves a task to a new status.
   */
  moveTask: async (taskId: string, status: TaskStatus): Promise<Task> => {
    return apiClient.patch<Task>(`/tasks/${taskId}`, { status });
  },

  /**
   * Fetches tasks filtered by status for a specific column.
   */
  getColumnTasks: async (status: TaskStatus): Promise<Task[]> => {
    return apiClient.get<Task[]>(`/tasks?status=${status}`);
  }
};
