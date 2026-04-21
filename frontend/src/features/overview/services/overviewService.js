import { apiClient } from '@/services/apiClient';

/**
 * @service overviewService
 * @description API calls for project overview statistics.
 * Falls back to mock data when endpoints aren't available.
 */
export const overviewService = {
  async getProjectStats(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/stats`);
      return response;
    } catch (err) {
      if (err.status === 404) {
        return getMockProjectStats(projectId);
      }
      throw err;
    }
  },

  async getVelocityData(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/velocity`);
      return response.data || [];
    } catch {
      return getMockVelocityData();
    }
  },

  async getTeamWorkload(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/workload`);
      return response.members || [];
    } catch {
      return getMockTeamWorkload();
    }
  },

  async getOverdueTasks(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/tasks?status=overdue`);
      return response.tasks || [];
    } catch {
      return [];
    }
  },

  async getUpcomingDeadlines(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/tasks?upcoming=true`);
      return response.tasks || [];
    } catch {
      return [];
    }
  },

  async getRecentActivity(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/activity?limit=5`);
      return response.activities || [];
    } catch {
      return getMockActivity();
    }
  },

  async getChatNotifications(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/chat/notifications`);
      return response;
    } catch {
      return { mentions: 0, totalMessages: 0 };
    }
  },

  async getNextDaily(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/daily`);
      return response.nextDaily || null;
    } catch {
      return getMockNextDaily();
    }
  },

  async getUserTasks(projectId, userId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/tasks?assignee=${userId}`);
      return response.tasks || [];
    } catch {
      return [];
    }
  },
};

function getMockProjectStats(projectId) {
  return {
    project: { id: projectId, name: 'Project', description: 'Edit this description' },
    members: [
      { id: 1, name: 'John Doe', role: 'Scrum Master', avatar: null },
      { id: 2, name: 'Jane Smith', role: 'Developer', avatar: null },
    ],
    userRole: 'Developer',
    totalTasks: 24,
    doneTasks: 8,
    overdueTasks: 3,
    completionPercentage: 33,
  };
}

function getMockVelocityData() {
  return [
    { sprint: 'Sprint 1', completed: 12 },
    { sprint: 'Sprint 2', completed: 18 },
    { sprint: 'Sprint 3', completed: 15 },
    { sprint: 'Sprint 4', completed: 22 },
    { sprint: 'Sprint 5', completed: 19 },
  ];
}

function getMockTeamWorkload() {
  return [
    { name: 'John D.', tasks: 5 },
    { name: 'Jane S.', tasks: 8 },
    { name: 'Mike R.', tasks: 3 },
    { name: 'Sarah K.', tasks: 6 },
  ];
}

function getMockActivity() {
  return [
    { id: 1, type: 'task_completed', user: 'John Doe', description: 'Completed "API Integration"', time: '2 hours ago' },
    { id: 2, type: 'comment_added', user: 'Jane Smith', description: 'Commented on "Login Page"', time: '4 hours ago' },
    { id: 3, type: 'epic_created', user: 'Mike R.', description: 'Created Epic "User Dashboard"', time: 'Yesterday' },
    { id: 4, type: 'sprint_started', user: 'John Doe', description: 'Started Sprint 6', time: '2 days ago' },
    { id: 5, type: 'task_assigned', user: 'Sarah K.', description: 'Assigned "Bug Fix" to Jane', time: '3 days ago' },
  ];
}

function getMockNextDaily() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow.toISOString();
}