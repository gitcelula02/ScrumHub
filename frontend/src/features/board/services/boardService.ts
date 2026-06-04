import { apiClient } from "@/services/apiClient";
import type { Task, TaskStatus } from "@/types";

/**
 * @service BoardService
 * Manages Kanban board operations and state transitions.
 */
export const boardService = {
  /**
   * Moves a task to a new status.
   */
  moveTask: async (taskId: string, status: TaskStatus): Promise<Task> => {
    const response = await apiClient.patch<
      Task | { success: boolean; task: Task }
    >(`/tasks/${taskId}`, { status });

    if (response && "task" in response) {
      return response.task;
    }

    return response as Task;
  },

  /**
   * Fetches tasks filtered by status for a specific column.
   * @param {string} projectId - The project identifier for cache scoping
   * @param {TaskStatus} status - The task status to filter by
   * @returns {Promise<Task[]>} Array of tasks matching the status
   */
  getColumnTasks: async (
    projectId: string,
    status: TaskStatus,
  ): Promise<Task[]> => {
    return apiClient.get<Task[]>(
      `/tasks?project_id=${projectId}&status=${status}`,
    );
  },
};
