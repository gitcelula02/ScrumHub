import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';

/**
 * @hook useAuthRedirect
 * @description Redirects authenticated users to /projects.
 * Use this in public pages (Landing, Login, Register) to prevent
 * authenticated users from accessing auth routes.
 *
 * @param {string} [redirectTo='/projects'] - Where to redirect authenticated users
 *
 * @example
 * function LoginPage() {
 *   useAuthRedirect();
 *   // ... rest of component
 * }
 */
export function useAuthRedirect(redirectTo = '/projects') {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, authLoading, navigate, redirectTo]);
}