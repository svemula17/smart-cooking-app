import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { selectRecipe } from '../store';
import { recipeService } from '../services/recipeService';
import type { Recipe } from '../types';

export function useRecipesByCuisine(cuisine: string, enabled = true) {
  return useQuery({
    queryKey: ['recipes', 'cuisine', cuisine],
    queryFn: () => recipeService.getByCuisine(cuisine, { limit: 30 }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecipeSearch(q: string, filters?: { cuisine_type?: string; difficulty?: string }) {
  return useQuery({
    queryKey: ['recipes', 'search', q, filters],
    queryFn: () => recipeService.search({ q, ...filters, limit: 20 }),
    enabled: q.length > 0 || Object.values(filters ?? {}).some(Boolean),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecipeDetail(id: string, enabled = true) {
  const dispatch = useDispatch<AppDispatch>();
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const recipe = await recipeService.getById(id);
      dispatch(selectRecipe(recipe));
      return recipe;
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecipeReviews(id: string) {
  return useQuery({
    queryKey: ['reviews', id],
    queryFn: () => recipeService.getReviews(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAllRecipes(limit = 20) {
  return useQuery({
    queryKey: ['recipes', 'all', limit],
    queryFn: () => recipeService.getRecipes({ limit }),
    staleTime: 5 * 60 * 1000,
  });
}
