import { apiClient } from "@/services/apiClient";
import type { User } from "@/types";

interface ApiUser {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  default_language?: string;
  created_at?: string;
}

interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
  };
}

interface MeResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
  };
}

interface LoginCredentials {
  email: string;
  password?: string;
}

function mapUser(apiUser: { id: string | number; name: string; username?: string; email: string; avatar_url?: string; avatar?: string; created_at?: string }): User {
  return {
    id: String(apiUser.id),
    name: apiUser.name || apiUser.username || "",
    email: apiUser.email,
    avatar_url: apiUser.avatar_url || apiUser.avatar || "",
    createdAt: apiUser.created_at,
  };
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
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );
    return mapUser(response.user);
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
    const response = await apiClient.get<MeResponse>("/auth/me");
    return mapUser(response.user);
  },
};
