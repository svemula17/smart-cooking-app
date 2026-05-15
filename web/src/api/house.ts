import { houseApi } from './client';

export interface House {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface HouseMember {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Expense {
  id: string;
  house_id: string;
  description: string;
  amount: number;
  paid_by: string;
  payer_name?: string;
  category: string;
  created_at: string;
}

export interface ScheduleEntry {
  id: string;
  house_id: string;
  cook_user_id: string;
  cook_name?: string;
  meal_date: string;
  meal_type: string;
  status: string;
}

export async function getMyHouse(): Promise<House | null> {
  try {
    const res = await houseApi.get('/houses/me');
    const data = res.data.data;
    return data?.house ?? data ?? null;
  } catch (e: any) {
    if (e.response?.status === 404) return null;
    throw e;
  }
}

export async function createHouse(name: string): Promise<House> {
  const res = await houseApi.post('/houses', { name });
  const data = res.data.data;
  return data?.house ?? data;
}

export async function joinHouse(inviteCode: string): Promise<House> {
  const res = await houseApi.post('/houses/join', { invite_code: inviteCode });
  const data = res.data.data;
  return data?.house ?? data;
}

export async function listMembers(houseId: string): Promise<HouseMember[]> {
  const res = await houseApi.get(`/houses/${houseId}/members`);
  return res.data.data?.members ?? res.data.data ?? [];
}

export async function listExpenses(houseId: string): Promise<Expense[]> {
  const res = await houseApi.get(`/houses/${houseId}/expenses`);
  return res.data.data?.expenses ?? res.data.data ?? [];
}

export async function createExpense(houseId: string, expense: { description: string; amount: number; category?: string }): Promise<Expense> {
  const res = await houseApi.post(`/houses/${houseId}/expenses`, expense);
  return res.data.data;
}

export async function getSchedule(houseId: string): Promise<ScheduleEntry[]> {
  const res = await houseApi.get(`/houses/${houseId}/schedule`);
  return res.data.data?.entries ?? res.data.data ?? [];
}

export async function getLeaderboard(houseId: string): Promise<any[]> {
  const res = await houseApi.get(`/houses/${houseId}/leaderboard`);
  return res.data.data?.leaderboard ?? res.data.data ?? [];
}

export async function getChores(houseId: string): Promise<any[]> {
  const res = await houseApi.get(`/houses/${houseId}/chores`);
  return res.data.data?.chores ?? res.data.data ?? [];
}
