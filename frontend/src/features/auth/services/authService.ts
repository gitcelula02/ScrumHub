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
  data: {
    token: string;
    user: ApiUser;
  };
}

interface MeResponse {
  data: ApiUser;
}

interface LoginCredentials {
  email: string;
  password?: string;
}

function mapUser(apiUser: ApiUser): User {
  return {
    id: String(apiUser.id),
    name: apiUser.username,
    email: apiUser.email,
    avatar_url: apiUser.avatar_url,
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
    return mapUser(response.data.user);
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
    return mapUser(response.data);
  },
};
