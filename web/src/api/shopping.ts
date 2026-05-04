import { shoppingApi } from './client';

export interface ShoppingItem {
  id: string;
  list_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  aisle: string | null;
  is_checked: boolean;
  notes: string | null;
}

export interface ShoppingList {
  id: string;
  name: string;
  status: 'active' | 'completed';
  recipe_ids: string[];
  created_at: string;
  completed_at: string | null;
  items?: ShoppingItem[];
}

export async function generateList(name: string, recipeIds: string[]): Promise<ShoppingList & { items: ShoppingItem[] }> {
  const res = await shoppingApi.post('/shopping/lists/generate', { name, recipe_ids: recipeIds });
  return res.data.data;
}

export async function getLists(params?: { status?: string; page?: number; limit?: number }): Promise<{ lists: ShoppingList[]; pagination: { total: number; page: number; limit: number } }> {
  const res = await shoppingApi.get('/shopping/lists', { params });
  return res.data.data;
}

export async function getList(id: string): Promise<ShoppingList & { items: ShoppingItem[] }> {
  const res = await shoppingApi.get(`/shopping/lists/${id}`);
  return res.data.data;
}

export async function checkItem(listId: string, itemId: string, isChecked: boolean): Promise<ShoppingItem> {
  const res = await shoppingApi.patch(`/shopping/lists/${listId}/items/${itemId}/check`, { is_checked: isChecked });
  return res.data.data;
}

export async function completeList(id: string): Promise<ShoppingList> {
  const res = await shoppingApi.post(`/shopping/lists/${id}/complete`);
  return res.data.data;
}

export async function deleteList(id: string): Promise<void> {
  await shoppingApi.delete(`/shopping/lists/${id}`);
}
