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

      if (Array.isArray(response)) {
        return response;
      }

      if (response && "data" in response && Array.isArray(response.data)) {
        return response.data;
      }

      if (response && "projects" in response && Array.isArray(response.projects)) {
        return response.projects;
      }

      return [];
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
      if ("data" in response) return response.data;
      if ("project" in response) return response.project;
      return response as Project;
    } catch {
      return null;
    }
  },

  /**
   * Creates a new project.
   */
  create: async (data: Partial<Project>): Promise<Project> => {
    const res = await apiClient.post<any>("/projects", data);
    // API might return either the project directly or a wrapper { success: true, project }
    if (!res) throw new Error('Empty response from create project');
    if ('project' in res) return res.project as Project;
    if ('data' in res) return res.data as Project;
    return res as Project;
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
