import { userApi } from './api';
import type { User, UserPreferences, MacroGoals } from '../types';

// ─── Goal field translation ────────────────────────────────────────────────
// The backend stores macro goals as daily_calories / daily_protein / … , but
// the app speaks calories_goal / protein_goal / … everywhere. Translate at this
// boundary so neither side has to change. (Mismatch here meant setting goals
// 400'd and reading them always fell back to defaults.)

function toAppPreferences(p: any): UserPreferences | null {
  if (!p) return null;
  return {
    ...p,
    calories_goal: p.daily_calories ?? p.calories_goal ?? 2000,
    protein_goal:  p.daily_protein  ?? p.protein_goal  ?? 150,
    carbs_goal:    p.daily_carbs    ?? p.carbs_goal    ?? 250,
    fat_goal:      p.daily_fat      ?? p.fat_goal      ?? 65,
    dietary_restrictions: p.dietary_restrictions ?? [],
  } as UserPreferences;
}

function toBackendGoals(g: MacroGoals) {
  return {
    daily_calories: g.calories_goal,
    daily_protein:  g.protein_goal,
    daily_carbs:    g.carbs_goal,
    daily_fat:      g.fat_goal,
  };
}

export const userService = {
  async getProfile(): Promise<User> {
    const res = await userApi.get('/users/me');
    // /users/me returns { user, preferences }
    return res.data.data.user ?? res.data.data;
  },

  /** Current user's macro goals + restrictions, normalized to app field names. */
  async getPreferences(): Promise<UserPreferences | null> {
    const res = await userApi.get('/users/me');
    return toAppPreferences(res.data.data.preferences);
  },

  async updateProfile(data: { name?: string }): Promise<User> {
    const res = await userApi.put('/users/me', data);
    return res.data.data.user ?? res.data.data;
  },

  async updateGoals(goals: MacroGoals): Promise<UserPreferences> {
    const res = await userApi.put('/users/me/goals', toBackendGoals(goals));
    return toAppPreferences(res.data.data.preferences ?? res.data.data)!;
  },

  async updateRestrictions(restrictions: string[]): Promise<UserPreferences> {
    const res = await userApi.put('/users/me/restrictions', { dietary_restrictions: restrictions });
    return toAppPreferences(res.data.data.preferences ?? res.data.data)!;
  },

  /** Permanently delete the signed-in user and all their data. */
  async deleteAccount(): Promise<void> {
    await userApi.delete('/users/me');
  },
};
