import { apiClient } from '@/services/apiClient';
import type { User } from '@/types';

interface LoginResponse {
  user: User;
  token: string;
}

interface LoginCredentials {
  email: string;
  password?: string;
}

/**
 * @service AuthService
 * Handles authentication flows and session persistence.
 */
export const authService = {
  /**
   * Performs login with credentials.
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  /**
   * Logs out the current user and clears session.
   */
  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout', {});
  },

  /**
   * Retrieves current session information.
   */
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  }
};
