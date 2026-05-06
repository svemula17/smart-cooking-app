import { recipeApi } from './api';
import type { MealPlan, MealType } from '../types';

export interface ScheduleMealRequest {
  user_id: string;
  recipe_id: string;
  scheduled_date: string;
  meal_type: MealType;
  cooking_time?: string;
}

export interface MealPlansResponse {
  meal_plans: MealPlan[];
  daily_totals: Record<string, { calories: number; protein: number; carbs: number; fat: number }>;
}

export const mealPlanService = {
  async getWeekPlan(userId: string, startDate: string, days = 7): Promise<MealPlansResponse> {
    const res = await recipeApi.get<{ data: MealPlansResponse }>(`/meal-plans/${userId}`, {
      params: { start_date: startDate, days },
    });
    return res.data.data;
  },

  async schedule(req: ScheduleMealRequest): Promise<{ meal_plan: MealPlan }> {
    const res = await recipeApi.post<{ data: { meal_plan: MealPlan } }>('/meal-plans/schedule', req);
    return res.data.data;
  },

  async remove(mealPlanId: string): Promise<void> {
    await recipeApi.delete(`/meal-plans/${mealPlanId}`);
  },

  async markComplete(mealPlanId: string): Promise<void> {
    await recipeApi.put(`/meal-plans/${mealPlanId}`, { completed: true });
  },
};
