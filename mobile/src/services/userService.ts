import { userApi } from './api';
import type { User, UserPreferences, MacroGoals } from '../types';

export const userService = {
  async getProfile(): Promise<User> {
    const res = await userApi.get('/users/me');
    return res.data.data;
  },

  async updateProfile(data: { name?: string }): Promise<User> {
    const res = await userApi.put('/users/me', data);
    return res.data.data;
  },

  async updateGoals(goals: MacroGoals): Promise<UserPreferences> {
    const res = await userApi.put('/users/me/goals', goals);
    return res.data.data;
  },

  async updateRestrictions(restrictions: string[]): Promise<UserPreferences> {
    const res = await userApi.put('/users/me/restrictions', { dietary_restrictions: restrictions });
    return res.data.data;
  },
};
