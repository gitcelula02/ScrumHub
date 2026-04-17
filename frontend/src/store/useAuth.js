import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * @hook useAuth
 * @description Access the auth context for user and auth actions.
 *
 * @returns {{ user: Object|null, login: Function, logout: Function, authLoading: boolean }}
 *
 * @example
 * const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}