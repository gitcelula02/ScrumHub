/**
 * Theme and color utilities for ScrumHub.
 * Focuses on OKLCH color space for modern, perceptual color management.
 */

/**
 * Generates an OKLCH color string with adjusted lightness.
 * @param baseL lightness (0-1)
 * @param c chroma (0-0.4)
 * @param h hue (0-360)
 * @param alpha opacity (0-1)
 */
export const oklch = (l: number, c: number, h: number, alpha: number = 1) => {
  return `oklch(${l} ${c} ${h} / ${alpha})`;
};

/**
 * Adjusts the lightness of an OKLCH CSS variable.
 */
export const adjustLightness = (variable: string, amount: number) => {
  return `calc(${variable} + ${amount})`;
};
