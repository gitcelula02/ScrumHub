import { useContext } from 'react';
import { ThemeRegistryContext } from './ThemeRegistry';

/**
 * @hook useThemeRegistry
 * @description Access the theme registry for entity color theming.
 *
 * @returns {{ registerEntities: Function, getTheme: Function }}
 *
 * @example
 * const { getTheme, registerEntities } = useThemeRegistry();
 */
export function useThemeRegistry() {
  const ctx = useContext(ThemeRegistryContext);
  if (!ctx) {
    throw new Error('useThemeRegistry must be used inside <ThemeRegistryProvider>');
  }
  return ctx;
}