import { useMemo } from 'react';
import { buildEntityTheme } from '../utils/themeUtils';

/**
 * @hook useEntityTheme
 * @description Converts a user-chosen hex color into a scoped inline style
 * object ready to spread onto a container element as `style={theme}`.
 *
 * Child components consume the resulting CSS variables:
 *   var(--entity-bg)     — soft translucent fill
 *   var(--entity-fg)     — high-contrast text color
 *   var(--entity-border) — medium-opacity accent for borders
 *   var(--entity-solid)  — full-opacity accent for dots, icons
 *
 * ARCHITECTURE NOTE:
 * This hook is the only place that knows about the hex → CSS var mapping.
 * UI components (EpicBadge, SprintPill, etc.) are completely color-agnostic:
 * they only reference var(--entity-*) in their CSS. This means:
 *   - Colors update automatically when the API returns new data
 *   - No prop drilling of color values deeper than the container
 *   - CSS variable scoping prevents bleed between sibling entities
 *
 * @param {string | null | undefined} color
 *   Hex string from the entity record. Falls back to a neutral gray
 *   if null/undefined (e.g. before data loads or for uncolored entities).
 *
 * @returns {React.CSSProperties} Inline style object with --entity-* vars.
 *
 * @example <caption>Basic badge usage</caption>
 * function EpicBadge({ epic }) {
 *   const theme = useEntityTheme(epic.color);
 *   return <span className="entity-badge" style={theme}>{epic.name}</span>;
 * }
 *
 * @example <caption>Row accent border</caption>
 * function BacklogRow({ epic }) {
 *   const theme = useEntityTheme(epic.color);
 *   return <tr className="entity-accent-border" style={theme}>…</tr>;
 * }
 */
export function useEntityTheme(color) {
  return useMemo(() => {
    if (!color) return {};
    return buildEntityTheme(color);
  }, [color]);
}
