import axios from 'axios';

const BASE = 'https://api.walmart.com/v3';

export interface CartItem { name: string; quantity: number; unit: string; }

export async function createWalmartCart(items: CartItem[]): Promise<{ url: string; provider: string }> {
  const apiKey = process.env.WALMART_API_KEY;
  if (!apiKey) {
    return { url: 'https://www.walmart.com/cart?stub=1', provider: 'walmart' };
  }
  const res = await axios.post(
    `${BASE}/cart`,
    { items: items.map((i) => ({ name: i.name, qty: i.quantity })) },
    { headers: { 'WM-CONSUMER.ID': apiKey, 'Content-Type': 'application/json' } },
  );
  return { url: res.data.checkoutUrl, provider: 'walmart' };
}
