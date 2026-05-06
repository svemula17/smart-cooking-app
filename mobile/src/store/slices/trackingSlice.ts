import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DailyNutritionData, MonthlyStats } from '../../types';

export interface TrackingState {
  monthlyStats: MonthlyStats | null;
  viewingMonth: string; // YYYY-MM
  isLoading: boolean;
  error: string | null;
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

const initialState: TrackingState = {
  monthlyStats: null,
  viewingMonth: currentMonth(),
  isLoading: false,
  error: null,
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    setMonthlyStats(state, action: PayloadAction<MonthlyStats>) {
      state.monthlyStats = action.payload;
    },

    setViewingMonth(state, action: PayloadAction<string>) {
      state.viewingMonth = action.payload;
      state.monthlyStats = null;
    },

    setTrackingLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      if (action.payload) state.error = null;
    },

    setTrackingError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setMonthlyStats,
  setViewingMonth,
  setTrackingLoading,
  setTrackingError,
} = trackingSlice.actions;

export default trackingSlice.reducer;
