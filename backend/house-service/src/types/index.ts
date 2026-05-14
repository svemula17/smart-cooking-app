import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  email: string;
  jti: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
      houseId?: string;
    }
  }
}

export interface House {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HouseMember {
  id: string;
  house_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  name?: string;
  email?: string;
}

export interface CookSchedule {
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
  amount: string;
  description: string;
  category: string;
  shopping_list_id: string | null;
  created_at: string;
  paid_by_name?: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: string;
  is_settled: boolean;
  settled_at: string | null;
  user_name?: string;
}

export interface Balance {
  user_id: string;
  name: string;
  net: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { message: string; code: string; details?: unknown };
}
