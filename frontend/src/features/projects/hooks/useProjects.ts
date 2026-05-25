/**
 * @hook useProjects
 * Feature hook for fetching and managing projects list.
 * Uses TanStack Query for server state management.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "../services/projectsService";
import type { Project } from "../types";

interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
  createProject: (data: Partial<Project>) => Promise<Project>;
}

export function useProjects(): UseProjectsResult {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: () => projectsService.getAll(),
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: Partial<Project>) => projectsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const createProject = (data: Partial<Project>) => {
    return createProjectMutation.mutateAsync(data);
  };

  return {
    projects: data ?? [],
    isLoading,
    error,
    refetch,
    createProject,
  };
}
