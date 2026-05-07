import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const MAX = 10;

export interface RecentlyViewedState {
  ids: string[];
}

const initialState: RecentlyViewedState = { ids: [] };

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    addRecentlyViewed(state, action: PayloadAction<string>) {
      state.ids = [action.payload, ...state.ids.filter((id) => id !== action.payload)].slice(0, MAX);
    },
    clearRecentlyViewed(state) {
      state.ids = [];
    },
  },
});

export const { addRecentlyViewed, clearRecentlyViewed } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;
