import axios from 'axios';

const BASE = 'https://connect.instacart.com/v1';

export interface CartItem { name: string; quantity: number; unit: string; }

export async function createInstacartCart(items: CartItem[]): Promise<{ url: string; provider: string }> {
  const clientId = process.env.INSTACART_CLIENT_ID;
  const clientSecret = process.env.INSTACART_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { url: 'https://www.instacart.com/store?stub=1', provider: 'instacart' };
  }
  const res = await axios.post(
    `${BASE}/products/products_link`,
    { line_items: items.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit })) },
    { headers: { Authorization: `Bearer ${clientSecret}`, 'Content-Type': 'application/json' } },
  );
  return { url: res.data.products_link_url, provider: 'instacart' };
}
