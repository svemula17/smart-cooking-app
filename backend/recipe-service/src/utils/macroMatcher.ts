/**
 * Macro-matching algorithm.
 *
 * Given the user's *remaining* macro budget for the day, find recipes whose
 * per-serving macros sum closest to that budget.
 *
 * Distance is the sum of absolute differences across the four macros, with
 * each macro normalized by its target so a 100 kcal miss isn't treated as
 * 100x worse than a 1 g protein miss. This keeps the scoring intuitive
 * regardless of which macro the user has the most/least left.
 */

export interface MacroVector {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MacroTarget {
  remaining_calories: number;
  remaining_protein: number;
  remaining_carbs: number;
  remaining_fat: number;
}

export interface ScoredRecipe<T> {
  recipe: T;
  score: number;
}

/** Avoid divide-by-zero when a macro target is exactly 0. */
function safeDenominator(value: number): number {
  return Math.max(value, 1);
}

/**
 * Compute a normalized distance score. Lower is better. Score is unit-less.
 *
 * @example
 *   scoreMacroMatch({calories: 500, protein_g: 30, carbs_g: 50, fat_g: 20},
 *                   {remaining_calories: 600, remaining_protein: 35,
 *                    remaining_carbs: 60, remaining_fat: 22});
 *   // → ~0.41 (each macro ~10% off, summed across 4 macros)
 */
export function scoreMacroMatch(recipe: MacroVector, target: MacroTarget): number {
  const dCals = Math.abs(recipe.calories - target.remaining_calories) / safeDenominator(target.remaining_calories);
  const dProt = Math.abs(recipe.protein_g - target.remaining_protein) / safeDenominator(target.remaining_protein);
  const dCarb = Math.abs(recipe.carbs_g - target.remaining_carbs) / safeDenominator(target.remaining_carbs);
  const dFat = Math.abs(recipe.fat_g - target.remaining_fat) / safeDenominator(target.remaining_fat);
  return dCals + dProt + dCarb + dFat;
}

/**
 * Rank recipes by macro distance and return the top N. Stable across ties:
 * recipes preserve their input order when scores match.
 */
export function rankByMacroMatch<T extends MacroVector>(
  recipes: T[],
  target: MacroTarget,
  topN = 10,
): ScoredRecipe<T>[] {
  return recipes
    .map((recipe, index) => ({ recipe, score: scoreMacroMatch(recipe, target), index }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, topN)
    .map(({ recipe, score }) => ({ recipe, score }));
}
