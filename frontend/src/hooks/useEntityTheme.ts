import type React from 'react';
import { useMemo } from 'react';
import { useEntityThemeRegistry } from '@/store/ThemeRegistry';
import { DEFAULT_ENTITY_THEME } from '@/utils/themeUtils';

/**
 * @hook useEntityTheme
 * Returns CSS variables for an entity's color theme.
 *
 * Uses the EntityThemeRegistry to cache computed themes, ensuring
 * O(1) lookup after first computation.
 *
 * @param entityId - Unique identifier for the entity (e.g., project.id)
 * @param color - The entity's color hex string (e.g., project.color)
 * @returns React.CSSProperties object with --entity-* CSS variables
 *
 * @example
 * const theme = useEntityTheme(project.id, project.color);
 * <div style={theme}>
 *   <div style={{ backgroundColor: 'var(--entity-solid)' }}>Icon</div>
 * </div>
 */
export function useEntityTheme(entityId: string, color: string | undefined | null): React.CSSProperties {
  const { getTheme } = useEntityThemeRegistry();

  return useMemo(() => {
    if (!entityId) {
      return DEFAULT_ENTITY_THEME;
    }
    return getTheme(entityId, color);
  }, [entityId, color, getTheme]);
}