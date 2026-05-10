/**
 * @module project-explorer/types
 * TypeScript interfaces for the Project Explorer feature.
 */

export type ViewSize = "compact" | "medium" | "big";

export type ProjectStatus = "active" | "archived" | "completed";

export interface UserFolder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface UserFolderProject {
  id: string;
  user_id: string;
  folder_id: string | null;
  project_id: string;
  order_index: number;
  is_pinned: boolean;
  created_at: string;
}

export interface ProjectCustomSection {
  id: string;
  project_id: string;
  user_id: string;
  key: string;
  value: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ExplorerProject {
  id: string;
  name: string;
  description: string;
  goal: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ExplorerState {
  expanded_folder_ids: string[];
  active_folder_id: string | null;
  view_size: ViewSize;
  last_opened_project_id: string | null;
}

export interface FolderTreeNode extends UserFolder {
  children: FolderTreeNode[];
  projects: ExplorerProject[];
}

export interface FolderTreeResponse {
  data: FolderTreeNode[];
}

export interface PinnedProjectsResponse {
  pinned: ExplorerProject[];
}

export interface SearchResult {
  id: string;
  name: string;
  color: string;
  icon: string;
  folder_name: string | null;
  status: string;
}

export interface CreateFolderPayload {
  name: string;
  parent_id: string | null;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  goal?: string;
  color?: string;
  icon?: string;
}

export interface MoveProjectPayload {
  folder_id: string | null;
}

export interface AiCommandResponse {
  success: boolean;
  project?: ExplorerProject;
  message: string;
}