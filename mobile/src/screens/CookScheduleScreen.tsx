import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../store';
import {
  addScheduleEntries,
  setSchedule,
  updateScheduleEntry,
} from '../store/slices/cookScheduleSlice';
import * as houseService from '../services/houseService';
import type { CookScheduleEntry } from '../services/houseService';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Header,
  useToast,
} from '../components/ui';

const formatDate = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (iso === today.toISOString().slice(0, 10)) return 'Today';
  if (iso === tomorrow.toISOString().slice(0, 10)) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function CookScheduleScreen({ navigation }: any) {
  const c = useThemeColors();
  const dispatch = useDispatch();
  const toast = useToast();
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
      toast.show('Could not load schedule', 'error');
    }
  }, [house, dispatch, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    if (!house) return;
    setGenerating(true);
    try {
      const newEntries = await houseService.generateSchedule(house.id, 14);
      dispatch(addScheduleEntries(newEntries));
      if (newEntries.length === 0) {
        toast.show('All days already assigned', 'info');
      } else {
        toast.show(`Added ${newEntries.length} days`, 'success');
      }
    } catch (e: any) {
      toast.show(e?.response?.data?.error?.message ?? 'Could not generate schedule', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkDone = async (entry: CookScheduleEntry) => {
    if (!house) return;
    try {
      const updated = await houseService.updateScheduleEntry(house.id, entry.id, {
        status: 'done',
      });
      dispatch(updateScheduleEntry(updated));
      toast.show('Marked done', 'success');
    } catch {
      toast.show('Could not update', 'error');
    }
  };

  const renderEntry = ({ item }: { item: CookScheduleEntry }) => {
    const isMe = item.user_id === currentUser?.id;
    const isToday = item.scheduled_date === TODAY;

    const statusBadge = (() => {
      switch (item.status) {
        case 'cooking':
          return <Badge label="🍳 Cooking" tone="warning" />;
        case 'done':
          return <Badge label="✅ Done" tone="success" />;
        case 'skipped':
          return <Badge label="⏭ Skipped" tone="neutral" />;
        default:
          return null;
      }
    })();

    const tone = (() => {
      switch (item.status) {
        case 'cooking':
          return c.warningMuted;
        case 'done':
          return c.successMuted;
        case 'skipped':
          return c.errorMuted;
        default:
          return c.surface;
      }
    })();

    return (
      <Card
        surface="surface"
        radius="lg"
        padding="md"
        elevation="card"
        bordered
        style={{
          marginBottom: spacing.sm,
          backgroundColor: tone,
          borderColor: isToday ? c.primary : c.border,
          borderWidth: isToday ? 2 : 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
          <Avatar name={item.cook_name ?? '?'} size={40} />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                typography.caption,
                { color: isToday ? c.primary : c.textSecondary, fontWeight: '700' },
              ]}
            >
              {formatDate(item.scheduled_date)}
            </Text>
            <Text style={[typography.h4, { color: c.text, marginTop: 2 }]}>
              {isMe ? 'You' : item.cook_name}
            </Text>
            {item.recipe_name ? (
              <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: 2 }]}>
                {item.recipe_name}
              </Text>
            ) : (
              <Text style={[typography.caption, { color: c.textLight, marginTop: 2 }]}>
                Recipe not picked yet
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
            {statusBadge}
            {isMe && isToday && item.status === 'pending' ? (
              <Button label="Mark done" size="sm" onPress={() => handleMarkDone(item)} />
            ) : null}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Cook schedule"
        onBack={() => navigation.goBack()}
        right={
          <Button label="+ 2 weeks" size="sm" loading={generating} onPress={handleGenerate} />
        }
        border
      />
      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={c.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="📅"
            title="No schedule yet"
            body="Tap “+ 2 weeks” to auto-assign cooks."
            ctaLabel="+ 2 weeks"
            onCta={handleGenerate}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
});
