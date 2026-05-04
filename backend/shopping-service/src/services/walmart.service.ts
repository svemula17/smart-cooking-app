import axios from 'axios';
import { env } from '../config/env';
import type { StoreProduct } from '../types';

const TOKEN_URL = 'https://marketplace.walmartapis.com/v3/token';
const SEARCH_URL = 'https://marketplace.walmartapis.com/v3/items/search';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (!env.walmartClientId || !env.walmartClientSecret) return null;

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  try {
    const credentials = Buffer.from(
      `${env.walmartClientId}:${env.walmartClientSecret}`,
    ).toString('base64');

    const res = await axios.post(
      TOKEN_URL,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'WM_SVC.NAME': 'SmartCookingApp',
          'WM_QOS.CORRELATION_ID': Date.now().toString(),
        },
        timeout: 5000,
      },
    );

    const token: string = res.data.access_token;
    const expiresIn: number = res.data.expires_in ?? 3600;
    cachedToken = { token, expiresAt: Date.now() + (expiresIn - 60) * 1000 };
    return token;
  } catch {
    return null;
  }
}

/**
 * Search Walmart for a product. Falls back to empty array on any error.
 */
export async function searchWalmart(ingredient: string): Promise<StoreProduct[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const res = await axios.get(SEARCH_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'WM_SVC.NAME': 'SmartCookingApp',
        'WM_QOS.CORRELATION_ID': Date.now().toString(),
        Accept: 'application/json',
      },
      params: { query: ingredient, numItems: 3 },
      timeout: 5000,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = res.data?.items ?? [];
    return items.map((item) => ({
      name: item.name ?? ingredient,
      price: parseFloat(item.salePrice ?? item.msrp ?? '0') || 0,
      unit: item.size ?? 'each',
      available: item.availabilityStatus === 'IN_STOCK',
      store: 'walmart' as const,
    }));
  } catch {
    return [];
  }
}
