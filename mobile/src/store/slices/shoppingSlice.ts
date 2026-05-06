import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ShoppingList, ShoppingItem } from '../../types';

// ─── State ────────────────────────────────────────────────────────────────────

export interface ShoppingState {
  /** All lists belonging to the user */
  lists: ShoppingList[];
  /** Currently open list */
  activeList: ShoppingList | null;
  /** Items of the currently open list */
  activeItems: ShoppingItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ShoppingState = {
  lists: [],
  activeList: null,
  activeItems: [],
  isLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    /** Replace the full list of shopping lists */
    setLists(state, action: PayloadAction<ShoppingList[]>) {
      state.lists = action.payload;
    },

    /** Prepend a newly-created list */
    addList(state, action: PayloadAction<ShoppingList>) {
      state.lists.unshift(action.payload);
    },

    /** Remove a list by ID */
    removeList(state, action: PayloadAction<string>) {
      state.lists = state.lists.filter((l) => l.id !== action.payload);
      if (state.activeList?.id === action.payload) {
        state.activeList = null;
        state.activeItems = [];
      }
    },

    /** Open a list (sets activeList + its items) */
    openList(
      state,
      action: PayloadAction<{ list: ShoppingList; items: ShoppingItem[] }>,
    ) {
      state.activeList = action.payload.list;
      state.activeItems = action.payload.items;
    },

    /** Close the active list */
    closeList(state) {
      state.activeList = null;
      state.activeItems = [];
    },

    /** Toggle an item's checked state locally (optimistic update) */
    toggleItem(state, action: PayloadAction<string>) {
      const item = state.activeItems.find((i) => i.id === action.payload);
      if (item) item.is_checked = !item.is_checked;
    },

    /** Replace a single item (e.g. after a server patch response) */
    upsertItem(state, action: PayloadAction<ShoppingItem>) {
      const idx = state.activeItems.findIndex(
        (i) => i.id === action.payload.id,
      );
      if (idx >= 0) {
        state.activeItems[idx] = action.payload;
      } else {
        state.activeItems.push(action.payload);
      }
    },

    /** Mark the active list as completed */
    markActiveListComplete(state) {
      if (state.activeList) {
        state.activeList.status = 'completed';
        // Mirror the update in the lists array
        const idx = state.lists.findIndex((l) => l.id === state.activeList!.id);
        if (idx >= 0) state.lists[idx]!.status = 'completed';
      }
    },

    setShoppingLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      if (action.payload) state.error = null;
    },

    setShoppingError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
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
} = shoppingSlice.actions;

export default shoppingSlice.reducer;
