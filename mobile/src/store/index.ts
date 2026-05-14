import { configureStore } from '@reduxjs/toolkit';

import authReducer  from './slices/authSlice';
import userReducer  from './slices/userSlice';
import recipeReducer from './slices/recipeSlice';
import nutritionReducer from './slices/nutritionSlice';
import shoppingReducer from './slices/shoppingSlice';
import mealPlanReducer from './slices/mealPlanSlice';
import trackingReducer from './slices/trackingSlice';
import favoritesReducer from './slices/favoritesSlice';
import settingsReducer from './slices/settingsSlice';
import pantryReducer from './slices/pantrySlice';
import houseReducer from './slices/houseSlice';
import cookScheduleReducer from './slices/cookScheduleSlice';
import expenseReducer from './slices/expenseSlice';
import attendanceReducer from './slices/attendanceSlice';
import proposalReducer from './slices/proposalSlice';

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    user:         userReducer,
    recipes:      recipeReducer,
    nutrition:    nutritionReducer,
    shopping:     shoppingReducer,
    mealPlan:     mealPlanReducer,
    tracking:     trackingReducer,
    favorites:    favoritesReducer,
    settings:     settingsReducer,
    pantry:       pantryReducer,
    house:        houseReducer,
    cookSchedule: cookScheduleReducer,
    expense:      expenseReducer,
    attendance:   attendanceReducer,
    proposal:     proposalReducer,
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

export { toggleFavorite, clearFavorites } from './slices/favoritesSlice';
export type { FavoritesState } from './slices/favoritesSlice';

export { toggleDarkMode } from './slices/settingsSlice';
export type { SettingsState } from './slices/settingsSlice';

export {
  setPantryItems,
  addPantryItem,
  updatePantryItem,
  removePantryItem,
  toggleCookFromPantry,
} from './slices/pantrySlice';
export type { PantryState } from './slices/pantrySlice';

export {
  setHouse,
  updateHouse,
  setMembers,
  removeMember as removeMemberFromStore,
  clearHouse,
  setHouseLoading,
  setHouseError,
} from './slices/houseSlice';
export type { } from './slices/houseSlice';

export {
  setSchedule,
  addScheduleEntries,
  updateScheduleEntry as updateScheduleEntryInStore,
  setScheduleLoading,
  setScheduleError,
  clearSchedule,
} from './slices/cookScheduleSlice';

export {
  setExpenses,
  appendExpenses,
  addExpense,
  removeExpense,
  setBalances,
  clearExpenses,
  setExpenseLoading,
  setExpenseError,
} from './slices/expenseSlice';
