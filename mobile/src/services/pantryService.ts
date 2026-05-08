import { recipeApi } from './api';

export interface PantryItem {
  id: string;
  user_id?: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  location: string;
  expiry_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreatePantryItem = Omit<PantryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdatePantryItem = Partial<CreatePantryItem>;

export const pantryService = {
  async list(): Promise<PantryItem[]> {
    const res = await recipeApi.get('/pantry');
    return res.data.data;
  },

  async create(item: CreatePantryItem): Promise<PantryItem> {
    const res = await recipeApi.post('/pantry', item);
    return res.data.data;
  },

  async update(id: string, item: UpdatePantryItem): Promise<PantryItem> {
    const res = await recipeApi.put(`/pantry/${id}`, item);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await recipeApi.delete(`/pantry/${id}`);
  },

  async deduct(ingredients: Array<{ name: string; quantity: number; unit: string }>): Promise<PantryItem[]> {
    const res = await recipeApi.post('/pantry/deduct', { ingredients });
    return res.data.data;
  },
};
