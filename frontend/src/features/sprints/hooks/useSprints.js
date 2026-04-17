import { useState, useEffect, useCallback } from 'react';
import { useThemeRegistry } from '@/store/useThemeRegistry';
import { sprintService } from '../services/sprintService';

/**
 * @hook useSprints
 * @description Fetches sprints for a project. Handles API errors gracefully
 * since the sprint endpoint is not yet implemented on the backend.
 *
 * @param {string | null} projectId
 *
 * @returns {{
 * sprints: Object[],
 * loading: boolean,
 * error: string | null,
 * refetch: Function,
 * }}
 */
export function useSprints(projectId) {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { registerEntities } = useThemeRegistry();

  const fetchSprints = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await sprintService.getByProject(projectId);
      const list = Array.isArray(data) ? data : [];
      setSprints(list);
      registerEntities(list.map(s => ({ id: s.id, color: s.color ?? '#22c55e' })));
    } catch {
      setError(null);
      setSprints([]);
    }
  }, [projectId, registerEntities]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSprints();
  }, [fetchSprints]);

  return { sprints, loading, error, refetch: fetchSprints };
}