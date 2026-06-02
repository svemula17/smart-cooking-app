// HouseChatScreen.tsx — simple in-house chat
//
// Scope: local-only chat persisted to AsyncStorage. There is no backend
// websocket / push channel yet — messages live on this device. Two people
// on the same house *will not* see each other's messages until a sync
// service exists. Tracked under TODO(house-chat-sync).
//
// Why ship it anyway: gives the user something to demo and to gather
// feedback on the UX while the real-time layer is being built.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

import { RootState } from '../store';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';
import { typography } from '../theme/typography';
import { Avatar, Button, Header } from '../components/ui';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number; // epoch ms
}

// One chat log per house, namespaced by house id
const storageKey = (houseId: string) => `house-chat:${houseId}`;

const formatTime = (ms: number) => {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const SEED_MESSAGES = (houseName: string): ChatMessage[] => [
  {
    id: 'seed-1',
    userId: 'system',
    userName: houseName,
    text: `Welcome to ${houseName} chat — coordinate cooking, chores, and house life here.`,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
];

export default function HouseChatScreen({ navigation }: any) {
  const c = useThemeColors();
  const user = useSelector((s: RootState) => s.auth.user);
  const house = useSelector((s: RootState) => s.house.house);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const key = useMemo(() => (house ? storageKey(house.id) : null), [house]);

  // Hydrate from storage on mount
  useEffect(() => {
    if (!key || !house) return;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) setMessages(JSON.parse(raw));
        else setMessages(SEED_MESSAGES(house.name));
      } catch {
        setMessages(SEED_MESSAGES(house.name));
      }
    })();
  }, [key, house]);

  // Persist on every change
  useEffect(() => {
    if (!key) return;
    AsyncStorage.setItem(key, JSON.stringify(messages)).catch(() => {});
  }, [key, messages]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: user?.id ?? 'me',
      userName: user?.name?.split(' ')[0] ?? 'You',
      text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [input, user]);

  if (!house) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
        <Header title="House chat" onBack={() => navigation.goBack()} border />
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>🏠</Text>
          <Text style={[typography.h3, { color: c.text, marginTop: spacing.md }]}>
            Join a house first
          </Text>
          <Text
            style={[
              typography.body,
              { color: c.textSecondary, textAlign: 'center', marginTop: spacing.sm },
            ]}
          >
            Chat is only available once you're part of a household.
          </Text>
          <Button
            label="Set up a house"
            variant="primary"
            onPress={() => navigation.navigate('HouseOnboarding')}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ThemedStatusBar />
      <Header title={`${house.name} chat`} onBack={() => navigation.goBack()} border />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMe = item.userId === (user?.id ?? 'me');
            const isSystem = item.userId === 'system';
            if (isSystem) {
              return (
                <View style={styles.systemRow}>
                  <Text
                    style={[
                      typography.caption,
                      { color: c.textSecondary, textAlign: 'center' },
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
              );
            }
            return (
              <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}>
                {!isMe ? <Avatar name={item.userName} size={28} tone="primary" /> : null}
                <View
                  style={[
                    styles.bubble,
                    {
                      backgroundColor: isMe ? c.primary : c.surface,
                      borderColor: isMe ? c.primary : c.border,
                    },
                  ]}
                >
                  {!isMe ? (
                    <Text
                      style={[
                        typography.caption,
                        { color: c.textSecondary, fontWeight: '700', marginBottom: 2 },
                      ]}
                    >
                      {item.userName}
                    </Text>
                  ) : null}
                  <Text
                    style={{
                      color: isMe ? c.onPrimary : c.text,
                      fontSize: 15,
                      lineHeight: 20,
                    }}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={{
                      color: isMe ? 'rgba(255,255,255,0.7)' : c.textLight,
                      fontSize: 10,
                      marginTop: 4,
                      alignSelf: 'flex-end',
                    }}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={[styles.composer, { borderTopColor: c.border, backgroundColor: c.surface }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message your house…"
            placeholderTextColor={c.textLight}
            style={[styles.input, { backgroundColor: c.surfaceMuted, color: c.text }]}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={send}
          />
          <Button
            label="Send"
            onPress={send}
            disabled={!input.trim()}
            variant="primary"
            size="md"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['2xl'] },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  systemRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  msgRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
    maxWidth: '85%',
    marginVertical: 2,
  },
  msgRowMe: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgRowOther: { alignSelf: 'flex-start' },
  bubble: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    maxWidth: '100%',
  },
  composer: {
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
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
});
