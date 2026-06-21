// useCookFromPantry — "what can I cook RIGHT NOW with what I have?"
//
// Pure client-side scoring: takes the user's pantry items + recipes (with
// ingredients) and computes a match%. No backend call, no LLM. Shared by
// MakeNowScreen and the Pantry "Cook Now" tab so the logic lives in one place.

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import type { Recipe, Ingredient } from '../types';
import type { RootState } from '../store';
import { recipeService } from '../services/recipeService';

export interface RecipeWithIngredients extends Recipe {
  ingredients?: Ingredient[];
}

export interface Scored {
  recipe: RecipeWithIngredients;
  matched: string[];
  missing: string[];
  matchPct: number;
}

// Loose match: pantry "tomato" matches recipe "tomato, diced" / "tomatoes".
// Bidirectional `includes` on lowercased names.
function fuzzyMatch(pantry: string[], ingredient: string): boolean {
  const ing = ingredient.toLowerCase().trim();
  return pantry.some((p) => p.includes(ing) || ing.includes(p));
}

export function scoreRecipes(recipes: RecipeWithIngredients[], pantryNames: string[]): Scored[] {
  const lcPantry = pantryNames.map((n) => n.toLowerCase().trim());
  return recipes
    .map((r): Scored => {
      const ings = r.ingredients ?? [];
      const matched: string[] = [];
      const missing: string[] = [];
      for (const ing of ings) {
        (fuzzyMatch(lcPantry, ing.ingredient_name) ? matched : missing).push(ing.ingredient_name);
      }
      const total = ings.length || 1;
      return { recipe: r, matched, missing, matchPct: matched.length / total };
    })
    .filter((s) => s.matched.length > 0 && (s.recipe.ingredients?.length ?? 0) > 0)
    .sort((a, b) => b.matchPct - a.matchPct || a.missing.length - b.missing.length);
}

export interface UseCookFromPantry {
  scored: Scored[];
  isLoading: boolean;
  pantryCount: number;
}

export function useCookFromPantry(): UseCookFromPantry {
  const pantryItems = useSelector((s: RootState) => s.pantry.items);

  // Wide page of recipes (cached an hour — the catalog rarely changes).
  const { data, isLoading } = useQuery({
    queryKey: ['make-now-recipes'],
    queryFn: async () => {
      const r1 = await recipeService.search({ limit: 100 });
      const r2 = await recipeService
        .search({ limit: 100, page: 2 })
        .catch(() => ({ recipes: [], total: 0 }));
      return [...r1.recipes, ...r2.recipes];
    },
    staleTime: 60 * 60 * 1000,
  });

  const candidatePool: Recipe[] = data ?? [];

  // Most list endpoints omit ingredients, so we batch-fetch details only for
  // recipes whose NAME contains a pantry word (coarse pre-filter → avoids
  // hundreds of network calls).
  const { data: enriched, isLoading: enriching } = useQuery({
    queryKey: ['make-now-enriched', candidatePool.length, pantryItems.length],
    enabled: candidatePool.length > 0 && pantryItems.length > 0,
    queryFn: async () => {
      const pantryTokens = pantryItems
        .map((p) => p.name.toLowerCase().split(/\s+/))
        .flat()
        .filter((t) => t.length >= 3);
      const candidates = candidatePool.filter((r) =>
        pantryTokens.some((t) => r.name.toLowerCase().includes(t)),
      );
      const top = candidates.slice(0, 40);
      const detailed = await Promise.all(
        top.map((r) => recipeService.getById(r.id).catch(() => null)),
      );
      return detailed.filter(Boolean) as RecipeWithIngredients[];
    },
    staleTime: 60 * 60 * 1000,
  });

  const scored = useMemo(() => {
    if (!enriched) return [];
    return scoreRecipes(enriched, pantryItems.map((p) => p.name));
  }, [enriched, pantryItems]);

  return { scored, isLoading: isLoading || enriching, pantryCount: pantryItems.length };
}
