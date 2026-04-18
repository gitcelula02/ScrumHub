import { useState, useEffect, useCallback } from 'react';
import { boardService } from '../services/boardService';

const STATUSES = ['todo', 'in_progress', 'in_review', 'done', 'blocked'];

/**
 * @hook useBoard
 * @description Fetches tasks for a project and groups them by status for a Kanban board.
 *
 * @param {string | null} projectId
 *
 * @returns {{
 *   columns: Object,   // { [status]: Task[] }
 *   loading: boolean,
 *   error: string | null,
 *   moveTask: Function,
 *   refetch: Function,
 * }}
 */
export function useBoard(projectId) {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchBoard = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await boardService.getTasksByProject(projectId);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message ?? 'Failed to load board');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  // Group tasks into column buckets
  const columns = STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter(t => (t.status ?? 'todo') === status);
    return acc;
  }, {});

  /**
   * Optimistically moves a task to a new status column.
   * @param {string} taskId
   * @param {string} newStatus
   */
  const moveTask = useCallback(async (taskId, newStatus) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );
    try {
      await boardService.updateTaskStatus(taskId, { status: newStatus });
    } catch {
      // Revert on failure
      fetchBoard();
    }
  }, [fetchBoard]);

  return { columns, loading, error, moveTask, refetch: fetchBoard };
}
