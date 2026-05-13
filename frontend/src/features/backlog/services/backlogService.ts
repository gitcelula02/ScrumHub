import { apiClient } from "@/services/apiClient";
import type { Task, Backlog, BacklogType } from "@/types";

/**
 * @service BacklogService
 * Handles API interactions for the project backlog, tasks, and backlog types.
 */
export const backlogService = {
  /**
   * Fetches all tasks for a project.
   * @param {string} projectId - The project identifier
   */
  getTasks: async (projectId: string): Promise<Task[]> => {
    return apiClient.get<Task[]>("/tasks", {
      params: { project_id: projectId },
    });
  },

  /**
   * Fetches a single task by ID.
   */
  getTaskById: async (id: string): Promise<Task> => {
    return apiClient.get<Task>(`/tasks/${id}?include=comments`);
  },

  /**
   * Updates an existing task.
   */
  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    return apiClient.patch<Task>(`/tasks/${id}`, data);
  },

  /**
   * Creates a new task.
   */
  createTask: async (data: Partial<Task>): Promise<Task> => {
    return apiClient.post<Task>("/tasks", data);
  },

  /**
   * Fetches all backlogs for a project.
   * @param {string} projectId - The project identifier
   */
  getBacklogs: async (projectId: string): Promise<Backlog[]> => {
    return apiClient.get<Backlog[]>(`/projects/${projectId}/backlogs`);
  },

  /**
   * Creates a new backlog in a project.
   * @param {string} projectId - The project identifier
   * @param {Partial<Backlog>} data - Backlog data
   */
  createBacklog: async (
    projectId: string,
    data: Partial<Backlog>,
  ): Promise<Backlog> => {
    return apiClient.post<Backlog>(`/projects/${projectId}/backlogs`, data);
  },

  /**
   * Fetches all registered backlog types (for custom backlogs).
   */
  getBacklogTypes: async (): Promise<BacklogType[]> => {
    return apiClient.get<BacklogType[]>("/backlog-types");
  },

  /**
   * Creates a new backlog type.
   * @param {Object} data - { name, description }
   */
  createBacklogType: async (data: {
    name: string;
    description: string;
  }): Promise<BacklogType> => {
    return apiClient.post<BacklogType>("/backlog-types", data);
  },
};
