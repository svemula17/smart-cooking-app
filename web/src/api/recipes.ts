import { recipeApi } from './client';

export interface Recipe {
  id: string;
  name: string;
  cuisine_type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  average_rating: number;
  total_ratings: number;
  image_url?: string | null;
  created_at: string;
}

export interface Ingredient {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  notes: string | null;
}

export interface Nutrition {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
}

export interface RecipeDetail extends Recipe {
  ingredients: Ingredient[];
  nutrition: Nutrition | null;
  instructions: { step_number: number; instruction: string; time_minutes?: number }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export async function listRecipes(params: {
  page?: number;
  limit?: number;
  cuisine_type?: string;
  difficulty?: string;
  max_cook_time?: number;
}): Promise<{ recipes: Recipe[]; pagination: Pagination }> {
  const res = await recipeApi.get('/recipes', { params });
  return res.data.data;
}

export async function searchRecipes(params: {
  q?: string;
  cuisine_type?: string;
  difficulty?: string;
  min_protein?: number;
  page?: number;
  limit?: number;
}): Promise<{ recipes: Recipe[]; pagination: Pagination }> {
  const res = await recipeApi.get('/recipes/search', { params });
  return res.data.data;
}

export async function getRecipe(id: string): Promise<RecipeDetail> {
  const res = await recipeApi.get(`/recipes/${id}`);
  return res.data.data;
}

export async function rateRecipe(id: string, rating: number, comment?: string): Promise<{ average_rating: number; total_ratings: number }> {
  const res = await recipeApi.post(`/recipes/${id}/rate`, { rating, comment });
  return res.data.data;
}

export async function macroMatch(params: {
  remaining_calories: number;
  remaining_protein: number;
  remaining_carbs: number;
  remaining_fat: number;
}): Promise<{ matches: Array<Recipe & { score: number }> }> {
  const res = await recipeApi.get('/recipes/macro-match', { params });
  return res.data.data;
}
