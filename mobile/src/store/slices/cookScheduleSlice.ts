import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CookScheduleEntry } from '../../services/houseService';

interface CookScheduleState {
  schedule: CookScheduleEntry[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CookScheduleState = {
  schedule: [],
  isLoading: false,
  error: null,
};

const cookScheduleSlice = createSlice({
  name: 'cookSchedule',
  initialState,
  reducers: {
    setSchedule(state, action: PayloadAction<CookScheduleEntry[]>) {
      state.schedule = action.payload;
      state.error = null;
    },
    addScheduleEntries(state, action: PayloadAction<CookScheduleEntry[]>) {
      const existingIds = new Set(state.schedule.map((e) => e.id));
      const newEntries = action.payload.filter((e) => !existingIds.has(e.id));
      state.schedule = [...state.schedule, ...newEntries].sort(
        (a, b) => a.scheduled_date.localeCompare(b.scheduled_date),
      );
    },
    updateScheduleEntry(state, action: PayloadAction<CookScheduleEntry>) {
      const idx = state.schedule.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) state.schedule[idx] = action.payload;
    },
    setScheduleLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setScheduleError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearSchedule(state) {
      state.schedule = [];
    },
  },
});

export const {
  setSchedule,
  addScheduleEntries,
  updateScheduleEntry,
  setScheduleLoading,
  setScheduleError,
  clearSchedule,
} = cookScheduleSlice.actions;

export default cookScheduleSlice.reducer;
