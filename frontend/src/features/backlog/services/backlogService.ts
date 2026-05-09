import { apiClient } from "@/services/apiClient";
import type { Task } from "@/types";

/**
 * @service BacklogService
 * Handles API interactions for the project backlog and tasks.
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
};
