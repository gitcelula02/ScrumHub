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
    const response = await apiClient.get('/projects/all');
    return response.projects || [];
  },

  /**
   * Returns a single project's details.
   * @param {string} projectId
   * @returns {Promise<Object>}
   */
  async getById(projectId) {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.project || null;
  },

  /**
   * Creates a new project.
   * @param {{ name: string, color: string, description?: string }} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const response = await apiClient.post('/projects', data);
    return response.project || response;
  },

  /**
   * Updates an existing project.
   * @param {string} projectId
   * @param {Partial<Object>} data
   * @returns {Promise<Object>}
   */
  async update(projectId, data) {
    const response = await apiClient.put(`/projects/${projectId}`, data);
    return response.project || response;
  },

  /**
   * Deletes a project.
   * @param {string} projectId
   * @returns {Promise<void>}
   */
  async remove(projectId) {
    await apiClient.delete(`/projects/${projectId}`);
  },

  /**
   * Adds a member to a project.
   * @param {string} projectId
   * @param {{ userId: string, role: string }} data
   * @returns {Promise<Object>}
   */
  async addMember(projectId, data) {
    await apiClient.post(`/projects/${projectId}/members`, data);
  },
};
