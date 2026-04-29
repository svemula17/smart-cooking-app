import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, Recipe, ShoppingListItem } from '../types';

interface AuthState { user: User | null; token: string | null; }
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null } as AuthState,
  reducers: {
    setAuth: (s, a: PayloadAction<AuthState>) => { s.user = a.payload.user; s.token = a.payload.token; },
    clearAuth: (s) => { s.user = null; s.token = null; },
  },
});

interface RecipesState { items: Recipe[]; selected: Recipe | null; }
const recipesSlice = createSlice({
  name: 'recipes',
  initialState: { items: [], selected: null } as RecipesState,
  reducers: {
    setRecipes: (s, a: PayloadAction<Recipe[]>) => { s.items = a.payload; },
    selectRecipe: (s, a: PayloadAction<Recipe | null>) => { s.selected = a.payload; },
  },
});

interface ShoppingState { items: ShoppingListItem[]; }
const shoppingSlice = createSlice({
  name: 'shopping',
  initialState: { items: [] } as ShoppingState,
  reducers: {
    setItems: (s, a: PayloadAction<ShoppingListItem[]>) => { s.items = a.payload; },
    toggleItem: (s, a: PayloadAction<string>) => {
      const item = s.items.find((i) => i.id === a.payload);
      if (item) item.checked = !item.checked;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export const { setRecipes, selectRecipe } = recipesSlice.actions;
export const { setItems, toggleItem } = shoppingSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    recipes: recipesSlice.reducer,
    shopping: shoppingSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
