import { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { authService } from '@/features/auth/services/authService';

/**
 * @context AuthContext
 * @description Provides the authenticated user and auth actions app-wide.
 * On mount, attempts to restore the session from a stored token.
 *
 * @example
 * const { user, login, logout, authLoading } = useAuth();
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser()
      .then(data => setUser(data?.user ?? data))
      .catch((err) => {
        if (err.status === 401) {
          setUser(null);
        }
        localStorage.removeItem('scrumhub_token');
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    const loggedUser = data?.user ?? data;
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    localStorage.removeItem('scrumhub_token');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout, authLoading }), [user, login, logout, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };