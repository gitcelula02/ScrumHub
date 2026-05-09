/**
 * @module projects/types
 * Project-specific TypeScript types for ScrumHub.
 */

export type ProjectStatus = "active" | "planning" | "paused" | "archived";

export interface ProjectMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  key: string;
  owner: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  color: string;
  icon: string;
}

export interface ProjectWithMeta extends Project {
  lead: ProjectMember | null;
  memberCount: number;
  taskCount: number;
  epicCount: number;
  isFeatured: boolean;
}

export type ProjectTab = "all" | ProjectStatus;
