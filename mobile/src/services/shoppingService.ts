import { shoppingApi } from './api';
import type { ShoppingList, ShoppingItem } from '../types';

interface ListsResponse {
  lists: ShoppingList[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface ListDetailResponse {
  list: ShoppingList;
  items: ShoppingItem[];
}

interface GenerateResponse {
  list: ShoppingList;
  items: ShoppingItem[];
}

export const shoppingService = {
  /**
   * GET /shopping/lists
   * Returns all lists for the authenticated user (identity from JWT — no userId in path).
   */
  async getLists(params?: { status?: string; page?: number; limit?: number }): Promise<ListsResponse> {
    const res = await shoppingApi.get('/shopping/lists', { params });
    return res.data.data;
  },

  /**
   * GET /shopping/lists/:id
   * Returns a single list with its items sorted by aisle.
   */
  async getList(listId: string): Promise<ListDetailResponse> {
    const res = await shoppingApi.get(`/shopping/lists/${listId}`);
    return res.data.data;
  },

  /**
   * POST /shopping/lists/generate
   * Generates a shopping list from one or more recipe IDs.
   */
  async generate(payload: {
    user_id: string;
    name: string;
    recipe_ids: string[];
  }): Promise<GenerateResponse> {
    const res = await shoppingApi.post('/shopping/lists/generate', payload);
    return res.data.data;
  },

  /**
   * PATCH /shopping/lists/:id/items/:itemId/check
   * Checks or unchecks a single shopping item.
   */
  async checkItem(listId: string, itemId: string, is_checked: boolean): Promise<ShoppingItem> {
    const res = await shoppingApi.patch(
      `/shopping/lists/${listId}/items/${itemId}/check`,
      { is_checked },
    );
    return res.data.data.item;
  },

  /**
   * POST /shopping/lists/:id/complete
   * Marks the list as completed.
   */
  async completeList(listId: string): Promise<void> {
    await shoppingApi.post(`/shopping/lists/${listId}/complete`);
  },

  /**
   * DELETE /shopping/lists/:id
   */
  async deleteList(listId: string): Promise<void> {
    await shoppingApi.delete(`/shopping/lists/${listId}`);
  },

  /**
   * GET /shopping/availability
   * Check product availability on Instacart / Walmart.
   */
  async checkAvailability(ingredients: string[], store?: 'instacart' | 'walmart' | 'all') {
    const res = await shoppingApi.get('/shopping/availability', {
      params: { ingredients: ingredients.join(','), store: store ?? 'all' },
    });
    return res.data.data;
  },

  /**
   * GET /shopping/stores/nearby
   * Find nearby grocery stores via Google Places.
   */
  async getNearbyStores(lat: number, lng: number, radiusKm = 5) {
    const res = await shoppingApi.get('/shopping/stores/nearby', {
      params: { lat, lng, radius_km: radiusKm },
    });
    return res.data.data;
  },
};
