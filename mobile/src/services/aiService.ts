import { aiApi } from './api';

// ─── Types (mirroring backend ai-service/app/schemas/ai.py) ──────────────────

// ── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatContext {
  recipe_name?: string;
  current_step?: string;
  ingredients_available?: string[];
}

export interface ChatRequest {
  user_id: string;
  message: string;
  recipe_id?: string;
  conversation_id?: string;
  context?: ChatContext;
}

export interface ChatResponse {
  /** The AI's reply text */
  response: string;
  conversation_id: string;
  tokens_used: number;
  cached: boolean;
}

// ── Substitution ─────────────────────────────────────────────────────────────

export interface Substitute {
  name: string;
  ratio: string;
  notes: string;
}

export interface SubstituteRequest {
  ingredient_name: string;
  recipe_context?: string;
  dietary_restrictions?: string[];
}

export interface SubstituteResponse {
  substitutes: Substitute[];
}

// ── Variety ──────────────────────────────────────────────────────────────────

export interface VarietySuggestion {
  id: string;
  name: string;
  cuisine_type: string;
  reason: string;
}

export interface VarietyResponse {
  suggestions: VarietySuggestion[];
  variety_score: number;
  underused_cuisines: string[];
  cooked_cuisines: Record<string, number>;
  reasoning: string;
}

// ── Multi-dish coordinator ────────────────────────────────────────────────────

export interface CoordinationStep {
  step_number: number;
  instruction: string;
  time_minutes?: number;
}

export interface CoordinationRecipe {
  id: string;
  name: string;
  prep_time: number;
  cook_time: number;
  steps?: CoordinationStep[];
}

export interface TimelineEntry {
  recipe_id: string;
  recipe_name: string;
  start_time_minutes: number;
  start_time_display: string;
  finish_time_display: string;
}

export interface MultiDishResponse {
  timeline: Record<string, TimelineEntry>;
  total_time_minutes: number;
  finish_time_display: string;
}

// ── Troubleshoot ──────────────────────────────────────────────────────────────

export interface TroubleshootSolution {
  action: string;
  explanation: string;
}

export interface TroubleshootResponse {
  solutions: TroubleshootSolution[];
  tokens_used: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const aiService = {
  /**
   * POST /ai/chat
   * Send a message to the AI cooking assistant.
   * Pass conversation_id to maintain multi-turn context on the server.
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const res = await aiApi.post<{ data: ChatResponse }>('/ai/chat', request);
    return res.data.data;
  },

  /**
   * POST /ai/substitute
   * Get substitution options for a specific ingredient.
   */
  async getSubstitutions(
    ingredientName: string,
    recipeContext?: string,
    dietaryRestrictions: string[] = [],
  ): Promise<Substitute[]> {
    const body: SubstituteRequest = {
      ingredient_name: ingredientName,
      recipe_context: recipeContext,
      dietary_restrictions: dietaryRestrictions,
    };
    const res = await aiApi.post<{ data: SubstituteResponse }>('/ai/substitute', body);
    return res.data.data.substitutes ?? [];
  },

  /**
   * POST /ai/variety/suggest
   * Get recipe suggestions to improve cuisine variety based on recent history.
   */
  async getVarietySuggestions(params: {
    userId: string;
    daysBack?: number;
    limit?: number;
  }): Promise<VarietyResponse> {
    const res = await aiApi.post<{ data: VarietyResponse }>('/ai/variety/suggest', {
      user_id:  params.userId,
      days_back: params.daysBack ?? 30,
      limit:    params.limit ?? 10,
    });
    return res.data.data;
  },

  /**
   * POST /ai/multi-dish/coordinate
   * Generate an optimised parallel cooking timeline for multiple recipes.
   */
  async coordinateMultiDish(
    recipes: CoordinationRecipe[],
    serveAt?: string,
  ): Promise<MultiDishResponse> {
    const res = await aiApi.post<{ data: MultiDishResponse }>(
      '/ai/multi-dish/coordinate',
      { recipes, serve_at: serveAt },
    );
    return res.data.data;
  },

  /**
   * POST /ai/troubleshoot
   * Get solutions for a cooking problem (e.g. "my sauce is too thick").
   */
  async troubleshoot(
    problem: string,
    recipeContext?: string,
  ): Promise<TroubleshootSolution[]> {
    const res = await aiApi.post<{ data: TroubleshootResponse }>('/ai/troubleshoot', {
      problem,
      recipe_context: recipeContext,
    });
    return res.data.data.solutions ?? [];
  },

  /**
   * POST /ai/tips
   * Get pro cooking tips for a specific recipe.
   */
  async getTips(recipeId: string): Promise<string[]> {
    const res = await aiApi.post<{ data: { tips: string[]; cached: boolean } }>(
      '/ai/tips',
      { recipe_id: recipeId },
    );
    return res.data.data.tips ?? [];
  },

  /**
   * Convenience wrapper — ask a quick one-off question during cooking.
   * Used by CookingMode's "Ask AI" button.
   */
  async quickTip(params: {
    userId: string;
    question: string;
    recipeName?: string;
    currentStep?: string;
  }): Promise<string> {
    const result = await aiService.chat({
      user_id: params.userId,
      message: params.question,
      context: params.recipeName
        ? { recipe_name: params.recipeName, current_step: params.currentStep }
        : undefined,
    });
    return result.response;
  },
};
