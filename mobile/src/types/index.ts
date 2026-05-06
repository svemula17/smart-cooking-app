// ─── Auth & User ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  is_admin?: boolean;
  created_at: string;
}

export interface MacroGoals {
  calories_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
}

export interface UserPreferences extends MacroGoals {
  dietary_restrictions: string[];
  favorite_cuisines: string[];
}

// ─── Recipes ─────────────────────────────────────────────────────────────────

export interface Recipe {
  id: string;
  name: string;
  cuisine_type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  image_url: string | null;
  average_rating: number;
  total_ratings: number;
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

export interface RecipeStep {
  step_number: number;
  instruction: string;
  time_minutes?: number;
}

export interface RecipeWithDetails extends Recipe {
  ingredients: Ingredient[];
  nutrition: Nutrition | null;
  instructions: RecipeStep[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user_name: string;
  created_at: string;
}

// ─── Shopping ─────────────────────────────────────────────────────────────────

export interface ShoppingItem {
  id: string;
  list_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  aisle: string | null;
  is_checked: boolean;
  notes: string | null;
}

export interface ShoppingList {
  id: string;
  name: string;
  status: 'active' | 'completed';
  recipe_ids: string[];
  created_at: string;
  completed_at: string | null;
}

export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type PendingGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  restrictions: string[];
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: { initialMode?: 'login' | 'register'; pendingGoals?: PendingGoals } | undefined;
  Tabs: undefined;
  RecipeBrowser: { cuisine: string };
  RecipeDetail: { recipeId: string };
  CookingMode: { recipeId: string };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  AIChat: undefined;
  Shopping: undefined;
  Profile: undefined;
};

// ─── API envelopes ────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}
