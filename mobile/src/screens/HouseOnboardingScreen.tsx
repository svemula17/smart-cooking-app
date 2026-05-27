import React, { useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

import { setHouse } from '../store/slices/houseSlice';
import * as houseService from '../services/houseService';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button, IconButton, TextField, useToast } from '../components/ui';

type Mode = 'choose' | 'create' | 'join';

export default function HouseOnboardingScreen() {
  const c = useThemeColors();
  const dispatch = useDispatch();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('choose');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Local-only fallback so the user can demo the rest of the house flow even
  // when not signed in (or when the backend is unreachable). Generates a
  // deterministic mock house with a friendly invite code.
  const buildMockHouse = (houseName: string) => ({
    id: `local-${Date.now()}`,
    name: houseName,
    invite_code: 'DEMO' + Math.random().toString(36).slice(2, 5).toUpperCase(),
    created_by: 'local-user',
    created_at: new Date().toISOString(),
  });

  const handleCreate = async () => {
    if (!name.trim()) return Alert.alert('Enter a house name');
    setLoading(true);
    try {
      const result = await houseService.createHouse(name.trim());
      dispatch(setHouse({ house: result.house, members: [] }));
      toast.show('House created', 'success');
    } catch (e: any) {
      const status = e?.response?.status;
      // 401 = unauthenticated (guest mode). Use local mock so the user can
      // still preview the in-app house flow.
      if (status === 401 || !e?.response) {
        const house = buildMockHouse(name.trim());
        dispatch(setHouse({ house: house as any, members: [] }));
        toast.show('House created (offline preview)', 'success');
      } else {
        toast.show(e?.response?.data?.error?.message ?? 'Could not create house', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (code.trim().length !== 7) return Alert.alert('Enter the 7-character invite code');
    setLoading(true);
    try {
      const result = await houseService.joinHouse(code.trim());
      dispatch(setHouse({ house: result.house, members: result.members }));
      toast.show('Joined house', 'success');
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401 || !e?.response) {
        // Same offline-preview fallback for join.
        const house = buildMockHouse(`House ${code.trim()}`);
        dispatch(setHouse({ house: house as any, members: [] }));
        toast.show('Joined (offline preview)', 'success');
      } else {
        toast.show(e?.response?.data?.error?.message ?? 'Invalid invite code', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        {mode !== 'choose' ? (
          <IconButton
            icon="‹"
            size={40}
            accessibilityLabel="Back"
            onPress={() => setMode('choose')}
          />
        ) : null}
      </View>
      <View style={styles.content}>
        {mode === 'choose' ? (
          <>
            <Text style={{ fontSize: 64, marginBottom: spacing.lg }}>🏠</Text>
            <Text style={[typography.h1, { color: c.text, textAlign: 'center' }]}>
              Set up your house
            </Text>
            <Text
              style={[
                typography.body,
                {
                  color: c.textSecondary,
                  textAlign: 'center',
                  marginTop: spacing.md,
                  marginBottom: spacing['2xl'],
                  fontSize: 15,
                },
              ]}
            >
              Coordinate cooking with roommates — plan meals, share costs, track ingredients.
            </Text>
            <Button
              label="🏠  Create a new house"
              size="lg"
              fullWidth
              onPress={() => setMode('create')}
            />
            <View style={{ height: spacing.md }} />
            <Button
              label="🔑  Join with invite code"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={() => setMode('join')}
            />
          </>
        ) : mode === 'create' ? (
          <>
            <Text style={[typography.h1, { color: c.text, textAlign: 'center' }]}>
              Name your house
            </Text>
            <Text
              style={[
                typography.body,
                {
                  color: c.textSecondary,
                  textAlign: 'center',
                  marginTop: spacing.md,
                  marginBottom: spacing['2xl'],
                },
              ]}
            >
              A fun name your roommates will recognise.
            </Text>
            <TextField
              placeholder="e.g. The Boys' Kitchen"
              value={name}
              onChangeText={setName}
              maxLength={50}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <Button
              label="Create house"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleCreate}
              style={{ marginTop: spacing.lg }}
            />
          </>
        ) : (
          <>
            <Text style={[typography.h1, { color: c.text, textAlign: 'center' }]}>
              Join a house
            </Text>
            <Text
              style={[
                typography.body,
                {
                  color: c.textSecondary,
                  textAlign: 'center',
                  marginTop: spacing.md,
                  marginBottom: spacing['2xl'],
                },
              ]}
            >
              Ask a roommate for the 7-character invite code.
            </Text>
            <TextField
              placeholder="SAIRAJ7"
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              maxLength={7}
              autoCapitalize="characters"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleJoin}
              accessibilityLabel="Invite code"
            />
            <Button
              label="Join house"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleJoin}
              style={{ marginTop: spacing.lg }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, height: 56, justifyContent: 'center' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing['2xl'], alignItems: 'center' },
});
