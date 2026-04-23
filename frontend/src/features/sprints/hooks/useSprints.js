import { useState, useEffect, useCallback } from 'react';
import { useThemeRegistry } from '@/store/useThemeRegistry';
import { sprintService } from '../services/sprintService';

const FETCH_TIMEOUT = 8000;

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeoutMs)
    ),
  ]);
}

/**
 * @hook useSprints
 * @description Fetches sprints for a project. Handles API errors and timeouts gracefully.
 * If the request times out or fails, returns empty sprints array with is404 flag.
 *
 * @param {string | null} projectId
 *
 * @returns {{
 * sprints: Object[],
 * loading: boolean,
 * error: string | null,
 * is404: boolean,
 * refetch: Function,
 * }}
 */
export function useSprints(projectId) {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [is404, setIs404] = useState(false);
  const { registerEntities } = useThemeRegistry();

  const fetchSprints = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    setIs404(false);

    try {
      const data = await withTimeout(sprintService.getByProject(projectId), FETCH_TIMEOUT);
      const list = Array.isArray(data) ? data : [];
      setSprints(list);
      registerEntities(list.map(s => ({ id: s.id, color: s.color ?? '#22c55e' })));
    } catch (err) {
      if (err.message === 'timeout') {
        setIs404(true);
        setError(null);
      } else if (err.status === 404) {
        setIs404(true);
        setError(null);
      } else {
        setError(err.message ?? 'Failed to load sprints');
        setIs404(false);
      }
      setSprints([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, registerEntities]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  return { sprints, loading, error, is404, refetch: fetchSprints };
}