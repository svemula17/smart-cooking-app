import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NutritionLog, DailySummary } from '../../services/nutritionService';

// ─── State ────────────────────────────────────────────────────────────────────

export interface NutritionState {
  /** Today's individual log entries */
  todayLogs: NutritionLog[];
  /** Aggregated summary for today (or the currently viewed date) */
  todaySummary: DailySummary | null;
  /** Which date is currently in view — ISO string "YYYY-MM-DD" */
  viewingDate: string;
  isLoading: boolean;
  error: string | null;
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0]!;
}

const initialState: NutritionState = {
  todayLogs: [],
  todaySummary: null,
  viewingDate: todayIso(),
  isLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    /** Replace all today's logs (e.g. after fetching the full list) */
    setTodayLogs(state, action: PayloadAction<NutritionLog[]>) {
      state.todayLogs = action.payload;
    },

    /** Append a single freshly-created log */
    addLog(state, action: PayloadAction<NutritionLog>) {
      state.todayLogs.push(action.payload);
    },

    /** Remove a log by ID (after deletion) */
    removeLog(state, action: PayloadAction<string>) {
      state.todayLogs = state.todayLogs.filter((l) => l.id !== action.payload);
    },

    /** Update the aggregated daily summary */
    setTodaySummary(state, action: PayloadAction<DailySummary | null>) {
      state.todaySummary = action.payload;
    },

    /** Change which date is being displayed */
    setViewingDate(state, action: PayloadAction<string>) {
      state.viewingDate = action.payload;
    },

    /** Jump back to today and clear the logs/summary */
    resetToToday(state) {
      state.viewingDate = todayIso();
      state.todayLogs = [];
      state.todaySummary = null;
    },

    setNutritionLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      if (action.payload) state.error = null;
    },

    setNutritionError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  setTodayLogs,
  addLog,
  removeLog,
  setTodaySummary,
  setViewingDate,
  resetToToday,
  setNutritionLoading,
  setNutritionError,
} = nutritionSlice.actions;

export default nutritionSlice.reducer;
