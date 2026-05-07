import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import type { Project } from "@/types";

interface ProjectResponse {
  data: Project;
}

const projectService = {
  getById: async (projectId: string): Promise<Project> => {
    try {
      const response = await apiClient.get<ProjectResponse>(`/projects/${projectId}`);
      return response.data;
    } catch {
      return {
        id: projectId,
        name: `Project ${projectId}`,
        description: "Mock project description",
        color: "#6B5CFF",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  getAll: async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get<{ data: Project[] }>("/projects");
      return response.data;
    } catch {
      return [];
    }
  },
};

export const projectQuery = (projectId: string) =>
  queryOptions({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getById(projectId),
    staleTime: 1000 * 60 * 5,
  });

export { projectService };