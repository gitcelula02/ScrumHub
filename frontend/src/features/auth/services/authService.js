import { apiClient } from '@/services/apiClient';

/**
 * @service authService
 * @description All API calls for authentication and the current session.
 * Returns plain data objects — no UI concerns, no state management.
 *
 * API contract (what hooks can depend on):
 *   User: { id, name, email, avatarUrl?, role? }
 */
export const authService = {
  /**
   * Authenticates a user and returns the session user object.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user: Object, token?: string }>}
   */
  async login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },

  /**
   * Registers a new user account.
   * @param {{ name: string, email: string, password: string }} data
   * @returns {Promise<{ user: Object }>}
   */
  async register(data) {
    return apiClient.post('/auth/register', data);
  },

  /**
   * Ends the current session.
   * @returns {Promise<void>}
   */
  async logout() {
    return apiClient.post('/auth/logout', {});
  },

  /**
   * Returns the currently authenticated user from the active session.
   * @returns {Promise<Object>} User object
   */
  async getCurrentUser() {
    return apiClient.get('/auth/me');
  },
};
