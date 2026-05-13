/**
 * Global TypeScript definitions for ScrumHub.
 */

export type ID = string;

export interface Entity {
  id: ID;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export type Priority = "low" | "medium" | "high" | "urgent";

export type TaskType = "TASK" | "EPIC" | "STORY" | "BUG";

export interface Comment {
  author: string;
  when: string;
  body: string;
}

export interface Task extends Entity {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  type: TaskType;
  assignee: string;
  reporter: string;
  project: string;
  epic?: string;
  sprint?: string;
  parentId?: string;
  points: number;
  due: string;
  labels: string[];
  comments: Comment[];
}

export interface Project extends Entity {
  name: string;
  description: string;
  color?: string;
}

export interface User extends Entity {
  name: string;
  email: string;
  role: string;
}

export interface Backlog extends Entity {
  name: string;
  type: "development" | "qa_testing" | "strategic" | "custom";
  color?: string;
  description?: string;
  order_index: number;
  is_default: boolean;
}

export interface BacklogType extends Entity {
  name: string;
  description: string;
}

export interface Tab {
  id: string;
  label: string;
  kind: "dashboard" | "task" | "epics" | "permissions";
  taskId?: string;
}

export interface RouterContext {
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
  };
  queryClient: QueryClient;
}

import { QueryClient } from "@tanstack/react-query";
