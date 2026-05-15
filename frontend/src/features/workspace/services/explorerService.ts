/**
 * @module workspace/services/explorerService
 * API service for Project Explorer endpoints.
 */

import { apiClient } from "@/services/apiClient";
import type {
  FolderTreeResponse,
  PinnedProjectsResponse,
  SearchResult,
  CreateFolderPayload,
  CreateProjectPayload,
  MoveProjectPayload,
  AiCommandResponse,
  UserFolder,
  ExplorerProject,
} from "../types/explorerTypes";

const MOCK_FOLDER_TREE: FolderTreeResponse = {
  data: [
    {
      id: "folder-1",
      user_id: "user-1",
      parent_id: null,
      name: "AI Projects",
      order_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      children: [
        {
          id: "folder-2",
          user_id: "user-1",
          parent_id: "folder-1",
          name: "Fine-tuning",
          order_index: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          children: [],
          projects: [
            {
              id: "project-1",
              name: "GPT-4 Fine-tune",
              description: "Fine-tuning GPT-4 for customer support",
              goal: "Improve response accuracy by 20%",
              color: "#3B82F6",
              icon: "🤖",
              status: "active",
              created_by_user_id: "user-1",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        },
      ],
      projects: [],
    },
    {
      id: "folder-3",
      user_id: "user-1",
      parent_id: null,
      name: "Pipelines",
      order_index: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      children: [],
      projects: [
        {
          id: "project-2",
          name: "CI/CD Overhaul",
          description: "Modernize the CI/CD pipeline",
          goal: "Reduce build times by 50%",
          color: "#10B981",
          icon: "🚀",
          status: "active",
          created_by_user_id: "user-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
  ],
};

const MOCK_PINNED: PinnedProjectsResponse = {
  pinned: [
    {
      id: "project-3",
      name: "ScrumHub",
      description: "Project management tool for Scrum teams",
      goal: "Streamline sprint planning and execution",
      color: "#8B5CF6",
      icon: "📘",
      status: "active",
      created_by_user_id: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: "project-1",
    name: "GPT-4 Fine-tune",
    color: "#3B82F6",
    icon: "🤖",
    folder_name: "Fine-tuning",
    status: "active",
  },
  {
    id: "project-3",
    name: "ScrumHub",
    color: "#8B5CF6",
    icon: "📘",
    folder_name: null,
    status: "active",
  },
];

export const explorerService = {
  getFolderTree: async (userId: string): Promise<FolderTreeResponse> => {
    try {
      const response = await apiClient.get<FolderTreeResponse>(
        `/users/${userId}/folders`
      );
      return response;
    } catch {
      return MOCK_FOLDER_TREE;
    }
  },

  getPinnedProjects: async (userId: string): Promise<PinnedProjectsResponse> => {
    try {
      const response = await apiClient.get<PinnedProjectsResponse>(
        `/users/${userId}/projects`
      );
      return response;
    } catch {
      return MOCK_PINNED;
    }
  },

  createFolder: async (userId: string, payload: CreateFolderPayload): Promise<UserFolder> => {
    const response = await apiClient.post<UserFolder>(
      `/users/${userId}/folders`,
      payload
    );
    return response;
  },

  updateFolder: async (
    folderId: string,
    payload: Partial<CreateFolderPayload>
  ): Promise<UserFolder> => {
    const response = await apiClient.patch<UserFolder>(
      `/folders/${folderId}`,
      payload
    );
    return response;
  },

  deleteFolder: async (folderId: string): Promise<void> => {
    await apiClient.delete(`/folders/${folderId}`);
  },

  addProjectToFolder: async (
    userId: string,
    folderId: string,
    projectId: string
  ): Promise<{ folder_project_id: string; project_id: string; folder_id: string }> => {
    const response = await apiClient.post<
      { folder_project_id: string; project_id: string; folder_id: string }
    >(`/users/${userId}/folders/${folderId}/projects`, { project_id: projectId });
    return response;
  },

  removeProjectFromFolder: async (
    userId: string,
    folderId: string,
    projectId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/users/${userId}/folders/${folderId}/projects/${projectId}`
    );
  },

  moveProject: async (
    userId: string,
    projectId: string,
    payload: MoveProjectPayload
  ): Promise<ExplorerProject> => {
    const response = await apiClient.patch<ExplorerProject>(
      `/users/${userId}/projects/${projectId}/move`,
      payload
    );
    return response;
  },

  pinProject: async (userId: string, projectId: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/projects/${projectId}/pin`);
  },

  unpinProject: async (userId: string, projectId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/projects/${projectId}/pin`);
  },

  searchProjects: async (userId: string, query: string): Promise<SearchResult[]> => {
    try {
      const response = await apiClient.get<{ data: SearchResult[] }>(
        `/users/${userId}/projects/search`,
        { params: { q: query } }
      );
      return response.data;
    } catch {
      const lower = query.toLowerCase();
      return MOCK_SEARCH_RESULTS.filter(
        (r) =>
          r.name.toLowerCase().includes(lower) ||
          r.folder_name?.toLowerCase().includes(lower)
      );
    }
  },

  createProject: async (payload: CreateProjectPayload): Promise<ExplorerProject> => {
    const response = await apiClient.post<{ data: ExplorerProject }>(
      "/projects",
      payload
    );
    return response.data;
  },

  aiCommand: async (command: string): Promise<AiCommandResponse> => {
    const response = await apiClient.post<AiCommandResponse>(
      "/ai/command",
      { command }
    );
    return response;
  },
};