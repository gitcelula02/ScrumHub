import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { generateEntityTheme, DEFAULT_ENTITY_THEME } from '@/utils/themeUtils';

type Theme = 'dark' | 'light' | 'high-contrast';

interface ThemeRegistryType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface EntityThemeRegistry {
  getTheme: (entityId: string, color: string | undefined | null) => React.CSSProperties;
}

const ThemeRegistryCtx = createContext<ThemeRegistryType | undefined>(undefined);
const EntityThemeRegistryCtx = createContext<EntityThemeRegistry | undefined>(undefined);

export function ThemeRegistryProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'high-contrast');
    root.classList.add(theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  return (
    <ThemeRegistryCtx.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeRegistryCtx.Provider>
  );
}

export function EntityThemeRegistryProvider({ children }: { children: React.ReactNode }) {
  const cache = useMemo(() => new Map<string, React.CSSProperties>(), []);

  const getTheme = useCallback((entityId: string, color: string | undefined | null): React.CSSProperties => {
    if (!color) {
      return DEFAULT_ENTITY_THEME;
    }

    if (cache.has(entityId)) {
      return cache.get(entityId)!;
    }

    const theme = generateEntityTheme(color);
    cache.set(entityId, theme);
    return theme;
  }, [cache]);

  const value = useMemo(() => ({ getTheme }), [getTheme]);

  return (
    <EntityThemeRegistryCtx.Provider value={value}>
      {children}
    </EntityThemeRegistryCtx.Provider>
  );
}

export function useThemeRegistry() {
  const context = useContext(ThemeRegistryCtx);
  if (context === undefined) {
    throw new Error('useThemeRegistry must be used within a ThemeRegistryProvider');
  }
  return context;
}

export function useEntityThemeRegistry() {
  const context = useContext(EntityThemeRegistryCtx);
  if (context === undefined) {
    throw new Error('useEntityThemeRegistry must be used within an EntityThemeRegistryProvider');
  }
  return context;
}