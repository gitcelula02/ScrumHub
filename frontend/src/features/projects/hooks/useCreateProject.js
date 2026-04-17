import { useState, useCallback } from 'react';
import { projectService } from '../services/projectService';

/**
 * @hook useCreateProject
 * @description Manages the async creation of a project.
 * Encapsulates loading state, error handling, and the API call.
 *
 * @returns {{
 *   createProject: Function,
 *   loading: boolean,
 *   error: string | null,
 * }}
 *
 * @example
 * const { createProject, loading, error } = useCreateProject();
 * const handleSubmit = async (data) => {
 *   await createProject(data);
 * };
 */
export function useCreateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProject = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const project = await projectService.create({
        name: data.name.trim(),
        description: data.description?.trim() ?? '',
        color: data.color ?? '#6B5CFF',
      });
      return project;
    } catch (err) {
      const message = err.message ?? 'Failed to create project. Please try again.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createProject, loading, error };
}