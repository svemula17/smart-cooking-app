import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

// ─── State ────────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Set auth state after a successful login / register / session restore */
    setAuth(
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken?: string }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    /** Patch the stored user object (e.g. after a profile update) */
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    /** Replace the access token (after a refresh) */
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },

    /** Mark an auth operation as in-progress */
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      if (action.payload) state.error = null;
    },

    /** Store an auth error message */
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },

    /** Wipe all auth state (logout) */
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  setAuth,
  updateUser,
  setToken,
  setAuthLoading,
  setAuthError,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
