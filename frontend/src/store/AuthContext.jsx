import { createContext, useContext, useState, useCallback, useMemo } from 'react';

/**
 * @context AuthContext
 * @description Provides the authenticated user and auth actions app-wide.
 *
 * @example
 * const { user, login, logout } = useAuth();
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async (credentials) => {
    // Replace with authService.login(credentials)
    const fakeUser = { id: '1', name: 'Dev User', email: credentials.email };
    localStorage.setItem('scrumhub_token', 'fake-token');
    setUser(fakeUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('scrumhub_token');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

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
