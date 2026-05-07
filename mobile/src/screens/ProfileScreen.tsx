import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clearAuth, setPreferences, toggleDarkMode, type RootState } from '../store';
import { Switch } from 'react-native';
import { userService } from '../services/userService';
import { colors } from '../theme/colors';
import type { UserPreferences } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <View style={macroStyles.row}>
      <View style={macroStyles.labelRow}>
        <Text style={macroStyles.label}>{label}</Text>
        <Text style={macroStyles.values}>{value} / {goal}</Text>
      </View>
      <View style={macroStyles.track}>
        <View style={[macroStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const macroStyles = StyleSheet.create({
  row: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  values: { fontSize: 13, color: colors.textSecondary },
  track: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});

// ─── Dietary restriction chips ────────────────────────────────────────────────

const ALL_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
  'Nut-Free', 'Halal', 'Kosher', 'Low-Carb', 'Keto', 'Paleo',
];

function RestrictionChips({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (r: string) => void;
}) {
  return (
    <View style={chipStyles.container}>
      {ALL_RESTRICTIONS.map((r) => {
        const active = selected.includes(r);
        return (
          <TouchableOpacity
            key={r}
            style={[chipStyles.chip, active && chipStyles.chipActive]}
            onPress={() => onToggle(r)}
          >
            <Text style={[chipStyles.chipText, active && chipStyles.chipTextActive]}>{r}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const chipStyles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
});

// ─── Edit Name Modal ──────────────────────────────────────────────────────────

function EditNameModal({
  visible,
  currentName,
  onSave,
  onClose,
}: {
  visible: boolean;
  currentName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(currentName);
  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <Text style={modalStyles.title}>Edit Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={modalStyles.input}
            placeholder="Your name"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => { if (name.trim()) onSave(name.trim()); }}
          />
          <TouchableOpacity
            style={[modalStyles.saveBtn, !name.trim() && modalStyles.saveBtnDisabled]}
            onPress={() => { if (name.trim()) onSave(name.trim()); }}
            disabled={!name.trim()}
          >
            <Text style={modalStyles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, marginBottom: 16 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  saveBtnDisabled: { backgroundColor: colors.border },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: colors.textSecondary, fontSize: 15 },
});

// ─── ProfileScreen ────────────────────────────────────────────────────────────

export function ProfileScreen(): React.JSX.Element {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const user = useSelector((s: RootState) => s.auth.user);
  const macroProgress = useSelector((s: RootState) => s.user.macroProgress);
  const storePrefs = useSelector((s: RootState) => s.user.preferences);
  const favoriteIds = useSelector((s: RootState) => s.favorites.ids);
  const isDark = useSelector((s: RootState) => s.settings.isDark);
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [editGoalsVisible, setEditGoalsVisible] = useState(false);
  const [draftGoals, setDraftGoals] = useState({ calories: '', protein: '', carbs: '', fat: '' });

  // Fetch live preferences
  const { data: prefs, isLoading: prefsLoading } = useQuery({
    queryKey: ['user-prefs'],
    queryFn: async () => {
      // preferences are embedded in user profile endpoint response
      const u = await userService.getProfile();
      return u as unknown as UserPreferences; // server merges prefs into profile
    },
    initialData: storePrefs ?? undefined,
  });

  const updateNameMutation = useMutation({
    mutationFn: (name: string) => userService.updateProfile({ name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-prefs'] });
      setEditNameVisible(false);
    },
    onError: () => Alert.alert('Error', 'Failed to update name. Try again.'),
  });

  const updateGoalsMutation = useMutation({
    mutationFn: (goals: { calories_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number }) =>
      userService.updateGoals(goals),
    onSuccess: (updated) => {
      dispatch(setPreferences(updated));
      qc.invalidateQueries({ queryKey: ['user-prefs'] });
      setEditGoalsVisible(false);
    },
    onError: () => Alert.alert('Error', 'Failed to update goals. Try again.'),
  });

  const updateRestrictionsMutation = useMutation({
    mutationFn: (restrictions: string[]) => userService.updateRestrictions(restrictions),
    onSuccess: (updated) => {
      dispatch(setPreferences(updated));
      qc.invalidateQueries({ queryKey: ['user-prefs'] });
    },
  });

  const restrictions: string[] = prefs?.dietary_restrictions ?? [];

  function handleToggleRestriction(r: string) {
    const next = restrictions.includes(r)
      ? restrictions.filter((x) => x !== r)
      : [...restrictions, r];
    updateRestrictionsMutation.mutate(next);
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(clearAuth()) },
    ]);
  }

  const name = user?.name ?? 'Guest';
  const email = user?.email ?? '';

  const goals = {
    calories: prefs?.calories_goal ?? 2000,
    protein: prefs?.protein_goal ?? 150,
    carbs: prefs?.carbs_goal ?? 200,
    fat: prefs?.fat_goal ?? 65,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar + identity */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{initials(name)}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          <TouchableOpacity style={styles.editNameBtn} onPress={() => setEditNameVisible(true)}>
            <Text style={styles.editNameText}>Edit Name</Text>
          </TouchableOpacity>
        </View>

        {/* Favorites summary */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Saved Recipes</Text>
            <Text style={styles.favCount}>{favoriteIds.length} saved</Text>
          </View>
          {favoriteIds.length === 0 ? (
            <Text style={styles.restrictionHint}>Tap ❤️ on any recipe card to save it here.</Text>
          ) : (
            <Text style={styles.restrictionHint}>Browse your saved recipes from the Home screen.</Text>
          )}
        </View>

        {/* Macro goals */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Daily Macro Goals</Text>
            <TouchableOpacity onPress={() => {
              setDraftGoals({
                calories: String(goals.calories),
                protein: String(goals.protein),
                carbs: String(goals.carbs),
                fat: String(goals.fat),
              });
              setEditGoalsVisible(true);
            }}>
              <Text style={styles.editGoalsBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          {prefsLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
          ) : (
            <>
              <MacroBar label="Calories" value={macroProgress.calories} goal={goals.calories} color={colors.calories} />
              <MacroBar label="Protein (g)" value={macroProgress.protein} goal={goals.protein} color={colors.protein} />
              <MacroBar label="Carbs (g)" value={macroProgress.carbs} goal={goals.carbs} color={colors.carbs} />
              <MacroBar label="Fat (g)" value={macroProgress.fat} goal={goals.fat} color={colors.fat} />
            </>
          )}
          <Text style={styles.macroHint}>Track your daily intake via logged meals.</Text>
        </View>

        {/* Edit Goals Modal */}
        <Modal visible={editGoalsVisible} animationType="slide" transparent presentationStyle="overFullScreen">
          <View style={goalModalStyles.overlay}>
            <View style={goalModalStyles.sheet}>
              <Text style={goalModalStyles.title}>Edit Daily Goals</Text>
              {([
                { key: 'calories', label: 'Calories (kcal)' },
                { key: 'protein',  label: 'Protein (g)' },
                { key: 'carbs',    label: 'Carbs (g)' },
                { key: 'fat',      label: 'Fat (g)' },
              ] as const).map(({ key, label }) => (
                <View key={key} style={goalModalStyles.row}>
                  <Text style={goalModalStyles.label}>{label}</Text>
                  <TextInput
                    style={goalModalStyles.input}
                    value={draftGoals[key]}
                    onChangeText={(v) => setDraftGoals((d) => ({ ...d, [key]: v }))}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </View>
              ))}
              <TouchableOpacity
                style={[goalModalStyles.saveBtn, updateGoalsMutation.isPending && { opacity: 0.6 }]}
                onPress={() => {
                  updateGoalsMutation.mutate({
                    calories_goal: parseInt(draftGoals.calories, 10) || goals.calories,
                    protein_goal:  parseInt(draftGoals.protein,  10) || goals.protein,
                    carbs_goal:    parseInt(draftGoals.carbs,    10) || goals.carbs,
                    fat_goal:      parseInt(draftGoals.fat,      10) || goals.fat,
                  });
                }}
                disabled={updateGoalsMutation.isPending}
              >
                {updateGoalsMutation.isPending
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={goalModalStyles.saveBtnText}>Save Goals</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={goalModalStyles.cancelBtn} onPress={() => setEditGoalsVisible(false)}>
                <Text style={goalModalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        {/* Dietary restrictions */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Dietary Restrictions</Text>
            {updateRestrictionsMutation.isPending && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </View>
          <RestrictionChips selected={restrictions} onToggle={handleToggleRestriction} />
          {restrictions.length === 0 && (
            <Text style={styles.restrictionHint}>Tap to add your dietary restrictions.</Text>
          )}
        </View>

        {/* Account section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={[styles.infoRow, { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
            <Text style={styles.infoLabel}>🌙 Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={(_v) => { dispatch(toggleDarkMode()); }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' })
                : '—'}
            </Text>
          </View>
          {user?.is_admin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>⚡ Admin</Text>
            </View>
          )}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Smart Cooking v1.0.0</Text>
      </ScrollView>

      {/* Edit name modal */}
      <EditNameModal
        visible={editNameVisible}
        currentName={name}
        onSave={(n) => updateNameMutation.mutate(n)}
        onClose={() => setEditNameVisible(false)}
      />
    </SafeAreaView>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 48 },

  avatarSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  avatarInitials: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  email: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 },
  editNameBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  editNameText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  card: { marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.surfaceElevated, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1, borderWidth: 1, borderColor: colors.divider },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  macroHint: { fontSize: 12, color: colors.textLight, marginTop: 8, textAlign: 'center' },
  restrictionHint: { fontSize: 13, color: colors.textLight, marginTop: 10 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: '500' },

  adminBadge: { marginTop: 12, backgroundColor: colors.secondary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start' },
  adminText: { fontSize: 13, fontWeight: '700', color: colors.accent },

  signOutBtn: { marginHorizontal: 20, marginTop: 8, backgroundColor: '#FFF0F0', borderRadius: 24, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FFCDD2' },
  signOutText: { fontSize: 16, fontWeight: '700', color: colors.error },

  version: { textAlign: 'center', marginTop: 24, fontSize: 12, color: colors.textLight },
  editGoalsBtn: { fontSize: 14, fontWeight: '600', color: colors.primary },
  favCount: { fontSize: 14, fontWeight: '600', color: colors.primary },
});

const goalModalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, flex: 1 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: colors.text, width: 110, textAlign: 'right' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 10 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: colors.textSecondary, fontSize: 15 },
});
