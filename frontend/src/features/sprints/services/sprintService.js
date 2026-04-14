import { apiClient } from '@/services/apiClient';

/**
 * @service sprintService
 * @description All API calls for the Sprints feature.
 *
 * NOTE: Sprint endpoints are not yet implemented in the backend.
 * Calls will fail gracefully — see docs/ENDPOINTS.md for required endpoints.
 *
 * Response shape contract:
 *   Sprint: { id, name, startDate, endDate, status, projectId, tasks[] }
 */
export const sprintService = {
  /**
   * Returns all sprints for a project.
   * @param {string} projectId
   * @returns {Promise<Object[]>}
   */
  async getByProject(projectId) {
    return apiClient.get(`/projects/${projectId}/sprints`);
  },

  /**
   * Creates a new sprint under a project.
   * @param {string} projectId
   * @param {{ name: string, startDate: string, endDate: string }} data
   * @returns {Promise<Object>}
   */
  async create(projectId, data) {
    return apiClient.post(`/projects/${projectId}/sprints`, data);
  },

  /**
   * Updates a sprint (name, dates, status).
   * @param {string} sprintId
   * @param {Partial<Object>} data
   * @returns {Promise<Object>}
   */
  async update(sprintId, data) {
    return apiClient.put(`/sprints/${sprintId}`, data);
  },

  /**
   * Assigns tasks to a sprint.
   * @param {string} sprintId
   * @param {string[]} taskIds
   * @returns {Promise<Object>}
   */
  async assignTasks(sprintId, taskIds) {
    return apiClient.post(`/sprints/${sprintId}/tasks`, { taskIds });
  },
};
