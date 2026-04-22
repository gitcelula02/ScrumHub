import { useState, useEffect, useCallback, useMemo } from 'react';
import { boardService } from '../services/boardService';

const DEFAULT_STATUSES = ['todo', 'in_progress', 'in_review', 'done', 'blocked'];

/**
 * @hook useBoard
 * @description Fetches tasks for a project and groups them by status for a Kanban board.
 * Supports filtering by sprint, user, and custom board configuration.
 *
 * @param {string | null} projectId
 * @param {Object} options
 * @param {string | null} options.sprintId - Filter by sprint
 * @param {string[]} options.userIds - Filter by assignee user IDs (empty = all)
 * @param {Object[]} options.customBoards - Custom board column definitions
 *
 * @returns {{
 * columns: Object, // { [status]: Task[] }
 * loading: boolean,
 * error: string | null,
 * moveTask: Function,
 * refetch: Function,
 * allTasks: Task[],
 * }}
 */
export function useBoard(projectId, options = {}) {
  const { sprintId = null, userIds = [], customBoards = null } = options;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const statuses = useMemo(() => {
    if (customBoards) return customBoards.map(b => b.id);
    return DEFAULT_STATUSES;
  }, [customBoards]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (sprintId) {
      result = result.filter(t => t.sprintId?.toString() === sprintId.toString());
    }

    if (userIds.length > 0) {
      result = result.filter(t =>
        t.assignee && userIds.includes(t.assignee.id?.toString())
      );
    }

    return result;
  }, [tasks, sprintId, userIds]);

  const columns = useMemo(() => {
    return statuses.reduce((acc, status) => {
      acc[status] = filteredTasks.filter(t => (t.status ?? 'todo') === status);
      return acc;
    }, {});
  }, [filteredTasks, statuses]);

  const moveTask = useCallback(async (taskId, newStatus) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );
    try {
      await boardService.updateTaskStatus(taskId, { status: newStatus });
    } catch {
      fetchBoard();
    }
  }, [fetchBoard]);

  return { columns, loading, error, moveTask, refetch: fetchBoard, allTasks: tasks };
}