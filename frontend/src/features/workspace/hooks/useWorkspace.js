import { useState, useEffect, useCallback } from 'react';
import { workspaceService } from '../services/workspaceService';

/**
 * @hook useWorkspace
 * @description Fetches workspace data for a given project.
 * Registers project colors into ThemeRegistry for use throughout the app.
 *
 * @param {number|string} projectId - The project ID to fetch workspace for
 *
 * @returns {{
 *   workspace: Object | null,
 *   loading: boolean,
 *   error: string | null,
 *   refetch: Function,
 * }}
 *
 * @example
 * const { workspace, loading, error } = useWorkspace(projectId);
 */
export function useWorkspace(projectId) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [is404, setIs404] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    setIs404(false);
    try {
      const data = await workspaceService.getByProject(projectId);
      setWorkspace(data);
    } catch (err) {
      if (err.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (err.status === 404) {
        setIs404(true);
        setError(null);
      } else {
        setError(err.message ?? 'Failed to load workspace');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  return { workspace, loading, error, is404, refetch: fetchWorkspace };
}