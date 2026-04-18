import { createContext, useCallback, useMemo, useRef } from 'react';
import { buildEntityTheme } from '../utils/themeUtils';

/**
 * @context ThemeRegistry
 * @description Global cache that maps entityId → computed CSS variable set.
 *
 * WHY THIS EXISTS:
 * The same epic color might render in the sidebar nav, the backlog table,
 * a sprint board header, and multiple task cards simultaneously.
 * Without a registry, each component independently calls buildEntityTheme()
 * on every render cycle. This context memoizes the output by entityId
 * so the hex → CSS math runs at most once per unique (entityId, color) pair.
 *
 * USAGE:
 * Wrap the app (inside RouterProvider, outside page components):
 * <ThemeRegistryProvider>
 * <App />
 * </ThemeRegistryProvider>
 *
 * Then inside any component:
 * const { getTheme, registerEntities } = useThemeRegistry();
 * const theme = getTheme(epic.id); // returns CSS vars object
 *
 * POPULATING THE CACHE:
 * Feature hooks call registerEntities() when API data arrives.
 * See useProjects, useBacklog, useSprints for examples.
 */
const ThemeRegistryContext = createContext(null);

export function ThemeRegistryProvider({ children }) {
  const cacheRef = useRef(new Map());

  const registerEntities = useCallback((entities) => {
    entities.forEach(({ id, color }) => {
      if (!color) return;
      const existing = cacheRef.current.get(id);
      if (!existing || existing._hex !== color) {
        const theme = buildEntityTheme(color);
        cacheRef.current.set(id, { ...theme, _hex: color });
      }
    });
  }, []);

  const getTheme = useCallback((entityId) => {
    const entry = cacheRef.current.get(entityId);
    if (!entry) return {};
    const { _hex, ...style } = entry;
    return style;
  }, []);

  const value = useMemo(() => ({ registerEntities, getTheme }), [registerEntities, getTheme]);

  return (
    <ThemeRegistryContext.Provider value={value}>
      {children}
    </ThemeRegistryContext.Provider>
  );
}

export { ThemeRegistryContext };