/**
 * Deduplicates and sums ingredient quantities when building a shopping list
 * from multiple recipe ingredients.
 *
 * Items with the same normalized name and compatible units are merged.
 * Incompatible units are kept as separate entries.
 */

export interface RawIngredient {
  ingredient_name: string;
  quantity: number;
  unit: string;
  notes?: string | null;
}

export interface AggregatedIngredient {
  ingredient_name: string;
  quantity: number;
  unit: string;
  notes: string | null;
}

/** Normalize an ingredient name for comparison (lower, trim, collapse spaces). */
function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Normalize a unit for comparison. */
function normalizeUnit(unit: string): string {
  return unit.trim().toLowerCase().replace(/\./g, '').replace(/s$/, ''); // remove trailing 's' for plurals
}

/**
 * Aggregate a flat list of raw ingredients (e.g. from several recipe ingredient
 * rows) into deduplicated, summed line items.
 */
export function aggregateIngredients(ingredients: RawIngredient[]): AggregatedIngredient[] {
  // key: `normalizedName||normalizedUnit`
  const map = new Map<string, AggregatedIngredient>();

  for (const ing of ingredients) {
    const nameKey = normalizeName(ing.ingredient_name);
    const unitKey = normalizeUnit(ing.unit);
    const key = `${nameKey}||${unitKey}`;

    const existing = map.get(key);
    if (existing) {
      existing.quantity = Math.round((existing.quantity + ing.quantity) * 1000) / 1000;
      // Merge notes if different
      if (ing.notes && existing.notes && ing.notes !== existing.notes) {
        existing.notes = `${existing.notes}; ${ing.notes}`;
      } else if (ing.notes && !existing.notes) {
        existing.notes = ing.notes;
      }
    } else {
      map.set(key, {
        ingredient_name: ing.ingredient_name.trim(),
        quantity: ing.quantity,
        unit: ing.unit.trim(),
        notes: ing.notes ?? null,
      });
    }
  }

  return Array.from(map.values());
}
