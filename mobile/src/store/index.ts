import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, Recipe, RecipeWithDetails, UserPreferences, ShoppingListItem } from '../types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
interface AuthState { user: User | null; token: string | null; isAuthenticated: boolean; }
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, isAuthenticated: false } as AuthState,
  reducers: {
    setAuth(s, a: PayloadAction<{ user: User; token: string }>) {
      s.user = a.payload.user; s.token = a.payload.token; s.isAuthenticated = true;
    },
    clearAuth(s) { s.user = null; s.token = null; s.isAuthenticated = false; },
    updateUser(s, a: PayloadAction<Partial<User>>) { if (s.user) Object.assign(s.user, a.payload); },
  },
});

// ─── User preferences ─────────────────────────────────────────────────────────
interface UserState {
  preferences: UserPreferences | null;
  macroProgress: { calories: number; protein: number; carbs: number; fat: number };
}
const userSlice = createSlice({
  name: 'user',
  initialState: { preferences: null, macroProgress: { calories: 0, protein: 0, carbs: 0, fat: 0 } } as UserState,
  reducers: {
    setPreferences(s, a: PayloadAction<UserPreferences>) { s.preferences = a.payload; },
    setMacroProgress(s, a: PayloadAction<UserState['macroProgress']>) { s.macroProgress = a.payload; },
  },
});

// ─── Recipes ──────────────────────────────────────────────────────────────────
interface RecipesState { items: Recipe[]; selected: RecipeWithDetails | null; loading: boolean; error: string | null; }
const recipesSlice = createSlice({
  name: 'recipes',
  initialState: { items: [], selected: null, loading: false, error: null } as RecipesState,
  reducers: {
    setRecipes(s, a: PayloadAction<Recipe[]>) { s.items = a.payload; },
    selectRecipe(s, a: PayloadAction<RecipeWithDetails | null>) { s.selected = a.payload; },
    setLoading(s, a: PayloadAction<boolean>) { s.loading = a.payload; },
    setError(s, a: PayloadAction<string | null>) { s.error = a.payload; },
  },
});

// ─── Shopping ─────────────────────────────────────────────────────────────────
interface ShoppingState { items: ShoppingListItem[]; }
const shoppingSlice = createSlice({
  name: 'shopping',
  initialState: { items: [] } as ShoppingState,
  reducers: {
    setItems(s, a: PayloadAction<ShoppingListItem[]>) { s.items = a.payload; },
    toggleItem(s, a: PayloadAction<string>) {
      const item = s.items.find((i) => i.id === a.payload);
      if (item) item.checked = !item.checked;
    },
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────
export const { setAuth, clearAuth, updateUser } = authSlice.actions;
export const { setPreferences, setMacroProgress } = userSlice.actions;
export const { setRecipes, selectRecipe, setLoading, setError } = recipesSlice.actions;
export const { setItems, toggleItem } = shoppingSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    user: userSlice.reducer,
    recipes: recipesSlice.reducer,
    shopping: shoppingSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
