import { userApi, setAuthToken } from './api';
import { storage } from '../utils/storage';
import type { User } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function persistAuth(data: AuthResponse): Promise<void> {
  setAuthToken(data.accessToken);
  await Promise.all([
    storage.setTokens(data.accessToken, data.refreshToken),
    storage.setUser(data.user),
  ]);
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const authService = {
  /** Create a new account */
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const res = await userApi.post<{ data: AuthResponse }>('/auth/register', {
      name,
      email,
      password,
    });
    const data = res.data.data;
    await persistAuth(data);
    return data;
  },

  /** Log in with email + password */
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await userApi.post<{ data: AuthResponse }>('/auth/login', {
      email,
      password,
    });
    const data = res.data.data;
    await persistAuth(data);
    return data;
  },

  /** Log out — calls the revoke endpoint then wipes local storage */
  async logout(): Promise<void> {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        await userApi.post('/auth/logout', { refreshToken });
      }
    } catch {
      // network errors on logout are non-fatal
    } finally {
      setAuthToken(null);
      await storage.clearAuth();
    }
  },

  /** Fetch the current user from the server (requires valid token) */
  async getMe(): Promise<User | null> {
    try {
      const res = await userApi.get<{ data: User }>('/users/me');
      return res.data.data;
    } catch {
      return null;
    }
  },

  /**
   * Restore a previously persisted session from AsyncStorage.
   * Returns null if no tokens are stored.
   */
  async restoreSession(): Promise<{ user: User; token: string } | null> {
    try {
      const [token, user] = await Promise.all([
        storage.getAccessToken(),
        storage.getUser<User>(),
      ]);
      if (!token || !user) return null;
      setAuthToken(token);
      return { token, user };
    } catch {
      return null;
    }
  },

  /** Returns true if the user has never completed onboarding */
  async isFirstLaunch(): Promise<boolean> {
    return !(await storage.isOnboardingComplete());
  },

  /** Mark onboarding as done so future launches go straight to Home */
  async markOnboardingComplete(): Promise<void> {
    await storage.markOnboardingComplete();
  },
};
