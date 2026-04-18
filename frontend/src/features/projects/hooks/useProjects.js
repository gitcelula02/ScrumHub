import { useState, useEffect, useCallback } from 'react';
import { useThemeRegistry } from '@/store/useThemeRegistry';
import { projectService } from '../services/projectService';

/**
 * @hook useProjects
 * @description Fetches the list of all projects accessible to the current user.
 * Registers project colors into the ThemeRegistry for use throughout the app.
 *
 * @returns {{
 *   projects: Object[],
 *   loading: boolean,
 *   error: string | null,
 *   refetch: Function,
 * }}
 *
 * @example
 * const { projects, loading } = useProjects();
 */
export function useProjects() {
  const [projects, setProjects]  = useState([]);
  const [loading, setLoading]    = useState(false);
  const [error, setError]        = useState(null);
  const { registerEntities }     = useThemeRegistry();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getAll();
      const list = Array.isArray(data) ? data : [];
      setProjects(list);
      registerEntities(list.map(p => ({ id: p.id, color: p.color ?? '#6B5CFF' })));
    } catch (err) {
      if (err.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message ?? 'Failed to load projects');
      }
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [registerEntities]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}
