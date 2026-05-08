/**
 * @module projects/services/projectsService
 * API service for project-related endpoints.
 */

import { apiClient } from "@/services/apiClient";
import type { Project } from "../types";

interface ProjectsResponse {
  data: Project[];
}

interface ProjectResponse {
  data: Project;
}

const projectsService = {
  getAll: async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get<Project[] | ProjectsResponse>("/projects");
      return Array.isArray(response) ? response : response.data;
    } catch {
      return [];
    }
  },

  getById: async (projectId: string): Promise<Project | null> => {
    try {
      const response = await apiClient.get<Project | ProjectResponse>(`/projects/${projectId}`);
      if (!response) return null;
      return "data" in response ? response.data : response;
    } catch {
      return null;
    }
  },
};

export { projectsService };