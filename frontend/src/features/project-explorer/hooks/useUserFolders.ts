/**
 * @hook useUserFolders
 * Feature hook for folder CRUD operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { explorerService } from "../services/explorerService";
import type { UserFolder, CreateFolderPayload, FolderTreeNode } from "../types/explorerTypes";

export interface UseUserFoldersResult {
  folders: FolderTreeNode[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

export function useUserFolders(): UseUserFoldersResult {
  const { data, isLoading, error, refetch } = useQuery<{ data: FolderTreeNode[] }, Error>({
    queryKey: ["explorer", "folders"],
    queryFn: () => explorerService.getFolderTree(),
  });

  return {
    folders: data?.data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFolderPayload) =>
      explorerService.createFolder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explorer", "folders"] });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, payload }: { folderId: string; payload: Partial<CreateFolderPayload> }) =>
      explorerService.updateFolder(folderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explorer", "folders"] });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) =>
      explorerService.deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explorer", "folders"] });
    },
  });
}