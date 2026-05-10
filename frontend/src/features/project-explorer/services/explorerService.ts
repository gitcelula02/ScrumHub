/**
 * @module project-explorer/services/explorerService
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

export const explorerService = {
  getFolderTree: async (userId: string): Promise<FolderTreeResponse> => {
    const response = await apiClient.get<FolderTreeResponse>(
      `/users/${userId}/folders`
    );
    return response;
  },

  getPinnedProjects: async (userId: string): Promise<PinnedProjectsResponse> => {
    const response = await apiClient.get<PinnedProjectsResponse>(
      `/users/${userId}/projects`
    );
    return response;
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
    const response = await apiClient.get<{ data: SearchResult[] }>(
      `/users/${userId}/projects/search`,
      { params: { q: query } }
    );
    return response.data;
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