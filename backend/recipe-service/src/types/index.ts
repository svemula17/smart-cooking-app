/**
 * Shared TypeScript interfaces for the recipe-service. Names match the
 * Postgres schema (snake_case) and the public API contract.
 */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export const CUISINE_TYPES = [
  'Indian',
  'Chinese',
  'Indo-Chinese',
  'Italian',
  'Mexican',
  'Thai',
  'French',
  'Japanese',
  'Korean',
  'American',
  'Mediterranean',
] as const;
export type CuisineType = (typeof CUISINE_TYPES)[number];

export interface RecipeStep {
  step_number: number;
  instruction: string;
  time_minutes?: number;
}

export interface Recipe {
  id: string;
  name: string;
  cuisine_type: string;
  difficulty: Difficulty | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  instructions: RecipeStep[];
  image_url: string | null;
  verified_by_dietitian: boolean;
  created_at: Date;
  deleted_at?: Date | null;
}

export interface Ingredient {
  id: string;
  recipe_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  notes?: string | null;
}

export interface RecipeNutrition {
  recipe_id: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  verified_date?: Date | null;
  verified_by?: string | null;
}

export interface RecipeRatingSummary {
  recipe_id: string;
  average_rating: number;
  total_ratings: number;
}

export interface RecipeWithDetails extends Recipe {
  ingredients: Ingredient[];
  nutrition: RecipeNutrition | null;
  average_rating: number;
  total_ratings: number;
}

export interface Review {
  id: string;
  recipe_id: string;
  user_id: string;
  user_name: string | null;
  rating: number;
  comment: string | null;
  created_at: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      pagination?: PaginationParams;
    }
  }
}
