import { houseApi } from './api';

export interface House {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  my_role?: 'admin' | 'member';
}

export interface HouseMember {
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  name: string;
  email: string;
}

export interface CookScheduleEntry {
  id: string;
  house_id: string;
  user_id: string;
  scheduled_date: string;
  recipe_id: string | null;
  status: 'pending' | 'cooking' | 'done' | 'skipped';
  notes: string | null;
  created_at: string;
  cook_name?: string;
  recipe_name?: string;
  recipe_cuisine?: string;
  recipe_prep_time?: number;
  recipe_cook_time?: number;
}

export interface Expense {
  id: string;
  house_id: string;
  paid_by: string;
  paid_by_name: string;
  amount: string;
  description: string;
  category: string;
  shopping_list_id: string | null;
  created_at: string;
  splits: {
    user_id: string;
    user_name: string;
    amount: string;
    is_settled: boolean;
  }[];
}

export interface Balance {
  user_id: string;
  name: string;
  net: number;
}

export interface Settlement {
  from_user_id: string;
  to_user_id: string;
  amount: number;
}

// ── House ──────────────────────────────────────────────────────────────────

export async function createHouse(name: string): Promise<{ house: House }> {
  const { data } = await houseApi.post('/houses', { name });
  return data.data;
}

export async function getMyHouse(): Promise<{ house: House | null; members: HouseMember[] }> {
  const { data } = await houseApi.get('/houses/me');
  return data.data;
}

export async function updateHouseName(houseId: string, name: string): Promise<{ house: House }> {
  const { data } = await houseApi.put(`/houses/${houseId}`, { name });
  return data.data;
}

export async function deleteHouse(houseId: string): Promise<void> {
  await houseApi.delete(`/houses/${houseId}`);
}

// ── Members ────────────────────────────────────────────────────────────────

export async function joinHouse(invite_code: string): Promise<{ house: House; members: HouseMember[] }> {
  const { data } = await houseApi.post('/houses/join', { invite_code: invite_code.toUpperCase() });
  return data.data;
}

export async function listMembers(houseId: string): Promise<HouseMember[]> {
  const { data } = await houseApi.get(`/houses/${houseId}/members`);
  return data.data.members;
}

export async function removeMember(houseId: string, userId: string): Promise<void> {
  await houseApi.delete(`/houses/${houseId}/members/${userId}`);
}

export async function refreshInviteCode(houseId: string): Promise<House> {
  const { data } = await houseApi.post(`/houses/${houseId}/invite/refresh`);
  return data.data.house;
}

// ── Cook Schedule ──────────────────────────────────────────────────────────

export async function generateSchedule(houseId: string, days = 14): Promise<CookScheduleEntry[]> {
  const { data } = await houseApi.post(`/houses/${houseId}/schedule/generate`, { days });
  return data.data.schedule;
}

export async function getSchedule(houseId: string, days = 14): Promise<CookScheduleEntry[]> {
  const { data } = await houseApi.get(`/houses/${houseId}/schedule`, { params: { days } });
  return data.data.schedule;
}

export async function updateScheduleEntry(
  houseId: string,
  scheduleId: string,
  updates: Partial<{ recipe_id: string | null; status: string; notes: string }>,
): Promise<CookScheduleEntry> {
  const { data } = await houseApi.patch(`/houses/${houseId}/schedule/${scheduleId}`, updates);
  return data.data.schedule;
}

export async function swapCooks(houseId: string, scheduleId: string, swapWithDate: string): Promise<CookScheduleEntry[]> {
  const { data } = await houseApi.put(`/houses/${houseId}/schedule/${scheduleId}/swap`, { swap_with_date: swapWithDate });
  return data.data.schedule;
}

// ── Expenses ───────────────────────────────────────────────────────────────

export async function createExpense(
  houseId: string,
  params: {
    amount: number;
    description: string;
    category?: string;
    paid_by: string;
    split_user_ids: string[];
    shopping_list_id?: string | null;
  },
): Promise<{ expense: Expense }> {
  const { data } = await houseApi.post(`/houses/${houseId}/expenses`, params);
  return data.data;
}

export async function listExpenses(
  houseId: string,
  page = 1,
): Promise<{ expenses: Expense[]; pagination: { page: number; limit: number; total: number } }> {
  const { data } = await houseApi.get(`/houses/${houseId}/expenses`, { params: { page } });
  return data.data;
}

export async function getBalances(
  houseId: string,
): Promise<{ balances: Balance[]; settlements: Settlement[] }> {
  const { data } = await houseApi.get(`/houses/${houseId}/balances`);
  return data.data;
}

export async function settleUp(houseId: string, withUserId: string): Promise<void> {
  await houseApi.post(`/houses/${houseId}/expenses/settle`, { with_user_id: withUserId });
}

export async function deleteExpense(houseId: string, expenseId: string): Promise<void> {
  await houseApi.delete(`/houses/${houseId}/expenses/${expenseId}`);
}

// ── Chore Types ──────────────────────────────────────────────────────────────

export interface ChoreType {
  id: string;
  house_id: string;
  name: string;
  emoji: string;
  frequency: 'daily' | 'weekly';
  created_at: string;
}

export interface ChoreEntry {
  id: string;
  house_id: string;
  chore_type_id: string;
  user_id: string;
  scheduled_date: string;
  status: 'pending' | 'done' | 'skipped';
  notes: string | null;
  created_at: string;
  assignee_name?: string;
  chore_name?: string;
  emoji?: string;
  frequency?: string;
}

export async function listChoreTypes(houseId: string): Promise<ChoreType[]> {
  const { data } = await houseApi.get(`/houses/${houseId}/chore-types`);
  return data.data.chore_types;
}

export async function createChoreType(
  houseId: string,
  params: { name: string; emoji: string; frequency: 'daily' | 'weekly' },
): Promise<ChoreType> {
  const { data } = await houseApi.post(`/houses/${houseId}/chore-types`, params);
  return data.data.chore_type;
}

export async function deleteChoreType(houseId: string, typeId: string): Promise<void> {
  await houseApi.delete(`/houses/${houseId}/chore-types/${typeId}`);
}

export async function generateChoreSchedule(
  houseId: string,
  typeId: string,
  days = 14,
): Promise<ChoreEntry[]> {
  const { data } = await houseApi.post(`/houses/${houseId}/chores/${typeId}/generate`, { days });
  return data.data.schedule;
}

export async function getChoreSchedule(
  houseId: string,
  options: { days?: number; type_id?: string; date?: string } = {},
): Promise<ChoreEntry[]> {
  const { data } = await houseApi.get(`/houses/${houseId}/chores`, { params: options });
  return data.data.schedule;
}

export async function updateChoreEntry(
  houseId: string,
  choreId: string,
  updates: { status?: 'pending' | 'done' | 'skipped'; notes?: string },
): Promise<ChoreEntry> {
  const { data } = await houseApi.patch(`/houses/${houseId}/chores/${choreId}`, updates);
  return data.data.chore;
}

export async function swapChore(
  houseId: string,
  choreId: string,
  swapWithDate: string,
): Promise<ChoreEntry[]> {
  const { data } = await houseApi.put(`/houses/${houseId}/chores/${choreId}/swap`, {
    swap_with_date: swapWithDate,
  });
  return data.data.schedule;
}
