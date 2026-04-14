import { apiClient } from '@/services/apiClient';

/**
 * @service calendarService
 * @description API calls for the Calendar feature.
 * Reuses the existing tasks endpoint and filters by dueDate client-side.
 *
 * NOTE: A dedicated /api/tasks?month=&year= query endpoint is missing in the backend.
 * See docs/ENDPOINTS.md for the full list of missing endpoints.
 */
export const calendarService = {
  /**
   * Returns all tasks for a project to be rendered on the calendar.
   * @param {string} projectId
   * @returns {Promise<Object[]>}
   */
  async getTasksForCalendar(projectId) {
    return apiClient.get(`/tasks/project/${projectId}`);
  },

  /**
   * Creates a new task from a calendar date selection.
   * @param {{ title: string, dueDate: string, projectId: string, priority?: string }} data
   * @returns {Promise<Object>}
   */
  async createTask(data) {
    return apiClient.post('/tasks', data);
  },
};
