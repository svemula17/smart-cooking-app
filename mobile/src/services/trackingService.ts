import { nutritionApi } from './api';
import type { MonthlyStats } from '../types';

export const trackingService = {
  async getMonthlyStats(userId: string, month: string): Promise<MonthlyStats> {
    const res = await nutritionApi.get<{ data: MonthlyStats }>(`/nutrition/monthly-stats/${userId}`, {
      params: { month },
    });
    return res.data.data;
  },
};
