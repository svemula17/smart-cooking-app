import { userApi } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface RawAuthResponse {
  user: User;
  tokens?: { accessToken: string; refreshToken?: string };
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

function normalize(raw: RawAuthResponse): AuthResult {
  return {
    user: raw.user,
    accessToken: raw.tokens?.accessToken ?? raw.accessToken!,
    refreshToken: raw.tokens?.refreshToken ?? raw.refreshToken,
  };
}

export async function register(name: string, email: string, password: string): Promise<AuthResult> {
  const res = await userApi.post('/auth/register', { name, email, password });
  return normalize(res.data.data);
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await userApi.post('/auth/login', { email, password });
  return normalize(res.data.data);
}

export async function logout(refreshToken: string): Promise<void> {
  await userApi.post('/auth/logout', { refreshToken }).catch(() => {});
}

export async function getMe(): Promise<User> {
  const res = await userApi.get('/users/me');
  const data = res.data.data;
  return data?.user ?? data;
}
