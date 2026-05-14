import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { addScheduleEntries, setSchedule, updateScheduleEntry } from '../store/slices/cookScheduleSlice';
import * as houseService from '../services/houseService';
import type { CookScheduleEntry } from '../services/houseService';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F3F3F3',
  cooking: '#FFF3E0',
  done: '#F0FDF4',
  skipped: '#FEF2F2',
};

const STATUS_TEXT: Record<string, string> = {
  pending: '',
  cooking: '🍳 Cooking',
  done: '✅ Done',
  skipped: '⏭ Skipped',
};

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (iso === today.toISOString().slice(0, 10)) return 'Today';
  if (iso === tomorrow.toISOString().slice(0, 10)) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function CookScheduleScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { house } = useSelector((s: RootState) => s.house);
  const { schedule, isLoading } = useSelector((s: RootState) => s.cookSchedule);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const [generating, setGenerating] = useState(false);

  const TODAY = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    if (!house) return;
    try {
      const sched = await houseService.getSchedule(house.id, 14);
      dispatch(setSchedule(sched));
    } catch {
      Alert.alert('Error', 'Could not load schedule');
    }
  }, [house, dispatch]);

  useEffect(() => { load(); }, [load]);

  async function handleGenerate() {
    if (!house) return;
    setGenerating(true);
    try {
      const newEntries = await houseService.generateSchedule(house.id, 14);
      dispatch(addScheduleEntries(newEntries));
      if (newEntries.length === 0) {
        Alert.alert('All set', 'All days for the next 2 weeks already have cooks assigned.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Could not generate schedule');
    } finally {
      setGenerating(false);
    }
  }

  async function handlePickRecipe(entry: CookScheduleEntry) {
    if (entry.user_id !== currentUser?.id) return;
    navigation.navigate('RecipeSelect', { onSelect: async (recipeId: string) => {
      if (!house) return;
      try {
        const updated = await houseService.updateScheduleEntry(house.id, entry.id, { recipe_id: recipeId });
        dispatch(updateScheduleEntry(updated));
      } catch {
        Alert.alert('Error', 'Could not pick recipe');
      }
    }});
  }

  async function handleMarkDone(entry: CookScheduleEntry) {
    if (!house) return;
    try {
      const updated = await houseService.updateScheduleEntry(house.id, entry.id, { status: 'done' });
      dispatch(updateScheduleEntry(updated));
    } catch {
      Alert.alert('Error', 'Could not update status');
    }
  }

  function renderEntry({ item }: { item: CookScheduleEntry }) {
    const isMe = item.user_id === currentUser?.id;
    const isPast = item.scheduled_date < TODAY;
    const isToday = item.scheduled_date === TODAY;

    return (
      <View style={[styles.entryCard, { backgroundColor: STATUS_COLORS[item.status] }, isToday && styles.todayBorder]}>
        <View style={styles.entryLeft}>
          <Text style={[styles.entryDate, isToday && styles.todayText]}>{formatDate(item.scheduled_date)}</Text>
          <View style={styles.cookRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.cook_name?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cookName}>{isMe ? 'You' : item.cook_name}</Text>
              {item.recipe_name ? (
                <Text style={styles.recipeName}>{item.recipe_name}</Text>
              ) : isMe ? (
                <TouchableOpacity onPress={() => handlePickRecipe(item)}>
                  <Text style={styles.pickRecipe}>Tap to pick a recipe →</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.noRecipe}>Recipe not picked</Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.entryRight}>
          {STATUS_TEXT[item.status] ? (
            <Text style={styles.statusText}>{STATUS_TEXT[item.status]}</Text>
          ) : isMe && isToday && item.status === 'pending' ? (
            <TouchableOpacity style={styles.doneBtn} onPress={() => handleMarkDone(item)}>
              <Text style={styles.doneBtnText}>Mark done</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Cook Schedule</Text>
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.disabled]}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#E85D04" />
          ) : (
            <Text style={styles.generateBtnText}>+ 2 weeks</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No schedule yet</Text>
            <Text style={styles.emptySubtitle}>Tap "+ 2 weeks" to auto-assign cooks.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1C1C1E' },
  generateBtn: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E85D04',
  },
  generateBtnText: { color: '#E85D04', fontWeight: '700', fontSize: 14 },
  list: { padding: 16 },
  entryCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  todayBorder: { borderWidth: 2, borderColor: '#E85D04' },
  entryLeft: { flex: 1 },
  entryDate: { fontSize: 12, color: '#9B9B9B', marginBottom: 8, fontWeight: '600' },
  todayText: { color: '#E85D04' },
  cookRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E85D04',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cookName: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  recipeName: { fontSize: 13, color: '#6B6B6B', marginTop: 2 },
  pickRecipe: { fontSize: 13, color: '#E85D04', marginTop: 2 },
  noRecipe: { fontSize: 13, color: '#9B9B9B', marginTop: 2 },
  entryRight: { alignItems: 'flex-end' },
  statusText: { fontSize: 12, color: '#6B6B6B' },
  doneBtn: {
    backgroundColor: '#E85D04',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  disabled: { opacity: 0.6 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#6B6B6B', textAlign: 'center' },
});
