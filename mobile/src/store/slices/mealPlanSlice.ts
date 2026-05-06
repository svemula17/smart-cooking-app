import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MealPlan } from '../../types';

export interface MealPlanState {
  plans: MealPlan[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MealPlanState = {
  plans: [],
  isLoading: false,
  error: null,
};

const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState,
  reducers: {
    setMealPlans(state, action: PayloadAction<MealPlan[]>) {
      state.plans = action.payload;
    },

    addMealPlan(state, action: PayloadAction<MealPlan>) {
      const idx = state.plans.findIndex(
        (p) => p.scheduled_date === action.payload.scheduled_date && p.meal_type === action.payload.meal_type,
      );
      if (idx >= 0) {
        state.plans[idx] = action.payload;
      } else {
        state.plans.push(action.payload);
      }
    },

    removeMealPlan(state, action: PayloadAction<string>) {
      state.plans = state.plans.filter((p) => p.id !== action.payload);
    },

    updateMealPlan(state, action: PayloadAction<Partial<MealPlan> & { id: string }>) {
      const idx = state.plans.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) Object.assign(state.plans[idx]!, action.payload);
    },

    setMealPlanLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      if (action.payload) state.error = null;
    },

    setMealPlanError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setMealPlans,
  addMealPlan,
  removeMealPlan,
  updateMealPlan,
  setMealPlanLoading,
  setMealPlanError,
} = mealPlanSlice.actions;

export default mealPlanSlice.reducer;
