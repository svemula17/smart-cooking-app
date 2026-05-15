import { nutritionApi } from './client';

export interface NutritionLog {
  id: string;
  user_id: string;
  recipe_id?: string;
  recipe_name?: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  consumed_at: string;
  auto_logged: boolean;
}

export interface DailyNutrition {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  goal_calories?: number;
  goal_protein_g?: number;
  goal_carbs_g?: number;
  goal_fat_g?: number;
}

export async function getDailyNutrition(userId: string, day: string): Promise<DailyNutrition> {
  const res = await nutritionApi.get(`/daily/${userId}/${day}`);
  return res.data.data ?? res.data;
}

export async function getLogs(userId: string, limit = 20): Promise<NutritionLog[]> {
  const res = await nutritionApi.get(`/logs/${userId}`, { params: { limit } });
  return res.data.data?.logs ?? res.data.logs ?? res.data.data ?? [];
}

export async function getWeekly(userId: string): Promise<any> {
  const res = await nutritionApi.get(`/weekly/${userId}`);
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
  const res = await nutritionApi.post('/log', data);
  return res.data.data ?? res.data;
}
