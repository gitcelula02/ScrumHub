/**
 * @module sprints/types
 * Types used by sprint feature components and services.
 */

export type SprintStatus = "active" | "planned" | "completed";

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
}

export interface SprintPayload {
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
}
