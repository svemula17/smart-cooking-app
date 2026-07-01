import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RingPalette } from '../../theme/ringPalettes';

// Tap feedback — what a button press feels/sounds like, chosen in Lab and
// applied app-wide via useHaptics.
export type TapSound = 'none' | 'tap' | 'pop' | 'tick' | 'bubble';
export type TapHaptic = 'none' | 'light' | 'medium' | 'heavy';

export interface SettingsState {
  isDark: boolean;
  tapSound: TapSound;
  tapHaptic: TapHaptic;
  cookReminders: boolean;
  // Home nutrition-ring colors, chosen in Lab. 'classic' is the current default.
  ringPalette: RingPalette;
}

const initialState: SettingsState = {
  isDark: false,
  tapSound: 'none', // buttons use a light haptic only by default
  tapHaptic: 'light',
  cookReminders: true, // morning-of cook nudge + prep reminders when it's your turn
  ringPalette: 'mono',
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
    toggleCookReminders(state) {
      state.cookReminders = !state.cookReminders;
    },
    setRingPalette(state, action: PayloadAction<RingPalette>) {
      state.ringPalette = action.payload;
    },
    // Restore persisted settings on launch. Merges only known fields so an
    // old/partial payload can't inject junk.
    hydrateSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      const p = action.payload;
      if (typeof p.isDark === 'boolean') state.isDark = p.isDark;
      if (p.tapSound) state.tapSound = p.tapSound;
      if (p.tapHaptic) state.tapHaptic = p.tapHaptic;
      if (typeof p.cookReminders === 'boolean') state.cookReminders = p.cookReminders;
      if (p.ringPalette) state.ringPalette = p.ringPalette;
    },
  },
});

export const {
  toggleDarkMode,
  setTapSound,
  setTapHaptic,
  toggleCookReminders,
  setRingPalette,
  hydrateSettings,
} = settingsSlice.actions;
export default settingsSlice.reducer;
