import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Recipe, RecipeWithDetails } from '../../types';

// ─── State ────────────────────────────────────────────────────────────────────

export interface RecipeFilters {
  cuisine?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  maxCookTime?: number;
  minProtein?: number;
  searchQuery?: string;
}

export interface RecipesState {
  /** Flat list of recipe summaries (used in browser / search) */
  items: Recipe[];
  /** Currently viewed recipe with full details */
  selected: RecipeWithDetails | null;
  /** Active filters for the browser screen */
  activeFilters: RecipeFilters;
  /** Recipes cached by cuisine key */
  byCuisine: Record<string, Recipe[]>;
  isLoading: boolean;
  error: string | null;
}

const initialState: RecipesState = {
  items: [],
  selected: null,
  activeFilters: {},
  byCuisine: {},
  isLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    /** Replace the flat items list */
    setRecipes(state, action: PayloadAction<Recipe[]>) {
      state.items = action.payload;
    },

    /** Cache recipes for a specific cuisine */
    setCuisineRecipes(
      state,
      action: PayloadAction<{ cuisine: string; recipes: Recipe[] }>,
    ) {
      state.byCuisine[action.payload.cuisine] = action.payload.recipes;
    },

    /** Set the currently selected (detail-view) recipe */
    selectRecipe(state, action: PayloadAction<RecipeWithDetails | null>) {
      state.selected = action.payload;
    },

    /** Update active filter set (merges with existing) */
    setFilters(state, action: PayloadAction<RecipeFilters>) {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },

    /** Clear all active filters */
    clearFilters(state) {
      state.activeFilters = {};
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      if (action.payload) state.error = null;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  setRecipes,
  setCuisineRecipes,
  selectRecipe,
  setFilters,
  clearFilters,
  setLoading,
  setError,
} = recipeSlice.actions;

export default recipeSlice.reducer;
