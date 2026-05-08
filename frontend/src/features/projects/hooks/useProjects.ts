/**
 * @hook useProjects
 * Feature hook for fetching and managing projects list.
 * Uses TanStack Query for server state management.
 */

import { useQuery } from "@tanstack/react-query";
import { projectsService } from "../services/projectsService";
import type { Project } from "../types";

interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

export function useProjects(): UseProjectsResult {
  const { data, isLoading, error, refetch } = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: () => projectsService.getAll(),
  });

  return {
    projects: data ?? [],
    isLoading,
    error,
    refetch,
  };
}