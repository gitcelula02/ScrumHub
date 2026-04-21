import { useState, useEffect, useCallback } from 'react';
import { overviewService } from '../services/overviewService';

/**
 * @hook useOverview
 * @description Fetches comprehensive overview data for a project.
 * Includes stats, velocity, workload, activity, and notifications.
 */
export function useOverview(projectId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [velocityData, setVelocityData] = useState([]);
  const [teamWorkload, setTeamWorkload] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [chatNotifications, setChatNotifications] = useState({ mentions: 0, totalMessages: 0 });
  const [nextDaily, setNextDaily] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [projectDescription, setProjectDescription] = useState('');

  const fetchOverview = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const [
        statsData,
        velocity,
        workload,
        overdue,
        deadlines,
        activity,
        notifications,
        daily,
        tasks,
      ] = await Promise.all([
        overviewService.getProjectStats(projectId),
        overviewService.getVelocityData(projectId),
        overviewService.getTeamWorkload(projectId),
        overviewService.getOverdueTasks(projectId),
        overviewService.getUpcomingDeadlines(projectId),
        overviewService.getRecentActivity(projectId),
        overviewService.getChatNotifications(projectId),
        overviewService.getNextDaily(projectId),
        overviewService.getUserTasks(projectId, 'me'),
      ]);

      setStats(statsData);
      setVelocityData(velocity);
      setTeamWorkload(workload);
      setOverdueTasks(overdue);
      setUpcomingDeadlines(deadlines);
      setRecentActivity(activity);
      setChatNotifications(notifications);
      setNextDaily(daily);
      setUserTasks(tasks);
      setProjectDescription(statsData.project?.description || '');
    } catch (err) {
      setError(err.message ?? 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const updateDescription = useCallback(async (newDescription) => {
    try {
      await overviewService.updateProjectDescription(projectId, newDescription);
      setProjectDescription(newDescription);
    } catch (err) {
      console.error('Failed to update description:', err);
    }
  }, [projectId]);

  return {
    loading,
    error,
    stats,
    velocityData,
    teamWorkload,
    overdueTasks,
    upcomingDeadlines,
    recentActivity,
    chatNotifications,
    nextDaily,
    userTasks,
    projectDescription,
    updateDescription,
    refetch: fetchOverview,
  };
}