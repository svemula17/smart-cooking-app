// shoppingService — talks to the shopping-service.
//
// The backend already does the heavy lifting: given a set of recipe IDs,
// generateFromRecipes aggregates their ingredients (combining duplicate
// quantities) and tags each with a grocery aisle. The client just renders,
// checks items off, and on completion pushes the bought items into the pantry.

import { shoppingApi } from './api';

export interface ShoppingItem {
  id: string;
  list_id: string;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
  is_checked: boolean;
  aisle: string | null;
  notes: string | null;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  status: 'active' | 'completed';
  recipe_ids: string[];
  items: ShoppingItem[];
  created_at: string;
  completed_at: string | null;
}

/** Build a shopping list from one or more recipe IDs (ingredients auto-aggregated + aisled). */
export async function generateFromRecipes(name: string, recipeIds: string[]): Promise<ShoppingList> {
  const { data } = await shoppingApi.post('/shopping/lists/generate', {
    name,
    recipe_ids: recipeIds,
  });
  return data.data;
}

/** All lists for the current user (most recent first). */
export async function getLists(): Promise<ShoppingList[]> {
  const { data } = await shoppingApi.get('/shopping/lists');
  return data.data;
}

/** A single list with its items (sorted by aisle). */
export async function getList(listId: string): Promise<ShoppingList> {
  const { data } = await shoppingApi.get(`/shopping/lists/${listId}`);
  return data.data;
}

/** Check / uncheck a single item. */
export async function checkItem(
  listId: string,
  itemId: string,
  isChecked: boolean,
): Promise<ShoppingItem> {
  const { data } = await shoppingApi.patch(
    `/shopping/lists/${listId}/items/${itemId}/check`,
    { is_checked: isChecked },
  );
  return data.data;
}

/** Mark the whole list completed. */
export async function completeList(listId: string): Promise<ShoppingList> {
  const { data } = await shoppingApi.post(`/shopping/lists/${listId}/complete`, {});
  return data.data;
}

export async function deleteList(listId: string): Promise<void> {
  await shoppingApi.delete(`/shopping/lists/${listId}`);
}
