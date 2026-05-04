import { recipeApi } from './api';
import type { Recipe, RecipeWithDetails, Review, Pagination } from '../types';

interface ListResponse {
  recipes: Recipe[];
  pagination: Pagination;
}

export const recipeService = {
  async getRecipes(params?: {
    page?: number;
    limit?: number;
    cuisine_type?: string;
    difficulty?: string;
    max_cook_time?: number;
  }): Promise<ListResponse> {
    const res = await recipeApi.get('/recipes', { params });
    return res.data.data;
  },

  async getByCuisine(cuisine: string, params?: { page?: number; limit?: number }): Promise<ListResponse> {
    const res = await recipeApi.get(`/recipes/cuisine/${encodeURIComponent(cuisine)}`, { params });
    return res.data.data;
  },

  async search(params: {
    q?: string;
    cuisine_type?: string;
    difficulty?: string;
    min_protein?: number;
    max_cook_time?: number;
    page?: number;
    limit?: number;
  }): Promise<ListResponse> {
    const res = await recipeApi.get('/recipes/search', { params });
    return res.data.data;
  },

  async getById(id: string): Promise<RecipeWithDetails> {
    const res = await recipeApi.get(`/recipes/${id}`);
    return res.data.data;
  },

  async rate(id: string, rating: number, comment?: string): Promise<{ average_rating: number; total_ratings: number }> {
    const res = await recipeApi.post(`/recipes/${id}/rate`, { rating, comment });
    return res.data.data;
  },

  async getReviews(id: string): Promise<Review[]> {
    const res = await recipeApi.get(`/recipes/${id}/reviews`);
    return res.data.data.reviews ?? [];
  },

  async macroMatch(params: {
    remaining_calories: number;
    remaining_protein: number;
    remaining_carbs: number;
    remaining_fat: number;
  }): Promise<Array<Recipe & { score: number }>> {
    const res = await recipeApi.get('/recipes/macro-match', { params });
    return res.data.data.matches ?? [];
  },
};
