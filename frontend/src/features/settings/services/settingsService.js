import { apiClient } from '@/services/apiClient';

/**
 * @service settingsService
 * @description All API calls for user and project settings.
 * Includes user profile, preferences, and AI configuration.
 *
 * MOCK: Returns mock data until backend implements settings endpoints.
 */
export const settingsService = {
  /* ── User Profile ─────────────────────────────────────── */

  /**
   * Returns the current user's profile.
   * @returns {Promise<Object>}
   */
  async getUserProfile() {
    try {
      return await apiClient.get('/users/me');
    } catch {
      return getMockUserProfile();
    }
  },

  /**
   * Updates the current user's profile.
   * @param {Object} data - Profile data to update
   * @returns {Promise<Object>}
   */
  async updateUserProfile(data) {
    try {
      return await apiClient.put('/users/me', data);
    } catch {
      console.info('[Settings] Profile update (mock):', data);
      return { ...getMockUserProfile(), ...data };
    }
  },

  /* ── User Preferences ─────────────────────────────────── */

  /**
   * Returns user preferences (language, theme, notifications).
   * @returns {Promise<Object>}
   */
  async getUserPreferences() {
    try {
      return await apiClient.get('/users/me/preferences');
    } catch {
      return getMockPreferences();
    }
  },

  /**
   * Updates user preferences.
   * @param {Object} data - Preferences to update
   * @returns {Promise<Object>}
   */
  async updateUserPreferences(data) {
    try {
      return await apiClient.put('/users/me/preferences', data);
    } catch {
      console.info('[Settings] Preferences update (mock):', data);
      return { ...getMockPreferences(), ...data };
    }
  },

  /* ── AI General Settings ──────────────────────────────── */

  /**
   * Returns global AI settings (skills, agents, permissions).
   * @returns {Promise<Object>}
   */
  async getAISettings() {
    try {
      return await apiClient.get('/users/me/ai-settings');
    } catch {
      return getMockAISettings();
    }
  },

  /**
   * Updates global AI settings.
   * @param {Object} data - AI settings to update
   * @returns {Promise<Object>}
   */
  async updateAISettings(data) {
    try {
      return await apiClient.put('/users/me/ai-settings', data);
    } catch {
      console.info('[Settings] AI settings update (mock):', data);
      return { ...getMockAISettings(), ...data };
    }
  },

  /* ── Project AI Settings ──────────────────────────────── */

  /**
   * Returns project-specific AI settings.
   * @param {string} projectId
   * @returns {Promise<Object>}
   */
  async getProjectAISettings(projectId) {
    try {
      return await apiClient.get(`/projects/${projectId}/ai-settings`);
    } catch {
      return getMockProjectAISettings();
    }
  },

  /**
   * Updates project-specific AI settings.
   * @param {string} projectId
   * @param {Object} data - Project AI settings to update
   * @returns {Promise<Object>}
   */
  async updateProjectAISettings(projectId, data) {
    try {
      return await apiClient.put(`/projects/${projectId}/ai-settings`, data);
    } catch {
      console.info('[Settings] Project AI settings update (mock):', data);
      return { ...getMockProjectAISettings(), ...data };
    }
  },
};

/* ── Mock Data ─────────────────────────────────────────────────── */

function getMockUserProfile() {
  return {
    id: 1,
    name: 'Alex Rivera',
    email: 'alex.rivera@scrumhub.io',
    avatarUrl: null,
    role: 'Scrum Master',
    title: 'Senior Project Manager',
    timezone: 'America/New_York',
  };
}

function getMockPreferences() {
  return {
    language: 'en',
    theme: 'light',
    notifications: {
      email: true,
      push: false,
      sprintReminder: true,
      taskAssigned: true,
      mentions: true,
    },
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  };
}

function getMockAISettings() {
  return {
    enabled: true,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    skills: {
      codeReview: true,
      sprintPlanning: true,
      backlogRefinement: true,
      riskAnalysis: true,
      reportGeneration: true,
    },
    agents: {
      assistant: true,
      analytics: true,
     自动化: false,
    },
    permissions: {
      readProjects: true,
      writeTasks: true,
      manageMembers: false,
      accessReports: true,
    },
  };
}

function getMockProjectAISettings() {
  return {
    enabled: true,
    context: {
      includeBacklog: true,
      includeSprints: true,
      includeChat: true,
      includeActivity: false,
    },
    skills: {
      sprintSuggestions: true,
      taskEstimation: true,
      riskPrediction: true,
      meetingSummaries: true,
    },
    prompts: {
      dailyStandup: 'Generate a summary of yesterday progress and today plan based on task updates.',
      sprintReview: 'Create a summary of sprint accomplishments and blockers.',
      retrospectives: 'Analyze team feedback and suggest actionable improvements.',
    },
  };
}