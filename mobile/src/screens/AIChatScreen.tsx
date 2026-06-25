import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ThemedStatusBar } from "../components/ThemedStatusBar";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { aiService } from '../services/aiService';
import type { ChatMessage, AppNavigation } from '../types';
import type { RootState } from '../store';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';
import { typography } from '../theme/typography';
import {
  Avatar,
  Card,
  Chip,
  Header,
  IconButton,
} from '../components/ui';

function TypingDots() {
  const c = useThemeColors();
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={[styles.aiContainer]}>
      <Avatar name="🧑‍🍳" size={32} tone="primary" />
      <View
        style={[
          styles.aiBubble,
          { backgroundColor: c.surface, borderColor: c.border, marginLeft: spacing.sm },
        ]}
      >
        <Text style={{ color: c.textSecondary, fontSize: 15 }}>Thinking{dots}</Text>
      </View>
    </View>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const c = useThemeColors();
  const isUser = msg.role === 'user';
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <View style={styles.userContainer}>
        <View
          style={[
            styles.userBubble,
            { backgroundColor: c.primary },
          ]}
        >
          <Text style={{ color: c.onPrimary, fontSize: 15, lineHeight: 22 }}>
            {msg.content}
          </Text>
        </View>
        <Text style={[typography.caption, { color: c.textLight, marginTop: 4 }]}>{time}</Text>
      </View>
    );
  }

  return (
    <View style={styles.aiContainer}>
      <Avatar name="🧑‍🍳" size={32} tone="primary" />
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <View
          style={[
            styles.aiBubble,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <Text style={{ color: c.text, fontSize: 15, lineHeight: 22 }}>{msg.content}</Text>
        </View>
        <Text style={[typography.caption, { color: c.textLight, marginTop: 4, marginLeft: 4 }]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

const SUGGESTIONS = [
  'What can I cook with chicken?',
  'Give me a 30-minute meal idea',
  'Low-carb dinner suggestions',
  'Help me use up my vegetables',
];

export function AIChatScreen({ navigation }: { navigation: AppNavigation }): React.JSX.Element {
  const c = useThemeColors();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const listRef = useRef<FlatList>(null);
  const user = useSelector((s: RootState) => s.auth.user);
  const prefs = useSelector((s: RootState) => s.user.preferences);

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
        const result = await aiService.chat({
          user_id: user?.id ?? 'anonymous',
          message: trimmed,
          conversation_id: conversationId,
        });
        if (result.conversation_id) setConversationId(result.conversation_id);
        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: result.response,
          createdAt: new Date().toISOString(),
        };
        setMessages((m) => [...m, aiMsg]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: `e-${Date.now()}`,
            role: 'assistant',
            content: 'Something went wrong. Please check your connection and try again.',
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
        scrollToEnd();
      }
    },
    [isLoading, scrollToEnd, conversationId, user?.id]
  );

  const isEmpty = messages.length === 0;

  // Saved macro goals power the ✨ meal-prep planner prompt (fallbacks match
  // the rest of the app when goals aren't set yet).
  const calGoal = prefs?.calories_goal ?? 2000;
  const proGoal = prefs?.protein_goal ?? 150;
  const planMyWeek = () =>
    send(
      `Create a simple 7-day meal-prep plan I can batch-cook. Daily targets: about ${calGoal} kcal and at least ${proGoal}g protein each day. Give breakfast, lunch, and dinner for each day, reuse overlapping ingredients to keep the shopping list short, and finish with a consolidated grocery list.`,
    );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ThemedStatusBar />
      <Header
        title="Smart Chef AI"
        subtitle="Your personal cooking assistant"
        showBack={!!navigation?.canGoBack?.()}
        border
        left={<Avatar name="🧑‍🍳" size={36} tone="primary" />}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 56, marginBottom: spacing.lg }}>👨‍🍳</Text>
            <Text style={[typography.h2, { color: c.text, textAlign: 'center' }]}>
              Ask me anything about cooking!
            </Text>
            <Text
              style={[
                typography.body,
                { color: c.textSecondary, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing['2xl'] },
              ]}
            >
              Meal ideas, ingredient swaps, cooking tips — I’m here to help.
            </Text>
            <View style={{ width: '100%', gap: spacing.sm }}>
              {/* ✨ Meal-prep planner — featured action */}
              <Card
                surface="surface"
                radius="lg"
                padding="md"
                elevation="card"
                bordered
                onPress={planMyWeek}
                accessibilityLabel="Plan my week"
                style={{ borderColor: c.primary, backgroundColor: c.primaryMuted }}
              >
                <Text style={{ color: c.text, fontSize: 15, fontWeight: '800' }}>
                  ✨ Plan my week
                </Text>
                <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 2 }}>
                  A 7-day meal prep for your {proGoal}g protein goal
                </Text>
              </Card>

              {SUGGESTIONS.map((s) => (
                <Card
                  key={s}
                  surface="surface"
                  radius="lg"
                  padding="md"
                  elevation="flat"
                  bordered
                  onPress={() => send(s)}
                  accessibilityLabel={s}
                >
                  <Text style={{ color: c.primary, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                    {s}
                  </Text>
                </Card>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageBubble msg={item} />}
            contentContainerStyle={{ padding: spacing.lg }}
            onContentSizeChange={scrollToEnd}
            ListFooterComponent={isLoading ? <TypingDots /> : null}
          />
        )}

        <View style={[styles.inputBar, { backgroundColor: c.background, borderTopColor: c.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about recipes, ingredients…"
            placeholderTextColor={c.textLight}
            style={[
              styles.input,
              {
                backgroundColor: c.surface,
                borderColor: c.border,
                color: c.text,
              },
            ]}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
            blurOnSubmit={false}
            editable={!isLoading}
            accessibilityLabel="Message"
          />
          <IconButton
            icon="↑"
            size={44}
            variant="filled"
            disabled={!input.trim() || isLoading}
            accessibilityLabel="Send message"
            onPress={() => send(input)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AIChatScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  userContainer: { alignItems: 'flex-end', marginVertical: 4, paddingLeft: 48 },
  aiContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingRight: 48,
  },
  userBubble: {
    borderRadius: radii.xl,
    borderBottomRightRadius: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  aiBubble: {
    borderRadius: radii.xl,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    borderWidth: 1,
  },
});
