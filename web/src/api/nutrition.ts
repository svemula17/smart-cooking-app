import { nutritionApi } from './client';

export interface NutritionLog {
  id: string;
  user_id: string;
  recipe_id?: string;
  recipe_name?: string;
  servings: number;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  consumed_at: string;
  auto_logged?: boolean;
}

export interface DailyNutrition {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  goals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  progress?: {
    calories_percent: number;
    protein_percent: number;
    carbs_percent: number;
    fat_percent: number;
  };
  meals?: NutritionLog[];
}

export async function getDailyNutrition(userId: string, day: string): Promise<DailyNutrition> {
  const res = await nutritionApi.get(`/nutrition/daily/${userId}/${day}`);
  return res.data.data ?? res.data;
}

export async function getLogs(userId: string, limit = 20): Promise<NutritionLog[]> {
  const res = await nutritionApi.get(`/nutrition/logs/${userId}`, { params: { limit } });
  const data = res.data.data ?? res.data;
  return data.logs ?? data.meals ?? data ?? [];
}

export async function getWeekly(userId: string): Promise<any> {
  const res = await nutritionApi.get(`/nutrition/weekly/${userId}`);
  return res.data.data ?? res.data;
}

export async function logNutrition(data: {
  user_id: string;
  recipe_id?: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}): Promise<NutritionLog> {
  const res = await nutritionApi.post('/nutrition/log', data);
  return res.data.data ?? res.data;
}
