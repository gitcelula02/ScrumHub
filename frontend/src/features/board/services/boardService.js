import { apiClient } from '@/services/apiClient';

/**
 * @service boardService
 * @description API calls for the Kanban board feature.
 * Uses the existing /api/tasks endpoints — board is a different view of the same task data.
 *
 * Response shape contract:
 *   Task: { id, title, status, priority, assignee, dueDate, epicId, sprintId }
 */
export const boardService = {
  /**
   * Returns all tasks for a project, used to populate board columns.
   * @param {string} projectId
   * @returns {Promise<Object[]>}
   */
  async getTasksByProject(projectId) {
    return apiClient.get(`/tasks/project/${projectId}`);
  },

  /**
   * Moves a task to a new status column.
   * @param {string} taskId
   * @param {{ status: string }} data
   * @returns {Promise<Object>}
   */
  async updateTaskStatus(taskId, data) {
    return apiClient.put(`/tasks/${taskId}`, data);
  },

  /**
   * Creates a new task from the board (quick create in a column).
   * @param {{ title: string, status: string, projectId: string, priority?: string }} data
   * @returns {Promise<Object>}
   */
  async createTask(data) {
    return apiClient.post('/tasks', data);
  },
};
