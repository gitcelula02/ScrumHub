import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/settingsService';

/**
 * @hook useSettings
 * @description Fetches and manages user settings data including profile,
 * preferences, and AI settings.
 *
 * @returns {{
 *   profile: Object | null,
 *   preferences: Object | null,
 *   aiSettings: Object | null,
 *   projectAISettings: Object | null,
 *   loading: boolean,
 *   error: string | null,
 *   refetch: Function,
 *   updateProfile: Function,
 *   updatePreferences: Function,
 *   updateAISettings: Function,
 * }}
 */
export function useSettings(projectId = null) {
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [aiSettings, setAiSettings] = useState(null);
  const [projectAISettings, setProjectAISettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, prefsData, aiData] = await Promise.all([
        settingsService.getUserProfile(),
        settingsService.getUserPreferences(),
        settingsService.getAISettings(),
      ]);
      setProfile(profileData);
      setPreferences(prefsData);
      setAiSettings(aiData);

      if (projectId) {
        const projectAiData = await settingsService.getProjectAISettings(projectId);
        setProjectAISettings(projectAiData);
      }
    } catch (err) {
      setError(err.message ?? 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateProfile = useCallback(async (data) => {
    const updated = await settingsService.updateUserProfile(data);
    setProfile(prev => ({ ...prev, ...updated }));
    return updated;
  }, []);

  const updatePreferences = useCallback(async (data) => {
    const updated = await settingsService.updateUserPreferences(data);
    setPreferences(prev => ({ ...prev, ...updated }));
    return updated;
  }, []);

  const updateAISettings = useCallback(async (data) => {
    const updated = await settingsService.updateAISettings(data);
    setAiSettings(prev => ({ ...prev, ...updated }));
    return updated;
  }, []);

  const updateProjectAISettings = useCallback(async (data) => {
    if (!projectId) return;
    const updated = await settingsService.updateProjectAISettings(projectId, data);
    setProjectAISettings(prev => ({ ...prev, ...updated }));
    return updated;
  }, [projectId]);

  return {
    profile,
    preferences,
    aiSettings,
    projectAISettings,
    loading,
    error,
    refetch: fetchAll,
    updateProfile,
    updatePreferences,
    updateAISettings,
    updateProjectAISettings,
  };
}