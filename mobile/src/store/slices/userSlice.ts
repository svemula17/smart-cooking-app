import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserPreferences } from '../../types';

// ─── State ────────────────────────────────────────────────────────────────────

export interface MacroProgress {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UserState {
  preferences: UserPreferences | null;
  macroProgress: MacroProgress;
  isLoadingPrefs: boolean;
  prefsError: string | null;
}

const initialState: UserState = {
  // Hardcoded demo goals & today's progress
  preferences: {
    calories_goal: 2000,
    protein_goal: 150,
    carbs_goal: 250,
    fat_goal: 65,
    dietary_restrictions: [],
    favorite_cuisines: ['Indian', 'Italian', 'Thai'],
  } as any,
  macroProgress: { calories: 1340, protein: 98, carbs: 162, fat: 41 },
  isLoadingPrefs: false,
  prefsError: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /** Store user preferences (goals + restrictions + favourite cuisines) */
    setPreferences(state, action: PayloadAction<UserPreferences>) {
      state.preferences = action.payload;
      state.prefsError = null;
    },

    /** Partially update preferences (e.g. after updating goals only) */
    patchPreferences(state, action: PayloadAction<Partial<UserPreferences>>) {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      }
    },

    /** Update today's consumed macros (from nutrition logs) */
    setMacroProgress(state, action: PayloadAction<MacroProgress>) {
      state.macroProgress = action.payload;
    },

    /** Increment a single macro (e.g. after logging a meal) */
    incrementMacro(
      state,
      action: PayloadAction<{ key: keyof MacroProgress; amount: number }>,
    ) {
      state.macroProgress[action.payload.key] += action.payload.amount;
    },

    /** Reset today's macro progress to zero */
    resetMacroProgress(state) {
      state.macroProgress = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    },

    setPrefsLoading(state, action: PayloadAction<boolean>) {
      state.isLoadingPrefs = action.payload;
      if (action.payload) state.prefsError = null;
    },

    setPrefsError(state, action: PayloadAction<string | null>) {
      state.prefsError = action.payload;
      state.isLoadingPrefs = false;
    },

    /** Clear all user state (called on logout) */
    clearUser(state) {
      state.preferences = null;
      state.macroProgress = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      state.isLoadingPrefs = false;
      state.prefsError = null;
    },
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  setPreferences,
  patchPreferences,
  setMacroProgress,
  incrementMacro,
  resetMacroProgress,
  setPrefsLoading,
  setPrefsError,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
