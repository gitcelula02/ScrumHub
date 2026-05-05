import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'high-contrast';

interface ThemeRegistryType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeRegistryContext = createContext<ThemeRegistryType | undefined>(undefined);

export const ThemeRegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Apply theme class to document
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
    <ThemeRegistryContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeRegistryContext.Provider>
  );
};
