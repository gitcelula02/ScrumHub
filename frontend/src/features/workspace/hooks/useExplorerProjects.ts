/**
 * @hook useExplorerProjects
 * Feature hook for managing projects in folder structure, including pinning.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { explorerService } from "../services/explorerService";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import type { FolderTreeResponse, ExplorerProject, MoveProjectPayload, PinnedProjectsResponse } from "../types/explorerTypes";

export interface UseExplorerProjectsResult {
  folderTree: FolderTreeResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

export function useExplorerProjects(): UseExplorerProjectsResult {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<FolderTreeResponse, Error>({
    queryKey: ["user", userId, "explorer", "folderTree"],
    queryFn: () => explorerService.getFolderTree(userId),
  });

  console.log("[useExplorerProjects] Folder tree data:", data);

  return {
    folderTree: data,
    isLoading,
    error,
    refetch,
  };
}

export function usePinnedProjects() {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";

  return useQuery<PinnedProjectsResponse, Error>({
    queryKey: ["user", userId, "explorer", "pinned"],
    queryFn: () => explorerService.getPinnedProjects(userId),
  });
}

export function useAddProjectToFolder() {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, projectId }: { folderId: string; projectId: string }) =>
      explorerService.addProjectToFolder(userId, folderId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId, "explorer"] });
    },
  });
}

export function useRemoveProjectFromFolder() {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, projectId }: { folderId: string; projectId: string }) =>
      explorerService.removeProjectFromFolder(userId, folderId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId, "explorer"] });
    },
  });
}

export function useMoveProject() {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: MoveProjectPayload }) =>
      explorerService.moveProject(userId, projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId, "explorer"] });
    },
  });
}

export function usePinProject() {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      explorerService.pinProject(userId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId, "explorer"] });
    },
  });
}

export function useUnpinProject() {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      explorerService.unpinProject(userId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId, "explorer"] });
    },
  });
}

export function useCreateProject() {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof explorerService.createProject>[0]) =>
      explorerService.createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId, "explorer"] });
    },
  });
}

export function useCreateFolder() {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof explorerService.createFolder>[1]) =>
      explorerService.createFolder(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId, "explorer"] });
    },
  });
}

export function useUpdateFolder() {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, payload }: { folderId: string; payload: Parameters<typeof explorerService.updateFolder>[1] }) =>
      explorerService.updateFolder(folderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId, "explorer"] });
    },
  });
}

export function useDeleteFolder() {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) =>
      explorerService.deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId, "explorer"] });
    },
  });
}