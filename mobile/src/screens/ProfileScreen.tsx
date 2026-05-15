import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { clearAuth, setPreferences, toggleDarkMode, type RootState } from '../store';
import { userService } from '../services/userService';
import type { UserPreferences, RootStackParamList } from '../types';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Sheet,
  TextField,
  useToast,
} from '../components/ui';

type ProfileNav = NativeStackNavigationProp<RootStackParamList>;

const ALL_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
  'Low-Carb',
  'Keto',
  'Paleo',
];

function MacroBar({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const c = useThemeColors();
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={[typography.label, { color: c.textSecondary }]}>{label}</Text>
        <Text style={[typography.label, { color: c.textSecondary }]}>
          {value} / {goal}
        </Text>
      </View>
      <View
        style={{
          height: 8,
          backgroundColor: c.surfaceMuted,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <View style={{ height: '100%', borderRadius: 4, width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

export function ProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<ProfileNav>();
  const c = useThemeColors();
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const toast = useToast();

  const user = useSelector((s: RootState) => s.auth.user);
  const macroProgress = useSelector((s: RootState) => s.user.macroProgress);
  const storePrefs = useSelector((s: RootState) => s.user.preferences);
  const favoriteIds = useSelector((s: RootState) => s.favorites.ids);
  const isDark = useSelector((s: RootState) => s.settings.isDark);

  const [editSheet, setEditSheet] = useState<null | 'name' | 'goals'>(null);
  const [draftName, setDraftName] = useState('');
  const [draftGoals, setDraftGoals] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const { data: prefs } = useQuery({
    queryKey: ['user-prefs'],
    queryFn: async () => (await userService.getProfile()) as unknown as UserPreferences,
    initialData: storePrefs ?? undefined,
  });

  const updateName = useMutation({
    mutationFn: (name: string) => userService.updateProfile({ name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-prefs'] });
      setEditSheet(null);
      toast.show('Name updated', 'success');
    },
    onError: () => toast.show('Failed to update name', 'error'),
  });

  const updateGoals = useMutation({
    mutationFn: (g: {
      calories_goal: number;
      protein_goal: number;
      carbs_goal: number;
      fat_goal: number;
    }) => userService.updateGoals(g),
    onSuccess: (updated) => {
      dispatch(setPreferences(updated));
      qc.invalidateQueries({ queryKey: ['user-prefs'] });
      setEditSheet(null);
      toast.show('Goals updated', 'success');
    },
    onError: () => toast.show('Failed to update goals', 'error'),
  });

  const updateRestrictions = useMutation({
    mutationFn: (rs: string[]) => userService.updateRestrictions(rs),
    onSuccess: (updated) => {
      dispatch(setPreferences(updated));
      qc.invalidateQueries({ queryKey: ['user-prefs'] });
    },
  });

  const restrictions: string[] = prefs?.dietary_restrictions ?? [];
  const goals = {
    calories: prefs?.calories_goal ?? 2000,
    protein: prefs?.protein_goal ?? 150,
    carbs: prefs?.carbs_goal ?? 200,
    fat: prefs?.fat_goal ?? 65,
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(clearAuth()) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Identity */}
        <View style={styles.identity}>
          <Avatar name={user?.name ?? 'Guest'} size={88} tone="primary" />
          <Text style={[typography.h1, { color: c.text, marginTop: spacing.md }]}>
            {user?.name ?? 'Guest'}
          </Text>
          {user?.email ? (
            <Text style={[typography.body, { color: c.textSecondary }]}>{user.email}</Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <Button
              label="Edit profile"
              variant="secondary"
              size="sm"
              onPress={() => {
                setDraftName(user?.name ?? '');
                setDraftGoals({
                  calories: String(goals.calories),
                  protein: String(goals.protein),
                  carbs: String(goals.carbs),
                  fat: String(goals.fat),
                });
                setEditSheet('name');
              }}
            />
            {user?.is_admin ? <Badge label="ADMIN" tone="warning" size="md" /> : null}
          </View>
        </View>

        {/* Saved recipes */}
        <Card surface="surface" radius="xl" padding="lg" elevation="card" bordered style={styles.block}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[typography.h3, { color: c.text }]}>Saved recipes</Text>
            <Badge label={`${favoriteIds.length} saved`} tone="primary" />
          </View>
          <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: spacing.sm }]}>
            {favoriteIds.length === 0
              ? 'Tap the heart on any recipe card to save it here.'
              : 'Browse your saved recipes from the Home screen.'}
          </Text>
        </Card>

        {/* Macro goals */}
        <Card surface="surface" radius="xl" padding="lg" elevation="card" bordered style={styles.block}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Text style={[typography.h3, { color: c.text }]}>Daily goals</Text>
            <Button
              label="Edit"
              variant="ghost"
              size="sm"
              onPress={() => {
                setDraftGoals({
                  calories: String(goals.calories),
                  protein: String(goals.protein),
                  carbs: String(goals.carbs),
                  fat: String(goals.fat),
                });
                setEditSheet('goals');
              }}
            />
          </View>
          <MacroBar label="Calories" value={macroProgress.calories} goal={goals.calories} color={c.calories} />
          <MacroBar label="Protein (g)" value={macroProgress.protein} goal={goals.protein} color={c.protein} />
          <MacroBar label="Carbs (g)" value={macroProgress.carbs} goal={goals.carbs} color={c.carbs} />
          <MacroBar label="Fat (g)" value={macroProgress.fat} goal={goals.fat} color={c.fat} />
        </Card>

        {/* Restrictions */}
        <Card surface="surface" radius="xl" padding="lg" elevation="card" bordered style={styles.block}>
          <Text style={[typography.h3, { color: c.text, marginBottom: spacing.md }]}>
            Dietary restrictions
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {ALL_RESTRICTIONS.map((r) => (
              <Chip
                key={r}
                label={r}
                selected={restrictions.includes(r)}
                onPress={() =>
                  updateRestrictions.mutate(
                    restrictions.includes(r)
                      ? restrictions.filter((x) => x !== r)
                      : [...restrictions, r]
                  )
                }
              />
            ))}
          </View>
        </Card>

        {/* Account */}
        <Card surface="surface" radius="xl" padding="lg" elevation="card" bordered style={styles.block}>
          <Text style={[typography.h3, { color: c.text, marginBottom: spacing.md }]}>Account</Text>
          <View style={styles.row}>
            <Text style={{ fontSize: 18, marginRight: spacing.sm }}>🌙</Text>
            <Text style={[typography.body, { color: c.text, flex: 1 }]}>Dark mode</Text>
            <Switch
              value={isDark}
              onValueChange={() => {
                dispatch(toggleDarkMode());
              }}
              trackColor={{ false: c.borderStrong, true: c.primary }}
              accessibilityLabel="Toggle dark mode"
            />
          </View>
          <Divider inset={spacing.sm} />
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text style={[typography.body, { color: c.textSecondary }]}>Member since</Text>
            <Text style={[typography.body, { color: c.text, fontWeight: '600' }]}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString([], {
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </Text>
          </View>
        </Card>

        <Button
          label="Sign out"
          variant="destructive"
          onPress={handleSignOut}
          fullWidth
          size="lg"
          style={{ marginHorizontal: spacing.xl, marginTop: spacing.lg }}
        />

        <Text
          style={[
            typography.caption,
            { color: c.textLight, textAlign: 'center', marginTop: spacing.xl },
          ]}
        >
          Smart Cooking v1.0.0
        </Text>
      </ScrollView>

      {/* Combined edit sheet */}
      <Sheet
        visible={editSheet !== null}
        onClose={() => setEditSheet(null)}
        title={editSheet === 'name' ? 'Edit profile' : 'Edit daily goals'}
        height={editSheet === 'goals' ? 540 : 320}
      >
        {editSheet === 'name' ? (
          <View style={{ gap: spacing.md }}>
            <TextField
              label="Name"
              value={draftName}
              onChangeText={setDraftName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => draftName.trim() && updateName.mutate(draftName.trim())}
            />
            <Button
              label="Save"
              fullWidth
              size="lg"
              onPress={() => draftName.trim() && updateName.mutate(draftName.trim())}
              loading={updateName.isPending}
              disabled={!draftName.trim()}
            />
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            <TextField
              label="Calories (kcal)"
              value={draftGoals.calories}
              onChangeText={(v) => setDraftGoals((d) => ({ ...d, calories: v }))}
              keyboardType="numeric"
            />
            <TextField
              label="Protein (g)"
              value={draftGoals.protein}
              onChangeText={(v) => setDraftGoals((d) => ({ ...d, protein: v }))}
              keyboardType="numeric"
            />
            <TextField
              label="Carbs (g)"
              value={draftGoals.carbs}
              onChangeText={(v) => setDraftGoals((d) => ({ ...d, carbs: v }))}
              keyboardType="numeric"
            />
            <TextField
              label="Fat (g)"
              value={draftGoals.fat}
              onChangeText={(v) => setDraftGoals((d) => ({ ...d, fat: v }))}
              keyboardType="numeric"
            />
            <Button
              label="Save goals"
              fullWidth
              size="lg"
              loading={updateGoals.isPending}
              onPress={() =>
                updateGoals.mutate({
                  calories_goal: parseInt(draftGoals.calories, 10) || goals.calories,
                  protein_goal: parseInt(draftGoals.protein, 10) || goals.protein,
                  carbs_goal: parseInt(draftGoals.carbs, 10) || goals.carbs,
                  fat_goal: parseInt(draftGoals.fat, 10) || goals.fat,
                })
              }
            />
          </View>
        )}
      </Sheet>
    </SafeAreaView>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: spacing['4xl'] },
  identity: { alignItems: 'center', paddingTop: spacing['2xl'], paddingBottom: spacing.lg },
  block: { marginHorizontal: spacing.xl, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
