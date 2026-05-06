import { aiApi } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ChatRequest {
  message: string;
  /** Optional recipe context — injected as system context by the AI service */
  context?: {
    recipeId?: string;
    recipeName?: string;
    currentStep?: number;
    ingredients?: string[];
  };
  /** Pass previous messages to keep multi-turn context */
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ChatResponse {
  reply: string;
  /** Token usage from the underlying LLM (optional, logged by service) */
  usage?: { prompt_tokens: number; completion_tokens: number };
}

export interface RecipeSuggestion {
  recipeId: string;
  recipeName: string;
  reason: string;
  matchScore: number;
}

export interface MealPlanDay {
  date: string;          // ISO "YYYY-MM-DD"
  breakfast?: RecipeSuggestion;
  lunch?: RecipeSuggestion;
  dinner?: RecipeSuggestion;
  snack?: RecipeSuggestion;
}

export interface SubstitutionResult {
  ingredient: string;
  substitutes: Array<{ name: string; ratio: string; notes: string }>;
}

export interface OptimisedPlan {
  days: MealPlanDay[];
  totalCalories: number;
  achievedGoals: string[];
  warnings: string[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const aiService = {
  /**
   * Send a single chat message and receive a reply.
   * Optionally pass recipe context and conversation history for continuity.
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const res = await aiApi.post<{ data: ChatResponse }>('/ai/chat', request);
    return res.data.data;
  },

  /**
   * Ask for ingredient substitution suggestions.
   * e.g. "What can I use instead of heavy cream?"
   */
  async getSubstitutions(
    ingredient: string,
    recipeContext?: string,
  ): Promise<SubstitutionResult> {
    const res = await aiApi.post<{ data: SubstitutionResult }>(
      '/ai/substitutions',
      { ingredient, recipe_context: recipeContext },
    );
    return res.data.data;
  },

  /**
   * Get personalised recipe suggestions based on user macros and pantry.
   * Calls the AI service's macro-aware recommender.
   */
  async getSuggestions(params: {
    remainingCalories: number;
    remainingProtein: number;
    remainingCarbs: number;
    remainingFat: number;
    dietaryRestrictions?: string[];
    favoriteCuisines?: string[];
    limit?: number;
  }): Promise<RecipeSuggestion[]> {
    const res = await aiApi.post<{ data: { suggestions: RecipeSuggestion[] } }>(
      '/ai/suggestions',
      {
        remaining_calories: params.remainingCalories,
        remaining_protein:  params.remainingProtein,
        remaining_carbs:    params.remainingCarbs,
        remaining_fat:      params.remainingFat,
        dietary_restrictions: params.dietaryRestrictions ?? [],
        favorite_cuisines:    params.favoriteCuisines ?? [],
        limit: params.limit ?? 5,
      },
    );
    return res.data.data.suggestions ?? [];
  },

  /**
   * Generate a weekly meal plan optimised for the user's macro goals.
   * Uses OR-Tools on the backend (ai-service).
   */
  async generateMealPlan(params: {
    userId: string;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    dietaryRestrictions?: string[];
    daysAhead?: number;
  }): Promise<OptimisedPlan> {
    const res = await aiApi.post<{ data: OptimisedPlan }>(
      '/ai/meal-plan',
      {
        user_id:               params.userId,
        target_calories:       params.targetCalories,
        target_protein:        params.targetProtein,
        target_carbs:          params.targetCarbs,
        target_fat:            params.targetFat,
        dietary_restrictions:  params.dietaryRestrictions ?? [],
        days_ahead:            params.daysAhead ?? 7,
      },
    );
    return res.data.data;
  },

  /**
   * Ask a quick cooking tip question without full history context.
   * Useful for "Ask AI" FAB in CookingMode.
   */
  async quickTip(
    question: string,
    recipeName?: string,
    stepInstruction?: string,
  ): Promise<string> {
    const context = recipeName
      ? { recipeName, currentInstruction: stepInstruction }
      : undefined;
    const result = await aiService.chat({ message: question, context });
    return result.reply;
  },
};
