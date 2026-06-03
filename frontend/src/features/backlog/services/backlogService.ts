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
    const response = await apiClient<{ success: boolean; tasks: Task[] }>(
      `/tasks/project/${projectId}`,
    );
    return response.tasks;
  },

  /**
   * Fetches a single task by ID.
   */
  getTaskById: async (id: string): Promise<Task> => {
    const response = await apiClient<{ success: boolean; task: Task }>(
      `/tasks/${id}?include=comments`,
    );
    return response.task;
  },

  /**
   * Updates an existing task.
   */
  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await apiClient<{ success: boolean; task: Task }>(
      `/tasks/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    return response.task;
  },

  /**
   * Creates a new task.
   */
  createTask: async (data: Partial<Task>): Promise<Task> => {
    const response = await apiClient<{ success: boolean; task: Task }>(
      "/tasks",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    return response.task;
  },

  /**
   * Fetches all backlogs for a project.
   * @param {string} projectId - The project identifier
   */
  getBacklogs: async (projectId: string): Promise<Backlog[]> => {
    const res = await apiClient.get<any>(`/projects/${projectId}/backlogs`);
    if (!res) return [];
    if (Array.isArray(res)) return res as Backlog[];
    if (Array.isArray(res.backlogs)) return res.backlogs as Backlog[];
    if (Array.isArray(res.data)) return res.data as Backlog[];
    return [];
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
