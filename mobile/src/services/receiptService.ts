// receiptService.ts — wraps the ai-service POST /ai/parse-receipt endpoint.
//
// Sends a base64-encoded receipt image, gets back a structured list of
// items (name, quantity, unit, price) plus an optional store/total/date.
//
// If OPENAI_API_KEY isn't set on the backend, the server returns
// parser_available=false and an empty items[] — the UI then falls
// back to manual entry mode.

import { aiApi } from './api';

export interface ParsedReceiptItem {
  name: string;
  quantity?: number | null;
  unit?: string | null;
  price?: number | null;
}

export interface ParseReceiptResponse {
  items: ParsedReceiptItem[];
  store?: string | null;
  total?: number | null;
  purchase_date?: string | null;
  parser_available: boolean;
  tokens_used: number;
}

export const receiptService = {
  async parse(imageBase64: string, currency?: string): Promise<ParseReceiptResponse> {
    const res = await aiApi.post<{ data: ParseReceiptResponse }>(
      '/ai/parse-receipt',
      { image_base64: imageBase64, currency },
    );
    return res.data.data;
  },
};
