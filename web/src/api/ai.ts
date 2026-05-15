import { aiApi } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chat(userId: string, message: string, history: ChatMessage[] = []): Promise<string> {
  try {
    const res = await aiApi.post('/ai/chat', {
      user_id: userId,
      message,
      messages: history,
      history,
    });
    const data = res.data?.data ?? res.data;
    return data.reply ?? data.message ?? data.response ?? data.answer ?? JSON.stringify(data);
  } catch (e: any) {
    if (e.response?.data?.error?.message) {
      return `Error: ${e.response.data.error.message}`;
    }
    return `AI service unavailable. ${e.message ?? ''}`;
  }
}

export async function getSubstitute(userId: string, ingredient: string, dietary?: string): Promise<string> {
  try {
    const res = await aiApi.post('/ai/substitute', { user_id: userId, ingredient, dietary_restriction: dietary });
    return res.data?.data?.suggestion ?? res.data?.suggestion ?? JSON.stringify(res.data);
  } catch (e: any) {
    return `Unavailable: ${e.message}`;
  }
}

export async function getTips(userId: string, topic: string): Promise<string> {
  try {
    const res = await aiApi.post('/ai/tips', { user_id: userId, topic });
    return res.data?.data?.tip ?? res.data?.tip ?? JSON.stringify(res.data);
  } catch (e: any) {
    return `Unavailable: ${e.message}`;
  }
}
