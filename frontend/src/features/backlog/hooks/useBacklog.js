import { useState, useEffect } from 'react';
import { useThemeRegistry } from '@/store/useThemeRegistry';
import { backlogService } from '../services/backlogService';

/**
 * @hook useBacklog
 * @description Fetches and manages backlog data (epics + nested tasks) for a project.
 * Registers all epic colors into the ThemeRegistry after each fetch so that
 * any component in the tree can call getTheme(epicId) without re-fetching.
 *
 * ARCHITECTURE NOTE:
 * This hook is the boundary between data and UI.
 * It owns: fetching, loading state, error state, and color registration.
 * It does NOT own: rendering, sorting UI, or color computation.
 *
 * @param {string | null} projectId - Active project. Pass null to skip fetching.
 *
 * @returns {{
 *   epics:    Object[],   // epic objects with nested .tasks[]
 *   loading:  boolean,
 *   error:    string | null,
 *   refetch:  Function,
 * }}
 *
 * @example
 * function BacklogPage() {
 *   const { projectId } = useParams();
 *   const { epics, loading } = useBacklog(projectId);
 *   return <BacklogTable epics={epics} loading={loading} />;
 * }
 */
export function useBacklog(projectId) {
  const [epics, setEpics]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const { registerEntities }  = useThemeRegistry();

  const fetchBacklog = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await backlogService.getEpicsWithTasks(projectId);
      setEpics(data);

      // Register every epic's color into the global ThemeRegistry.
      // After this call, any component can call getTheme(epicId) instantly —
      // no prop drilling of colors required.
      registerEntities(data.map(epic => ({ id: epic.id, color: epic.color })));
    } catch (err) {
      setError(err.message ?? 'Failed to load backlog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacklog();
  }, [projectId]);

  return { epics, loading, error, refetch: fetchBacklog };
}
