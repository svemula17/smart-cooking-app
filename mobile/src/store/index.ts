import { configureStore } from '@reduxjs/toolkit';

import authReducer  from './slices/authSlice';
import userReducer  from './slices/userSlice';
import recipeReducer from './slices/recipeSlice';
import nutritionReducer from './slices/nutritionSlice';
import shoppingReducer from './slices/shoppingSlice';
import mealPlanReducer from './slices/mealPlanSlice';
import trackingReducer from './slices/trackingSlice';

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    user:      userReducer,
    recipes:   recipeReducer,
    nutrition: nutritionReducer,
    shopping:  shoppingReducer,
    mealPlan:  mealPlanReducer,
    tracking:  trackingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Silence the large-payload serializable check for recipe lists
      serializableCheck: {
        ignoredPaths: ['recipes.byCuisine'],
      },
    }),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ─── Re-export all slice actions for convenience ──────────────────────────────

export {
  setAuth,
  updateUser,
  setToken,
  setAuthLoading,
  setAuthError,
  clearAuth,
} from './slices/authSlice';

export {
  setPreferences,
  patchPreferences,
  setMacroProgress,
  incrementMacro,
  resetMacroProgress,
  setPrefsLoading,
  setPrefsError,
  clearUser,
} from './slices/userSlice';

export {
  setRecipes,
  setCuisineRecipes,
  selectRecipe,
  setFilters,
  clearFilters,
  setLoading,
  setError,
} from './slices/recipeSlice';

export {
  setTodayLogs,
  addLog,
  removeLog,
  setTodaySummary,
  setViewingDate,
  resetToToday,
  setNutritionLoading,
  setNutritionError,
} from './slices/nutritionSlice';

export {
  setLists,
  addList,
  removeList,
  openList,
  closeList,
  toggleItem,
  upsertItem,
  markActiveListComplete,
  setShoppingLoading,
  setShoppingError,
} from './slices/shoppingSlice';

// ─── Re-export slice state types ──────────────────────────────────────────────

export type { AuthState }     from './slices/authSlice';
export type { UserState, MacroProgress } from './slices/userSlice';
export type { RecipesState, RecipeFilters } from './slices/recipeSlice';
export type { NutritionState } from './slices/nutritionSlice';
export type { ShoppingState }  from './slices/shoppingSlice';

export {
  setMealPlans,
  addMealPlan,
  removeMealPlan,
  updateMealPlan,
  setMealPlanLoading,
  setMealPlanError,
} from './slices/mealPlanSlice';

export {
  setMonthlyStats,
  setViewingMonth,
  setTrackingLoading,
  setTrackingError,
} from './slices/trackingSlice';

export type { MealPlanState } from './slices/mealPlanSlice';
export type { TrackingState } from './slices/trackingSlice';
