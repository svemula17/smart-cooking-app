import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Tap feedback — what a button press feels/sounds like, chosen in Lab and
// applied app-wide via useHaptics.
export type TapSound = 'none' | 'tap' | 'pop' | 'tick' | 'bubble';
export type TapHaptic = 'none' | 'light' | 'medium' | 'heavy';

export interface SettingsState {
  isDark: boolean;
  tapSound: TapSound;
  tapHaptic: TapHaptic;
}

const initialState: SettingsState = {
  isDark: false,
  tapSound: 'none', // buttons use a light haptic only by default
  tapHaptic: 'light',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.isDark = !state.isDark;
    },
    setTapSound(state, action: PayloadAction<TapSound>) {
      state.tapSound = action.payload;
    },
    setTapHaptic(state, action: PayloadAction<TapHaptic>) {
      state.tapHaptic = action.payload;
    },
  },
});

export const { toggleDarkMode, setTapSound, setTapHaptic } = settingsSlice.actions;
export default settingsSlice.reducer;
