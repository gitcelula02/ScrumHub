import { useContext } from 'react';
import { AuthContext } from '@/store/AuthContext';

/**
 * @hook useAuthSession
 * Provides access to the global authentication state and session management functions.
 */
export function useAuthSession() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthSession must be used within an AuthProvider');
  }

  return context;
}
