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

interface UsersResponse {
  data: Array<{
    id: number;
    username: string;
    email: string;
    avatar_url: string | null;
  }>;
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

const projectsService = {
  getAll: async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get<Project[] | ProjectsResponse>(
        "/projects",
      );
      return Array.isArray(response) ? response : response.data;
    } catch {
      return [];
    }
  },

  getById: async (projectId: string): Promise<Project | null> => {
    try {
      const response = await apiClient.get<Project | ProjectResponse>(
        `/projects/${projectId}`,
      );
      if (!response) return null;
      return "data" in response ? response.data : response;
    } catch {
      return null;
    }
  },

  /**
   * Creates a new project.
   */
  create: async (data: Partial<Project>): Promise<Project> => {
    return apiClient.post<Project>("/projects", data);
  },

  /**
   * Search users by email for adding to a project.
   */
  searchUsers: async (email: string): Promise<UsersResponse> => {
    return apiClient.get<UsersResponse>("/users", {
      params: { search: email, limit: "10" },
    });
  },
};

export { projectsService };
