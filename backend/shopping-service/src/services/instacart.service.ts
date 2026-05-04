import axios from 'axios';
import { env } from '../config/env';
import type { StoreProduct } from '../types';

const BASE_URL = 'https://connect.instacart.com/idp/v1';

/**
 * Search Instacart for a product matching the given ingredient name.
 * Returns up to 3 matching products. Falls back to empty array on any error.
 */
export async function searchInstacart(ingredient: string): Promise<StoreProduct[]> {
  if (!env.instacartApiKey) return [];

  try {
    const res = await axios.get(`${BASE_URL}/products/search`, {
      headers: {
        Authorization: `Bearer ${env.instacartApiKey}`,
        'Content-Type': 'application/json',
      },
      params: { query: ingredient, limit: 3 },
      timeout: 5000,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = res.data?.data ?? [];
    return items.map((item) => ({
      name: item.name ?? ingredient,
      price: parseFloat(item.price ?? '0') || 0,
      unit: item.unit ?? 'each',
      available: item.available !== false,
      store: 'instacart' as const,
    }));
  } catch {
    return [];
  }
}
