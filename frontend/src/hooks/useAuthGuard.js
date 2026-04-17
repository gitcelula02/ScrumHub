import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';

/**
 * @hook useAuthGuard
 * @description Redirects unauthenticated users to /login.
 * Use this in AppShell or any protected route wrapper to ensure
 * only authenticated users can access the wrapped content.
 *
 * @param {string} [redirectTo='/login'] - Where to redirect unauthenticated users
 *
 * @example
 * function AppShell() {
 *   useAuthGuard();
 *   // ... rest of component
 * }
 */
export function useAuthGuard(redirectTo = '/login') {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, authLoading, navigate, redirectTo]);
}