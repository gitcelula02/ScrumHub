import { useContext } from 'react';
import { ThemeRegistryContext } from './ThemeRegistry';

export const useThemeRegistry = () => {
  const context = useContext(ThemeRegistryContext);
  if (context === undefined) {
    throw new Error('useThemeRegistry must be used within a ThemeRegistryProvider');
  }
  return context;
};
