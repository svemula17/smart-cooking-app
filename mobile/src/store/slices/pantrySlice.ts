import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PantryItem } from '../../services/pantryService';

export interface PantryState {
  items: PantryItem[];
  cookFromPantryMode: boolean;
}

const initialState: PantryState = {
  cookFromPantryMode: false,
  items: [
    { id: '1',  name: 'Basmati Rice',     quantity: 2,   unit: 'kg',   category: 'grains',  location: 'pantry', expiry_date: null },
    { id: '2',  name: 'Olive Oil',        quantity: 500, unit: 'ml',   category: 'other',   location: 'pantry', expiry_date: null },
    { id: '3',  name: 'Chicken Breast',   quantity: 500, unit: 'g',    category: 'meat',    location: 'fridge', expiry_date: '2026-05-10' },
    { id: '4',  name: 'Eggs',             quantity: 6,   unit: 'pcs',  category: 'dairy',   location: 'fridge', expiry_date: '2026-05-14' },
    { id: '5',  name: 'Milk',             quantity: 1,   unit: 'L',    category: 'dairy',   location: 'fridge', expiry_date: '2026-05-09' },
    { id: '6',  name: 'Onions',           quantity: 4,   unit: 'pcs',  category: 'produce', location: 'pantry', expiry_date: null },
    { id: '7',  name: 'Tomatoes',         quantity: 3,   unit: 'pcs',  category: 'produce', location: 'fridge', expiry_date: '2026-05-11' },
    { id: '8',  name: 'Garlic',           quantity: 1,   unit: 'bulb', category: 'produce', location: 'pantry', expiry_date: null },
    { id: '9',  name: 'Ginger',           quantity: 100, unit: 'g',    category: 'produce', location: 'fridge', expiry_date: '2026-05-15' },
    { id: '10', name: 'Turmeric Powder',  quantity: 50,  unit: 'g',    category: 'spices',  location: 'pantry', expiry_date: null },
    { id: '11', name: 'Cumin Seeds',      quantity: 80,  unit: 'g',    category: 'spices',  location: 'pantry', expiry_date: null },
    { id: '12', name: 'Garam Masala',     quantity: 40,  unit: 'g',    category: 'spices',  location: 'pantry', expiry_date: null },
    { id: '13', name: 'Canned Tomatoes',  quantity: 2,   unit: 'cans', category: 'canned',  location: 'pantry', expiry_date: null },
    { id: '14', name: 'Chickpeas',        quantity: 1,   unit: 'can',  category: 'canned',  location: 'pantry', expiry_date: null },
    { id: '15', name: 'Paneer',           quantity: 200, unit: 'g',    category: 'dairy',   location: 'fridge', expiry_date: '2026-05-08' },
    { id: '16', name: 'Yogurt',           quantity: 400, unit: 'g',    category: 'dairy',   location: 'fridge', expiry_date: '2026-05-12' },
    { id: '17', name: 'Butter',           quantity: 100, unit: 'g',    category: 'dairy',   location: 'fridge', expiry_date: '2026-05-20' },
    { id: '18', name: 'Pasta',            quantity: 500, unit: 'g',    category: 'grains',  location: 'pantry', expiry_date: null },
    { id: '19', name: 'Soy Sauce',        quantity: 200, unit: 'ml',   category: 'other',   location: 'pantry', expiry_date: null },
    { id: '20', name: 'Coconut Milk',     quantity: 1,   unit: 'can',  category: 'canned',  location: 'pantry', expiry_date: null },
  ],
};

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
