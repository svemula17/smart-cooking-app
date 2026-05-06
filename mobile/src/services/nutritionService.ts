import { nutritionApi } from './api';

export interface NutritionixFood {
  food_name: string;
  serving_qty: number;
  serving_unit: string;
  nf_calories: number;
  nf_protein: number;
  nf_total_carbohydrate: number;
  nf_total_fat: number;
  nf_dietary_fiber: number;
  nf_sodium: number;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  logs: NutritionLog[];
}

interface SearchResponse {
  foods: NutritionixFood[];
}

interface LogResponse {
  log: NutritionLog;
}

interface SummaryResponse {
  summary: DailySummary;
}

export const nutritionService = {
  /** Search the Nutritionix food database */
  async search(query: string): Promise<NutritionixFood[]> {
    const res = await nutritionApi.get<{ data: SearchResponse }>(
      '/nutrition/search',
      { params: { q: query } },
    );
    return res.data.data.foods ?? [];
  },

  /** Log a food entry for the authenticated user */
  async log(entry: {
    food_name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }): Promise<NutritionLog> {
    const res = await nutritionApi.post<{ data: LogResponse }>('/nutrition/log', entry);
    return res.data.data.log;
  },

  /** Get today's nutrition summary (or a specific date YYYY-MM-DD) */
  async getSummary(date?: string): Promise<DailySummary> {
    const params = date ? { date } : {};
    const res = await nutritionApi.get<{ data: SummaryResponse }>(
      '/nutrition/summary',
      { params },
    );
    return res.data.data.summary;
  },

  /** Delete a logged entry */
  async deleteLog(logId: string): Promise<void> {
    await nutritionApi.delete(`/nutrition/log/${logId}`);
  },

  /** Analyse a recipe's ingredients and return merged nutrition */
  async analyseRecipe(
    ingredients: Array<{ name: string; quantity: number; unit: string }>,
  ): Promise<NutritionixFood[]> {
    const res = await nutritionApi.post<{ data: SearchResponse }>(
      '/nutrition/analyse',
      { ingredients },
    );
    return res.data.data.foods ?? [];
  },
};
