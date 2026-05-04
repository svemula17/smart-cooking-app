import { userApi } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export async function register(name: string, email: string, password: string): Promise<{ user: User; accessToken: string }> {
  const res = await userApi.post('/auth/register', { name, email, password });
  return res.data.data;
}

export async function login(email: string, password: string): Promise<{ user: User; accessToken: string }> {
  const res = await userApi.post('/auth/login', { email, password });
  return res.data.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await userApi.post('/auth/logout', { refreshToken }).catch(() => {});
}

export async function getMe(): Promise<User> {
  const res = await userApi.get('/users/me');
  return res.data.data;
}
