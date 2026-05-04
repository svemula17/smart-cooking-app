import { Request } from 'express';

// ─── Domain Types ─────────────────────────────────────────────────────────────

export type ListStatus = 'active' | 'completed';

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  status: ListStatus;
  recipe_ids: string[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ShoppingItem {
  id: string;
  list_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  aisle: string | null;
  is_checked: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListWithItems extends ShoppingList {
  items: ShoppingItem[];
}

// ─── Store / Availability ─────────────────────────────────────────────────────

export interface StoreProduct {
  name: string;
  price: number;
  unit: string;
  available: boolean;
  store: 'instacart' | 'walmart';
}

export interface ItemAvailability {
  ingredient: string;
  products: StoreProduct[];
  cheapest: StoreProduct | null;
}

export interface NearbyStore {
  place_id: string;
  name: string;
  address: string;
  distance_km: number;
  rating: number | null;
  open_now: boolean | null;
}

// ─── JWT / Auth ───────────────────────────────────────────────────────────────

export interface AuthPayload {
  userId: string;
  email: string;
  type: string;
}

// ─── Express augmentation ─────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// ─── API envelope ─────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}
