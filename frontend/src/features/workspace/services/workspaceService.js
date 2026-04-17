/**
 * @service workspaceService
 * @description API calls for workspace operations. Currently uses mock data;
 * endpoints will be added when backend implements workspace persistence.
 *
 * @module workspaceService
 */

import { apiClient } from '@/services/apiClient';

/**
 * Retrieves a workspace by project ID.
 * MOCK: Returns mock canvas elements until backend implements workspace storage.
 *
 * @param {number|string} projectId - The project ID
 * @returns {Promise<Object>} Workspace data with canvas elements
 *
 * @example
 * const workspace = await workspaceService.getByProject(123);
 */
export async function getByProject(projectId) {
  const response = await apiClient.get(`/projects/${projectId}/workspace`);
  return response.workspace ?? getMockWorkspace(projectId);
}

/**
 * Saves workspace canvas elements.
 * MOCK: Logs to console until backend implements workspace persistence.
 *
 * @param {number|string} projectId - The project ID
 * @param {Object[]} elements - Array of canvas elements to save
 * @returns {Promise<Object>} Save result
 *
 * @example
 * await workspaceService.saveElements(123, elements);
 */
export async function saveElements(projectId, elements) {
  try {
    const response = await apiClient.put(`/projects/${projectId}/workspace`, {
      elements
    });
    return response;
  } catch {
    console.info('[Workspace] Save mock - elements:', elements.length);
    return { success: true, mock: true };
  }
}

/**
 * Returns mock workspace data for development.
 * @param {number|string} projectId
 * @returns {Object}
 */
function getMockWorkspace(projectId) {
  return {
    id: `ws-${projectId}`,
    projectId: Number(projectId),
    name: 'Untitled Workspace',
    elements: [
      {
        id: 'el-1',
        type: 'sticky',
        x: 80,
        y: 60,
        width: 200,
        height: 160,
        content: 'Welcome to your workspace! Drag me around.',
        color: '#fef3c7',
        zIndex: 1
      },
      {
        id: 'el-2',
        type: 'sticky',
        x: 320,
        y: 100,
        width: 180,
        height: 140,
        content: 'Add ideas, diagrams, and notes here.',
        color: '#dbeafe',
        zIndex: 2
      },
      {
        id: 'el-3',
        type: 'text',
        x: 80,
        y: 280,
        width: 400,
        height: 40,
        content: 'Click + to add new elements to your workspace canvas.',
        color: 'transparent',
        zIndex: 3
      }
    ]
  };
}