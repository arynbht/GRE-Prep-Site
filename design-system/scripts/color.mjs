/** Shared colour maths. Imported by build-tokens.mjs and build-glass-theme.mjs
 *  so both palettes are measured by identical code. */

export function parseHex(hex) {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

export const toHex = (rgb) =>
  '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0').toUpperCase()).join('');

/** Blend `amount` of `top` into `base`, in sRGB, the way a flat overlay reads. */
export function mix(top, base, amount) {
  const a = parseHex(top);
  const b = parseHex(base);
  return toHex(a.map((v, i) => v * amount + b[i] * (1 - amount)));
}

export function relativeLuminance(hex) {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Lighten toward white / darken toward black by `amount`. */
export const lighten = (hex, amount) => mix('#FFFFFF', hex, amount);
export const darken = (hex, amount) => mix('#000000', hex, amount);

/**
 * Picks whichever of two candidates clears `required` against `bg`, preferring
 * the first. Returns null when neither does, so the caller can report rather
 * than silently ship a failing pair.
 */
export function firstPassing(candidates, bg, required) {
  for (const candidate of candidates) {
    if (contrast(candidate, bg) >= required) return candidate;
  }
  return null;
}
