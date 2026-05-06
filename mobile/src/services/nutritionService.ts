import { nutritionApi } from './api';

// ─── Types (mirroring backend nutrition-service/app/schemas/nutrition.py) ─────

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

// ── Calculate ─────────────────────────────────────────────────────────────────

export interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
}

export interface NutritionTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
}

export interface CalculateResponse {
  total_nutrition: NutritionTotals;
  per_serving: NutritionTotals;
  servings: number;
}

// ── Log ───────────────────────────────────────────────────────────────────────

export interface NutritionLogRequest {
  user_id: string;
  recipe_id: string;
  servings_consumed: number;
  meal_type: MealType;
  /** ISO date string "YYYY-MM-DD" */
  date: string;
  auto_logged?: boolean;
}

export interface NutritionLogEntry {
  id: string;
  user_id: string;
  recipe_id: string | null;
  /** Aliased from log_date in the backend */
  date: string;
  meal_type: MealType;
  servings_consumed: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
  auto_logged: boolean;
}

// ── Daily summary ─────────────────────────────────────────────────────────────

export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroProgress {
  calories_percent: number;
  protein_percent: number;
  carbs_percent: number;
  fat_percent: number;
}

export interface MealSummary {
  log_id: string;
  meal_type: MealType;
  recipe_id: string | null;
  recipe_name: string | null;
  servings_consumed: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  auto_logged: boolean;
  logged_at: string;
}

export interface DailySummary {
  date: string;
  user_id: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  goals: MacroGoals;
  progress: MacroProgress;
  meals: MealSummary[];
}

// ── Weekly / Monthly ──────────────────────────────────────────────────────────

export interface WeeklySummary {
  start_date: string;
  end_date: string;
  days: DailySummary[];
}

export interface MonthlyWeekBucket {
  week_start: string;
  week_end: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  days_logged: number;
}

export interface MonthlySummary {
  start_date: string;
  end_date: string;
  weeks: MonthlyWeekBucket[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().split('T')[0]!;
}

export const nutritionService = {
  /**
   * POST /nutrition/calculate
   * Calculate macro totals for a list of recipe ingredients.
   * Does NOT persist anything — pure calculation.
   */
  async calculate(
    recipeId: string,
    ingredients: IngredientInput[],
    servings = 1,
  ): Promise<CalculateResponse> {
    const res = await nutritionApi.post<{ data: CalculateResponse }>(
      '/nutrition/calculate',
      { recipe_id: recipeId, ingredients, servings },
    );
    return res.data.data;
  },

  /**
   * POST /nutrition/log
   * Log a recipe the user just ate (or auto-log after completing a recipe).
   */
  async log(entry: NutritionLogRequest): Promise<NutritionLogEntry> {
    const res = await nutritionApi.post<{ data: { log: NutritionLogEntry } }>(
      '/nutrition/log',
      entry,
    );
    return res.data.data.log;
  },

  /**
   * GET /nutrition/daily/:userId/:date
   * Get the aggregated macro summary for a specific date.
   * Defaults to today.
   */
  async getDaily(userId: string, date?: string): Promise<DailySummary> {
    const day = date ?? todayIso();
    const res = await nutritionApi.get<{ data: DailySummary }>(
      `/nutrition/daily/${userId}/${day}`,
    );
    return res.data.data;
  },

  /**
   * GET /nutrition/logs/:userId
   * Paginated list of raw log entries for the user.
   */
  async getLogs(
    userId: string,
    params?: { page?: number; limit?: number; date?: string },
  ): Promise<{ logs: NutritionLogEntry[]; total: number }> {
    const res = await nutritionApi.get<{ data: { logs: NutritionLogEntry[]; total: number } }>(
      `/nutrition/logs/${userId}`,
      { params },
    );
    return res.data.data;
  },

  /**
   * GET /nutrition/weekly/:userId
   * Returns the last 7 days of daily summaries.
   */
  async getWeekly(userId: string): Promise<WeeklySummary> {
    const res = await nutritionApi.get<{ data: WeeklySummary }>(
      `/nutrition/weekly/${userId}`,
    );
    return res.data.data;
  },

  /**
   * GET /nutrition/monthly/:userId
   * Returns the last 30 days bucketed by week.
   */
  async getMonthly(userId: string): Promise<MonthlySummary> {
    const res = await nutritionApi.get<{ data: MonthlySummary }>(
      `/nutrition/monthly/${userId}`,
    );
    return res.data.data;
  },

  /**
   * DELETE /nutrition/log/:logId
   * Remove a logged entry.
   */
  async deleteLog(logId: string): Promise<void> {
    await nutritionApi.delete(`/nutrition/log/${logId}`);
  },
};
