import { apiClient } from "@/services/apiClient";
import type { Task } from "@/types";

/**
 * @service EpicService
 * Handles API interactions for epics (tasks with type === 'EPIC').
 */
export const epicService = {
  /**
   * Filters tasks to return only epics (type === 'EPIC').
   * @param {Task[]} tasks - All tasks for a project
   * @returns {Task[]} Tasks where type is 'EPIC'
   */
  filterEpics: (tasks: Task[]): Task[] => {
    return tasks.filter((t) => t.type === "EPIC");
  },

  /**
   * Gets child tasks for a specific epic by parentId.
   * @param {Task[]} tasks - All tasks for a project
   * @param {string} epicId - The epic's task ID
   * @returns {Task[]} Child tasks where parentId === epicId
   */
  getEpicChildren: (tasks: Task[], epicId: string): Task[] => {
    return tasks.filter((t) => t.parentId === epicId);
  },
};
