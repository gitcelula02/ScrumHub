/**
 * @hook useExplorerState
 * Manages explorer UI state persisted to localStorage.
 * Handles expanded folders, active folder, view size, and last opened project.
 */

import { useState, useEffect, useCallback } from "react";
import type { ExplorerState, ViewSize } from "../types/explorerTypes";

const STORAGE_KEY = "scrumbhub_explorer_state";

const DEFAULT_STATE: ExplorerState = {
  expanded_folder_ids: [],
  active_folder_id: null,
  view_size: "compact",
  last_opened_project_id: null,
};

function loadState(): ExplorerState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_STATE, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_STATE;
}

function saveState(state: ExplorerState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export interface UseExplorerStateResult {
  state: ExplorerState;
  toggleFolder: (folderId: string) => void;
  setActiveFolder: (folderId: string | null) => void;
  setViewSize: (size: ViewSize) => void;
  setLastOpenedProject: (projectId: string | null) => void;
  collapseAll: () => void;
}

export function useExplorerState(): UseExplorerStateResult {
  const [state, setState] = useState<ExplorerState>(DEFAULT_STATE);

  useEffect(() => {
    setState(loadState());
  }, []);

  const persistAndSet = useCallback((updater: (prev: ExplorerState) => ExplorerState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const toggleFolder = useCallback(
    (folderId: string) => {
      persistAndSet((prev) => {
        const expanded = prev.expanded_folder_ids.includes(folderId)
          ? prev.expanded_folder_ids.filter((id) => id !== folderId)
          : [...prev.expanded_folder_ids, folderId];
        return { ...prev, expanded_folder_ids: expanded };
      });
    },
    [persistAndSet]
  );

  const setActiveFolder = useCallback(
    (folderId: string | null) => {
      persistAndSet((prev) => ({ ...prev, active_folder_id: folderId }));
    },
    [persistAndSet]
  );

  const setViewSize = useCallback(
    (size: ViewSize) => {
      persistAndSet((prev) => ({ ...prev, view_size: size }));
    },
    [persistAndSet]
  );

  const setLastOpenedProject = useCallback(
    (projectId: string | null) => {
      persistAndSet((prev) => ({ ...prev, last_opened_project_id: projectId }));
    },
    [persistAndSet]
  );

  const collapseAll = useCallback(() => {
    persistAndSet((prev) => ({ ...prev, expanded_folder_ids: [] }));
  }, [persistAndSet]);

  return {
    state,
    toggleFolder,
    setActiveFolder,
    setViewSize,
    setLastOpenedProject,
    collapseAll,
  };
}