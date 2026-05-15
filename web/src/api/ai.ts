import { aiApi } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  message?: string;
}

export async function chat(message: string, history: ChatMessage[] = []): Promise<string> {
  try {
    const res = await aiApi.post('/chat', {
      message,
      messages: history,
      history,
    });
    const data = res.data?.data ?? res.data;
    return data.reply ?? data.message ?? data.response ?? JSON.stringify(data);
  } catch (e: any) {
    if (e.response?.data?.error?.message) {
      return `Error: ${e.response.data.error.message}`;
    }
    return `AI service unavailable. ${e.message ?? ''}`;
  }
}

export async function getSubstitute(ingredient: string, dietary?: string): Promise<string> {
  try {
    const res = await aiApi.post('/substitute', { ingredient, dietary_restriction: dietary });
    return res.data?.data?.suggestion ?? res.data?.suggestion ?? JSON.stringify(res.data);
  } catch (e: any) {
    return `Unavailable: ${e.message}`;
  }
}

export async function getTips(topic: string): Promise<string> {
  try {
    const res = await aiApi.post('/tips', { topic });
    return res.data?.data?.tip ?? res.data?.tip ?? JSON.stringify(res.data);
  } catch (e: any) {
    return `Unavailable: ${e.message}`;
  }
}
