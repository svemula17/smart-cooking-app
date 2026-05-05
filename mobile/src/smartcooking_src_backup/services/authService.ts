import AsyncStorage from '@react-native-async-storage/async-storage';
import { userApi, setAuthToken } from './api';
import type { User } from '../types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

async function persistAuth(data: AuthResponse) {
  setAuthToken(data.accessToken);
  await AsyncStorage.setItem('accessToken', data.accessToken);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  if (data.refreshToken) {
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
  }
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await userApi.post('/auth/register', { name, email, password });
    const data: AuthResponse = res.data.data;
    await persistAuth(data);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await userApi.post('/auth/login', { email, password });
    const data: AuthResponse = res.data.data;
    await persistAuth(data);
    return data;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await userApi.post('/auth/logout', { refreshToken });
      }
    } catch {
      // ignore network errors on logout
    } finally {
      setAuthToken(null);
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
    }
  },

  async getMe(): Promise<User | null> {
    try {
      const res = await userApi.get('/users/me');
      return res.data.data as User;
    } catch {
      return null;
    }
  },

  async restoreSession(): Promise<{ user: User; token: string } | null> {
    try {
      const t = await AsyncStorage.getItem('accessToken');
      const u = await AsyncStorage.getItem('user');
      if (!t || !u) return null;
      setAuthToken(t);
      return { token: t, user: JSON.parse(u) as User };
    } catch {
      return null;
    }
  },

  async isFirstLaunch(): Promise<boolean> {
    const seen = await AsyncStorage.getItem('onboardingComplete');
    return seen !== 'true';
  },

  async markOnboardingComplete(): Promise<void> {
    await AsyncStorage.setItem('onboardingComplete', 'true');
  },
};
