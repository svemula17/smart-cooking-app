import { createSlice } from '@reduxjs/toolkit';

export interface SettingsState {
  isDark: boolean;
}

const initialState: SettingsState = { isDark: false };

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.isDark = !state.isDark;
    },
  },
});

export const { toggleDarkMode } = settingsSlice.actions;
export default settingsSlice.reducer;
