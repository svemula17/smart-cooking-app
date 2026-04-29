import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../services/api';
import type { ChatMessage } from '../types';
import { colors } from '../theme/colors';

export function AIChatScreen(): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  async function send() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: String(Date.now()), role: 'user', content: input, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    try {
      const res = await api.post<{ reply: string }>('/ai/chat', { message: userMsg.content });
      const aiMsg: ChatMessage = { id: String(Date.now() + 1), role: 'assistant', content: res.data.reply, createdAt: new Date().toISOString() };
      setMessages((m) => [...m, aiMsg]);
    } catch {
      // swallow for stub
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.ai]}>
            <Text style={item.role === 'user' ? styles.userText : styles.aiText}>{item.content}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput value={input} onChangeText={setInput} placeholder="Ask anything..." style={styles.input} />
        <TouchableOpacity style={styles.send} onPress={send}>
          <Text style={{ color: 'white', fontWeight: '600' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 12 },
  bubble: { padding: 12, borderRadius: 12, marginVertical: 4, maxWidth: '80%' },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  ai: { alignSelf: 'flex-start', backgroundColor: colors.surface },
  userText: { color: 'white' },
  aiText: { color: colors.text },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  send: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
});
