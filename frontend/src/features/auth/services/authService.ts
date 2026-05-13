import { apiClient } from "@/services/apiClient";
import type { User } from "@/types";

interface AuthResponse {
  success: boolean;
  user: User;
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
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );
    return response.user;
  },

  /**
   * Logs out the current user and clears session.
   */
  logout: async (): Promise<void> => {
    return apiClient.post<void>("/auth/logout", {});
  },

  /**
   * Retrieves current session information.
   */
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<AuthResponse>("/auth/me").then((r) => r.user);
  },
};
