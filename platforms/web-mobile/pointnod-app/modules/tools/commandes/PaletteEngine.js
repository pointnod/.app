/**
 * pointnod-app Pixels — PaletteEngine
 * Pure color generation — no state, no side effects.
 * All methods take inputs and return new arrays.
 */

export class PaletteEngine {
  /**
   * Generate a harmony palette from a base hex color.
   * @param {string} baseHex
   * @param {'monochrome'|'analogous'|'complementary'|'gradient'|'triadic'} mode
   * @returns {string[]} unique hex colors
   */
  generate(baseHex, mode) {
    const rgb        = hexToRgb(baseHex) ?? { r: 0, g: 0, b: 0 };
    const [h, s, l]  = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors     = [baseHex];

    switch (mode) {
      case 'monochrome':
        for (let i = 1; i <= 8; i++)
          colors.push(hslToHex(h, s, clamp(l + (i - 4) * 15, 10, 90)));
        break;

      case 'analogous':
        for (let i = -4; i <= 4; i++)
          if (i !== 0) colors.push(hslToHex((h + i * 20 + 360) % 360, s, l));
        break;

      case 'complementary':
        colors.push(hslToHex((h + 180) % 360, s, l));
        for (let i = 1; i <= 3; i++) {
          colors.push(hslToHex(h,              s, clamp(l - i * 20, 10, 90)));
          colors.push(hslToHex((h + 180) % 360, s, clamp(l - i * 20, 10, 90)));
        }
        break;

      case 'gradient':
        for (let i = 1; i <= 10; i++)
          colors.push(hslToHex(h, Math.max(0, s - i * 10), Math.min(100, l + i * 5)));
        break;

      case 'triadic':
        colors.push(hslToHex((h + 120) % 360, s, l));
        colors.push(hslToHex((h + 240) % 360, s, l));
        break;
    }

    return [...new Set(colors)];
  }

  /** Random palette of N colors */
  random(count = 7) {
    return Array.from({ length: count }, () =>
      '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
    );
  }
}

// ─── Pure color math ─────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
      .toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
