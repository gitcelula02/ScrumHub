import { createContext, useContext, useCallback, useMemo, useRef } from 'react';
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
 *   <ThemeRegistryProvider>
 *     <App />
 *   </ThemeRegistryProvider>
 *
 * Then inside any component:
 *   const { getTheme, registerEntities } = useThemeRegistry();
 *   const theme = getTheme(epic.id);   // returns CSS vars object
 *
 * POPULATING THE CACHE:
 * Feature hooks call registerEntities() when API data arrives.
 * See useProjects, useBacklog, useSprints for examples.
 *
 * @example
 * // In useProjects.js, after fetching:
 * registerEntities(projects.map(p => ({ id: p.id, color: p.color })));
 */

const ThemeRegistryContext = createContext(null);

export function ThemeRegistryProvider({ children }) {
  // useRef so cache mutations never trigger re-renders
  const cacheRef = useRef(new Map());

  /**
   * Registers an array of color-carrying entities into the cache.
   * Safe to call on every data fetch — only recomputes if color changed.
   *
   * @param {Array<{ id: string, color: string }>} entities
   */
  const registerEntities = useCallback((entities) => {
    entities.forEach(({ id, color }) => {
      if (!color) return;
      const existing = cacheRef.current.get(id);
      // Only recompute if the color has actually changed
      if (!existing || existing._hex !== color) {
        const theme = buildEntityTheme(color);
        cacheRef.current.set(id, { ...theme, _hex: color });
      }
    });
  }, []);

  /**
   * Returns the cached CSS variable set for an entity.
   * Falls back to an empty object if the entity hasn't been registered yet
   * (component will use CSS fallback values from .entity-badge defaults).
   *
   * @param {string} entityId
   * @returns {React.CSSProperties}
   */
  const getTheme = useCallback((entityId) => {
    const entry = cacheRef.current.get(entityId);
    if (!entry) return {};
    // Strip the internal _hex key before returning as a style prop
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

/**
 * @hook useThemeRegistry
 * @returns {{ registerEntities: Function, getTheme: Function }}
 */
export function useThemeRegistry() {
  const ctx = useContext(ThemeRegistryContext);
  if (!ctx) {
    throw new Error('useThemeRegistry must be used inside <ThemeRegistryProvider>');
  }
  return ctx;
}
