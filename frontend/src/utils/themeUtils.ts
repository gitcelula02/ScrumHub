import type React from "react";

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

/**
 * Parses a hex color string into RGB components.
 * @returns {{ r: number, g: number, b: number }} or null if invalid
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace("#", "");
  if (
    !/^[0-9A-Fa-f]{6}$/.test(cleanHex) &&
    !/^[0-9A-Fa-f]{3}$/.test(cleanHex)
  ) {
    return null;
  }

  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((c) => c + c)
          .join("")
      : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Converts RGB (0-255) to OKLCH components.
 * @returns {{ l: number, c: number, h: number }}
 */
export function rgbToOklch(
  r: number,
  g: number,
  b: number,
): { l: number; c: number; h: number } {
  // RGB to XYZ (D65 illuminant)
  let rn = r / 255;
  let gn = g / 255;
  let bn = b / 255;

  rn = rn <= 0.04045 ? rn / 12.92 : Math.pow((rn + 0.055) / 1.055, 2.4);
  gn = gn <= 0.04045 ? gn / 12.92 : Math.pow((gn + 0.055) / 1.055, 2.4);
  bn = bn <= 0.04045 ? bn / 12.92 : Math.pow((bn + 0.055) / 1.055, 2.4);

  const x = (rn * 0.4124564 + gn * 0.3575761 + bn * 0.1804375) / 0.951214;
  const y = (rn * 0.2126729 + gn * 0.7151522 + bn * 0.072175) / 1.0;
  const z = (rn * 0.0193339 + gn * 0.119192 + bn * 0.9503041) / 0.078476;

  const lLab = y > 0.008856 ? 116 * Math.pow(y, 1 / 3) - 16 : 903.3 * y;
  const aLab = 500 * (Math.pow(x, 1 / 3) - Math.pow(y, 1 / 3));
  const bLab = 200 * (Math.pow(y, 1 / 3) - Math.pow(z, 1 / 3));

  const c = Math.sqrt(aLab * aLab + bLab * bLab);
  const h = Math.atan2(bLab, aLab) * (180 / Math.PI);
  const l = lLab / 100;

  return { l, c, h: h < 0 ? h + 360 : h };
}

/**
 * Converts OKLCH back to RGB for CSS output.
 * @param l lightness (0-1)
 * @param c chroma
 * @param h hue (0-360)
 */
export function oklchToRgb(
  l: number,
  c: number,
  h: number,
): { r: number; g: number; b: number } {
  // OKLab to XYZ
  const lLab = l * 100;
  const aLab = c * Math.cos((h * Math.PI) / 180);
  const bLabVal = c * Math.sin((h * Math.PI) / 180);

  const y = (lLab + 16) / 116;
  const x = aLab / 500 + Math.pow(y, 3);
  const z = Math.pow(y, 3) - bLabVal / 200;

  const y3 = y * y * y;
  const x3 = x * x * x;
  const z3 = z * z * z;

  const rLinear = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
  const gLinear = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
  const bLinear = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

  const r =
    (rLinear * 3.2404542 + gLinear * -1.5371385 + bLinear * -0.4985314) * 255;
  const g =
    (rLinear * -0.969266 + gLinear * 1.8760108 + bLinear * 0.041556) * 255;
  const bVal =
    (rLinear * 0.0556434 + gLinear * -0.2040259 + bLinear * 1.0572252) * 255;

  return {
    r: Math.max(0, Math.min(255, Math.round(r))),
    g: Math.max(0, Math.min(255, Math.round(g))),
    b: Math.max(0, Math.min(255, Math.round(bVal))),
  };
}

/**
 * Converts hex color to OKLCH components.
 * @returns {{ l: number, c: number, h: number }} or null if invalid
 */
export function hexToOklch(
  hex: string,
): { l: number; c: number; h: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToOklch(rgb.r, rgb.g, rgb.b);
}

/**
 * Generates a "Sober" entity theme from a hex color.
 *
 * The "Sober" aesthetic uses muted, desaturated variants while maintaining
 * the hue identity of the original color. Returns CSS variable set.
 *
 * @param hex - Source hex color (e.g., "#007ACC")
 * @returns {{ [key: string]: string }} CSS properties with --entity-* variables
 */
export function generateEntityTheme(hex: string): React.CSSProperties {
  const oklch = hexToOklch(hex);

  if (!oklch) {
    return DEFAULT_ENTITY_THEME;
  }

  const { l, c, h } = oklch;

  // --entity-solid: original vibrant color (keep the base hex for visual identity)
  // --entity-bg: muted, dark background (low lightness, reduced chroma)
  const bgL = Math.max(0.12, l * 0.25);
  const bgC = c * 0.15;
  const bgColor = `oklch(${bgL} ${bgC} ${h})`;

  // --entity-border: subtle border (slightly lighter than bg, more chroma)
  const borderL = Math.max(0.18, l * 0.3);
  const borderC = c * 0.25;
  const borderColor = `oklch(${borderL} ${borderC} ${h})`;

  // --entity-fg: high contrast text (very light on dark)
  const fgL = Math.min(0.95, l * 1.4 + 0.3);
  const fgC = c * 0.1;
  const fgColor = `oklch(${fgL} ${fgC} ${h})`;

  return {
    "--entity-solid": hex,
    "--entity-bg": bgColor,
    "--entity-border": borderColor,
    "--entity-fg": fgColor,
  };
}

/**
 * Default fallback theme used when no entity color is available.
 */
export const DEFAULT_ENTITY_THEME: React.CSSProperties = {
  "--entity-solid": "oklch(0.55 0.16 250)",
  "--entity-bg": "oklch(0.55 0.16 250 / 0.12)",
  "--entity-border": "oklch(0.55 0.16 250 / 0.45)",
  "--entity-fg": "oklch(0.98 0 0)",
};
