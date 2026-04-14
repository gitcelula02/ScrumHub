/**
 * @module themeUtils
 * @description Pure color math utilities for the dynamic entity color system.
 * No React, no side effects — these are plain JS functions safe to use
 * anywhere (hooks, services, tests).
 *
 * ARCHITECTURE NOTE:
 * Entity colors (projects, epics, sprints) are stored as hex strings in the
 * API response. At render time, useEntityTheme() calls these utils to derive
 * a full CSS variable set from that single hex value.
 * Components never hardcode colors — they only consume var(--entity-*).
 */

/**
 * Parses a hex color string into its R, G, B integer components.
 * Handles both shorthand (#abc) and full (#aabbcc) formats.
 *
 * @param {string} hex - e.g. "#3B6D11" or "#3b6"
 * @returns {{ r: number, g: number, b: number }}
 */
export function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  return {
    r: parseInt(full.substring(0, 2), 16),
    g: parseInt(full.substring(2, 4), 16),
    b: parseInt(full.substring(4, 6), 16),
  };
}

/**
 * Converts R, G, B integers back to a #rrggbb hex string.
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Appends an alpha channel to a hex color, returning an rgba() CSS string.
 *
 * @param {string} hex
 * @param {number} alpha - 0 to 1
 * @returns {string} e.g. "rgba(59, 109, 17, 0.15)"
 */
export function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Calculates the perceived luminance of a color using the WCAG formula.
 * Used to decide whether text on this background should be dark or light.
 *
 * @param {string} hex
 * @returns {number} 0 (black) to 1 (white)
 */
export function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Returns a readable foreground color (dark or light) for text placed
 * on top of the given background hex color, meeting WCAG AA contrast.
 *
 * @param {string} backgroundHex
 * @param {{ dark?: string, light?: string }} [options]
 * @returns {string} hex color for text
 */
export function getContrastColor(backgroundHex, options = {}) {
  const { dark = '#1e2240', light = '#ffffff' } = options;
  const lum = getLuminance(backgroundHex);
  // WCAG threshold: use dark text when background is light (lum > 0.35)
  return lum > 0.35 ? dark : light;
}

/**
 * Lightens a hex color by mixing it toward white.
 *
 * @param {string} hex
 * @param {number} amount - 0 (no change) to 1 (pure white)
 * @returns {string} lightened hex
 */
export function lighten(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

/**
 * Darkens a hex color by mixing it toward black.
 *
 * @param {string} hex
 * @param {number} amount - 0 (no change) to 1 (pure black)
 * @returns {string} darkened hex
 */
export function darken(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/**
 * Derives the full CSS variable set for an entity from its stored hex color.
 * This is the single source of truth for how entity colors map to CSS values.
 *
 * Returned keys correspond 1:1 with CSS variables consumed by .entity-badge
 * and .entity-accent-border in _utilities.css.
 *
 * @param {string} hex - The entity's stored color, e.g. "#3B6D11"
 * @returns {{
 *   '--entity-bg':     string,  // soft fill  (15% alpha)
 *   '--entity-fg':     string,  // readable text on that fill
 *   '--entity-border': string,  // medium accent (50% alpha)
 *   '--entity-solid':  string,  // full-opacity accent for dot/icon
 * }}
 */
export function buildEntityTheme(hex) {
  const bg = hexToRgba(hex, 0.12);
  const border = hexToRgba(hex, 0.45);
  // fg contrast is calculated against the lightened fill, not the raw hex
  const lightFill = lighten(hex, 0.85);
  const fg = getContrastColor(lightFill, {
    dark: darken(hex, 0.3),   // use a darkened variant of the brand color
    light: '#ffffff',
  });

  return {
    '--entity-bg':     bg,
    '--entity-fg':     fg,
    '--entity-border': border,
    '--entity-solid':  hex,
  };
}
