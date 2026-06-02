// scaleQuantity.ts — format ingredient amounts as humans actually write
// recipes. Avoid junk like "1.3333333333 cups" or "0.07 tsp".
//
// Strategy:
//   * round small things (< 10) to the nearest common fraction (½, ⅓, ¼, ⅔, ¾, ⅛)
//   * round medium things (10–100) to the nearest 1
//   * round large things (≥100) to the nearest 5 or 10

const FRACTIONS: Array<[number, string]> = [
  [0.125, '⅛'], [0.25, '¼'], [0.333, '⅓'],
  [0.5,  '½'], [0.667, '⅔'], [0.75, '¾'], [0.875, '⅞'],
];

function nearestFraction(decimal: number): string | null {
  let best: [number, string] = [Infinity, ''];
  for (const [v, s] of FRACTIONS) {
    const d = Math.abs(v - decimal);
    if (d < best[0]) best = [d, s];
  }
  return best[0] < 0.06 ? best[1] : null;
}

/**
 * Pretty-print a scaled quantity.
 *
 *   formatScaled(1, 2) → "2"
 *   formatScaled(1, 0.5) → "½"
 *   formatScaled(1.5, 2) → "3"
 *   formatScaled(1, 1.333) → "1⅓"
 *   formatScaled(150, 1.5) → "225"
 */
export function formatScaled(baseQuantity: number | null | undefined, factor: number): string {
  if (baseQuantity == null) return '';
  const v = baseQuantity * factor;

  // Big numbers: round to nearest 5 (or 10 if ≥ 500)
  if (v >= 500) return String(Math.round(v / 10) * 10);
  if (v >= 100) return String(Math.round(v / 5) * 5);
  if (v >= 10)  return String(Math.round(v));

  // Small numbers: try whole + fraction
  const whole = Math.floor(v);
  const decimal = v - whole;
  if (decimal < 0.06) return String(whole);
  if (decimal > 0.94) return String(whole + 1);

  const frac = nearestFraction(decimal);
  if (frac) return whole === 0 ? frac : `${whole}${frac}`;

  // Fallback — keep 1 decimal place
  return v.toFixed(1).replace(/\.0$/, '');
}
