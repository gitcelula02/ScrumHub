import { apiClient } from '@/services/apiClient';

/**
 * @service projectService
 * @description All API calls for project management.
 *
 * Response shape contract:
 *   Project: { id, name, color, description, members[], createdAt }
 */
export const projectService = {
  /**
   * Returns all projects the current user has access to.
   * @returns {Promise<Object[]>}
   */
  async getAll() {
    return apiClient.get('/projects/all');
  },

  /**
   * Returns a single project's details.
   * @param {string} projectId
   * @returns {Promise<Object>}
   */
  async getById(projectId) {
    return apiClient.get(`/projects/${projectId}`);
  },

  /**
   * Creates a new project.
   * @param {{ name: string, color: string, description?: string }} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    return apiClient.post('/projects', data);
  },

  /**
   * Updates an existing project.
   * @param {string} projectId
   * @param {Partial<Object>} data
   * @returns {Promise<Object>}
   */
  async update(projectId, data) {
    return apiClient.put(`/projects/${projectId}`, data);
  },

  /**
   * Deletes a project.
   * @param {string} projectId
   * @returns {Promise<void>}
   */
  async remove(projectId) {
    return apiClient.delete(`/projects/${projectId}`);
  },

  /**
   * Adds a member to a project.
   * @param {string} projectId
   * @param {{ userId: string, role: string }} data
   * @returns {Promise<Object>}
   */
  async addMember(projectId, data) {
    return apiClient.post(`/projects/${projectId}/members`, data);
  },
};
