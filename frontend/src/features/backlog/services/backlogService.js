import { apiClient } from '@/services/apiClient';

/**
 * @service backlogService
 * @description All API calls for the backlog feature.
 * Returns plain data objects — no UI concerns, no state management.
 *
 * ARCHITECTURE NOTE:
 * Services are the only place that knows about API endpoints and response shapes.
 * If the API changes (e.g. epics move from /epics to /backlog/epics), only this
 * file needs updating — hooks and components are unaffected.
 *
 * Response shape contract (what hooks and components can depend on):
 *   Epic: { id, name, color, status, startDate, endDate, tasks[] }
 *   Task: { id, title, status, priority, assignee, dueDate, epicId, sprintId }
 */
export const backlogService = {
  /**
   * Returns all epics for a project, each with nested tasks.
   * @param {string} projectId
   * @returns {Promise<Object[]>}
   */
  async getEpicsWithTasks(projectId) {
    return apiClient.get(`/projects/${projectId}/epics?include=tasks`);
  },

  /**
   * Creates a new epic under a project.
   * @param {string} projectId
   * @param {{ name: string, color: string, description?: string }} data
   * @returns {Promise<Object>}
   */
  async createEpic(projectId, data) {
    return apiClient.post(`/projects/${projectId}/epics`, data);
  },

  /**
   * Updates an epic's fields (including color).
   * @param {string} epicId
   * @param {Partial<{ name: string, color: string, status: string }>} data
   * @returns {Promise<Object>}
   */
  async updateEpic(epicId, data) {
    return apiClient.patch(`/epics/${epicId}`, data);
  },

  /**
   * Creates a task inside an epic.
   * @param {string} epicId
   * @param {{ title: string, priority?: string, assigneeId?: string }} data
   * @returns {Promise<Object>}
   */
  async createTask(epicId, data) {
    return apiClient.post(`/epics/${epicId}/tasks`, data);
  },

  /**
   * Updates a task's status, priority, or other fields.
   * @param {string} taskId
   * @param {Partial<Object>} data
   * @returns {Promise<Object>}
   */
  async updateTask(taskId, data) {
    return apiClient.patch(`/tasks/${taskId}`, data);
  },
};
