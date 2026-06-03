import { apiClient } from "@/services/apiClient";
import type { Task } from "@/types";

/**
 * @service EpicService
 * Handles API interactions for epics and epic details.
 */
export const epicService = {
  getEpics: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient<{ success: boolean; epics: Task[] }>(
      `/projects/${projectId}/epics`,
    );
    return response.epics;
  },

  getEpic: async (epicId: string): Promise<Task> => {
    const response = await apiClient<{ success: boolean; epic: Task }>(
      `/epics/${epicId}`,
    );
    return response.epic;
  },

  filterEpics: (tasks: Task[]): Task[] => {
    return tasks.filter((t) => t.type === "EPIC");
  },

  getEpicChildren: (tasks: Task[], epicId: string): Task[] => {
    return tasks.filter((t) => t.parentId === epicId);
  },
};
