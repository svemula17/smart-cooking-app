import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PantryItem } from '../../services/pantryService';

export interface PantryState {
  items: PantryItem[];
  cookFromPantryMode: boolean;
}

const initialState: PantryState = { items: [], cookFromPantryMode: false };

const pantrySlice = createSlice({
  name: 'pantry',
  initialState,
  reducers: {
    setPantryItems(state, action: PayloadAction<PantryItem[]>) {
      state.items = action.payload;
    },
    addPantryItem(state, action: PayloadAction<PantryItem>) {
      state.items.unshift(action.payload);
    },
    updatePantryItem(state, action: PayloadAction<PantryItem>) {
      const idx = state.items.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removePantryItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    toggleCookFromPantry(state) {
      state.cookFromPantryMode = !state.cookFromPantryMode;
    },
  },
});

export const {
  setPantryItems,
  addPantryItem,
  updatePantryItem,
  removePantryItem,
  toggleCookFromPantry,
} = pantrySlice.actions;

export default pantrySlice.reducer;
