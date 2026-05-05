import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../store/useAuth';

export const useAuthRedirect = (to: string = '/') => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to });
    }
  }, [isAuthenticated, isLoading, navigate, to]);
};
