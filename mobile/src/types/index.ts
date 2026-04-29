export interface User {
  id: string;
  email: string;
  name: string;
  dietaryPreferences: string[];
  allergies: string[];
  dailyCalorieGoal: number;
}

export interface Recipe {
  id: string;
  title: string;
  cuisine: string;
  imageUrl: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  steps: RecipeStep[];
  nutrition: NutritionInfo;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeStep {
  order: number;
  instruction: string;
  durationSeconds?: number;
}

export interface NutritionInfo {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
}

export interface MacroProgress {
  consumed: NutritionInfo;
  goal: NutritionInfo;
}

export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
