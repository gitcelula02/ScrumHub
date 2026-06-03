import { apiClient } from "@/services/apiClient";
import type { Sprint, SprintPayload } from "../types";

export const sprintService = {
  getSprints: async (projectId: string): Promise<Sprint[]> => {
    const response = await apiClient<{ success: boolean; sprints: Sprint[] }>(
      `/projects/${projectId}/sprints`,
    );
    return response.sprints;
  },

  createSprint: async (
    projectId: string,
    data: SprintPayload,
  ): Promise<Sprint> => {
    const response = await apiClient<{ success: boolean; sprint: Sprint }>(
      `/projects/${projectId}/sprints`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    return response.sprint;
  },

  activateSprint: async (id: string): Promise<Sprint> => {
    const response = await apiClient<{ success: boolean; sprint: Sprint }>(
      `/sprints/${id}/activate`,
      { method: "POST" },
    );
    return response.sprint;
  },

  completeSprint: async (
    id: string,
    targetSprintId?: string,
  ): Promise<{ success: boolean; result: unknown }> => {
    const response = await apiClient<{ success: boolean; result: unknown }>(
      `/sprints/${id}/complete`,
      {
        method: "POST",
        body: JSON.stringify({ targetSprintId }),
      },
    );
    return response;
  },
};
