/**
 * @module projects/api
 * Project query definitions using TanStack Query.
 *
 * Uses projectsService from ./services/projectsService.ts (patched to handle
 * both wrapped and unwrapped API responses).
 */

import { queryOptions } from "@tanstack/react-query";
import { projectsService } from "./services/projectsService";

export const projectQuery = (projectId: string) =>
  queryOptions({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const project = await projectsService.getById(projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }
      return project;
    },
    staleTime: 1000 * 60 * 5,
  });
