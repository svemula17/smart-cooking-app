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
  async getLists(userId: string, params?: { status?: string; page?: number; limit?: number }): Promise<ListsResponse> {
    const res = await shoppingApi.get(`/shopping/lists/${userId}`, { params });
    return res.data.data;
  },

  async getList(listId: string): Promise<ListDetailResponse> {
    const res = await shoppingApi.get(`/shopping/list/${listId}`);
    return res.data.data;
  },

  async generate(payload: {
    user_id: string;
    name: string;
    recipe_ids: string[];
  }): Promise<GenerateResponse> {
    const res = await shoppingApi.post('/shopping/generate', payload);
    return res.data.data;
  },

  async checkItem(listId: string, itemId: string, is_checked: boolean): Promise<ShoppingItem> {
    const res = await shoppingApi.patch(`/shopping/lists/${listId}/items/${itemId}/check`, { is_checked });
    return res.data.data.item;
  },

  async completeList(listId: string): Promise<void> {
    await shoppingApi.post(`/shopping/lists/${listId}/complete`);
  },

  async deleteList(listId: string): Promise<void> {
    await shoppingApi.delete(`/shopping/lists/${listId}`);
  },
};
