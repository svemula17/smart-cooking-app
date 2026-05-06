import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { aiApi } from '../services/api';
import type { ChatMessage } from '../types';
import { colors } from '../theme/colors';

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  const [dots, setDots] = useState('');
  React.useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={bubbleStyles.aiContainer}>
      <View style={bubbleStyles.aiBubble}>
        <Text style={bubbleStyles.aiText}>Thinking{dots}</Text>
      </View>
    </View>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <View style={bubbleStyles.userContainer}>
        <View style={bubbleStyles.userBubble}>
          <Text style={bubbleStyles.userText}>{msg.content}</Text>
        </View>
        <Text style={bubbleStyles.timestamp}>{time}</Text>
      </View>
    );
  }

  return (
    <View style={bubbleStyles.aiContainer}>
      <View style={bubbleStyles.aiAvatar}>
        <Text style={bubbleStyles.aiAvatarText}>🤖</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={bubbleStyles.aiBubble}>
          <Text style={bubbleStyles.aiText}>{msg.content}</Text>
        </View>
        <Text style={[bubbleStyles.timestamp, { marginLeft: 4 }]}>{time}</Text>
      </View>
    </View>
  );
}

const bubbleStyles = StyleSheet.create({
  userContainer: { alignItems: 'flex-end', marginVertical: 4, paddingLeft: 48 },
  aiContainer: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 4, paddingRight: 48 },
  userBubble: { backgroundColor: colors.primary, borderRadius: 20, borderBottomRightRadius: 4, paddingHorizontal: 16, paddingVertical: 12 },
  aiBubble: { backgroundColor: colors.surface, borderRadius: 20, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  userText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  aiText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  timestamp: { fontSize: 11, color: colors.textLight, marginTop: 4 },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 8, flexShrink: 0 },
  aiAvatarText: { fontSize: 16 },
});

// ─── Suggestion chips ─────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What can I cook with chicken?',
  'Give me a 30-minute meal idea',
  'Low-carb dinner suggestions',
  'Help me use up my vegetables',
];

// ─── AIChatScreen ─────────────────────────────────────────────────────────────

export function AIChatScreen(): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((m) => [...m, userMsg]);
      setInput('');
      setIsLoading(true);
      scrollToEnd();

      try {
        const res = await aiApi.post<{ data: { reply: string } }>('/ai/chat', { message: trimmed });
        const reply = res.data?.data?.reply ?? "Sorry, I didn't get that. Try again!";
        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          createdAt: new Date().toISOString(),
        };
        setMessages((m) => [...m, aiMsg]);
      } catch (err: any) {
        const errMsg: ChatMessage = {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: 'Something went wrong. Please check your connection and try again.',
          createdAt: new Date().toISOString(),
        };
        setMessages((m) => [...m, errMsg]);
      } finally {
        setIsLoading(false);
        scrollToEnd();
      }
    },
    [isLoading, scrollToEnd],
  );

  const isEmpty = messages.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>🤖</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Smart Chef AI</Text>
          <Text style={styles.headerSub}>Your personal cooking assistant</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {/* Messages */}
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👨‍🍳</Text>
            <Text style={styles.emptyTitle}>Ask me anything about cooking!</Text>
            <Text style={styles.emptySub}>Meal ideas, ingredient substitutions, cooking tips — I'm here to help.</Text>
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity key={s} style={styles.chip} onPress={() => send(s)}>
                  <Text style={styles.chipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageBubble msg={item} />}
            contentContainerStyle={styles.list}
            onContentSizeChange={scrollToEnd}
            ListFooterComponent={isLoading ? <TypingDots /> : null}
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about recipes, ingredients…"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
            blurOnSubmit={false}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AIChatScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  headerAvatarText: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: 12, color: colors.textSecondary },

  list: { padding: 16, paddingBottom: 8 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  suggestions: { width: '100%', gap: 10 },
  chip: { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  chipText: { fontSize: 14, color: colors.primary, fontWeight: '500', textAlign: 'center' },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.background },
  input: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: colors.surface, borderRadius: 22, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendIcon: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 24 },
});
