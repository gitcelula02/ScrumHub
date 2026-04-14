import { useState, useEffect, useCallback } from 'react';
import { calendarService } from '../services/calendarService';

/**
 * @hook useCalendar
 * @description Fetches tasks for a project and organizes them by their dueDate
 * for calendar display. Manages month navigation state.
 *
 * @param {string | null} projectId
 *
 * @returns {{
 *   tasksByDate: Object,    // { 'YYYY-MM-DD': Task[] }
 *   year:  number,
 *   month: number,          // 0-indexed
 *   prevMonth: Function,
 *   nextMonth: Function,
 *   loading: boolean,
 *   error: string | null,
 *   refetch: Function,
 * }}
 */
export function useCalendar(projectId) {
  const now = new Date();
  const [year, setYear]       = useState(now.getFullYear());
  const [month, setMonth]     = useState(now.getMonth());
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await calendarService.getTasksForCalendar(projectId);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Index tasks by their due date string YYYY-MM-DD
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!task.dueDate) return acc;
    const key = task.dueDate.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  const prevMonth = () => {
    setMonth(m => {
      if (m === 0) { setYear(y => y - 1); return 11; }
      return m - 1;
    });
  };

  const nextMonth = () => {
    setMonth(m => {
      if (m === 11) { setYear(y => y + 1); return 0; }
      return m + 1;
    });
  };

  return { tasksByDate, year, month, prevMonth, nextMonth, loading, error, refetch: fetchTasks };
}
