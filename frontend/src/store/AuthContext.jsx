import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
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
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session on app load
  useEffect(() => {
    authService.getCurrentUser()
      .then(data => setUser(data?.user ?? data))
      .catch(() => localStorage.removeItem('scrumhub_token'))
      .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    // Backend returns session cookie
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

/**
 * @hook useAuth
 * @returns {{ user: Object|null, login: Function, logout: Function }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
