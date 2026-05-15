import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import type { RootState } from '../store';
import * as houseService from '../services/houseService';
import type { ChoreEntry, ChoreType } from '../services/houseService';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Header,
  IconButton,
  Sheet,
  Skeleton,
  TextField,
  useToast,
} from '../components/ui';

const TODAY = new Date().toISOString().slice(0, 10);

const formatDate = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  if (iso === TODAY) return 'Today';
  const tom = new Date();
  tom.setDate(tom.getDate() + 1);
  if (iso === tom.toISOString().slice(0, 10)) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const EMOJI_PICKS = ['🧽', '🪣', '🧺', '🪴', '🗑️', '🚽', '🪟', '💡', '🔧', '📦'];

function AddChoreSheet({
  visible,
  houseId,
  onClose,
  onCreated,
}: {
  visible: boolean;
  houseId: string;
  onClose: () => void;
  onCreated: (ct: ChoreType) => void;
}) {
  const c = useThemeColors();
  const toast = useToast();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🧽');
  const [freq, setFreq] = useState<'daily' | 'weekly'>('daily');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return toast.show('Enter a chore name', 'warning');
    setLoading(true);
    try {
      const ct = await houseService.createChoreType(houseId, {
        name: name.trim(),
        emoji,
        frequency: freq,
      });
      onCreated(ct);
      setName('');
      setEmoji('🧽');
      setFreq('daily');
      onClose();
      toast.show('Chore added', 'success');
    } catch (e: any) {
      toast.show(e?.response?.data?.error?.message ?? 'Could not create', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="New chore" height={520}>
      <View style={{ gap: spacing.md }}>
        <TextField
          label="Name"
          placeholder="e.g. Take out trash"
          value={name}
          onChangeText={setName}
          maxLength={50}
          autoFocus
        />
        <View>
          <Text style={[typography.label, { color: c.textSecondary, marginBottom: spacing.xs }]}>
            Emoji
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {EMOJI_PICKS.map((e) => (
                <View
                  key={e}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: emoji === e ? c.primaryMuted : c.surfaceMuted,
                    borderWidth: emoji === e ? 2 : 0,
                    borderColor: c.primary,
                  }}
                >
                  <Text
                    accessibilityRole="button"
                    accessibilityLabel={`Pick ${e}`}
                    onPress={() => setEmoji(e)}
                    style={{ fontSize: 22 }}
                  >
                    {e}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        <View>
          <Text style={[typography.label, { color: c.textSecondary, marginBottom: spacing.xs }]}>
            Frequency
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Chip label="📅 Daily" selected={freq === 'daily'} onPress={() => setFreq('daily')} />
            <Chip label="🗓 Weekly" selected={freq === 'weekly'} onPress={() => setFreq('weekly')} />
          </View>
        </View>
        <Button
          label="Create chore"
          onPress={handleCreate}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: spacing.md }}
        />
      </View>
    </Sheet>
  );
}

function ChoreScheduleTab({
  houseId,
  choreType,
  currentUserId,
  isAdmin,
}: {
  houseId: string;
  choreType: ChoreType;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const c = useThemeColors();
  const toast = useToast();
  const [schedule, setSchedule] = useState<ChoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await houseService.getChoreSchedule(houseId, {
        type_id: choreType.id,
        days: 14,
      });
      setSchedule(entries);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [houseId, choreType.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newEntries = await houseService.generateChoreSchedule(houseId, choreType.id, 14);
      if (newEntries.length === 0) {
        toast.show('All dates already assigned', 'info');
      } else {
        toast.show(`Added ${newEntries.length} entries`, 'success');
      }
      await load();
    } catch (e: any) {
      toast.show(e?.response?.data?.error?.message ?? 'Could not generate', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkDone = async (entry: ChoreEntry) => {
    if (entry.user_id !== currentUserId && !isAdmin) return;
    try {
      const updated = await houseService.updateChoreEntry(houseId, entry.id, { status: 'done' });
      setSchedule((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast.show('Marked done', 'success');
    } catch {
      toast.show('Could not update', 'error');
    }
  };

  const renderEntry = ({ item }: { item: ChoreEntry }) => {
    const isMe = item.user_id === currentUserId;
    const isToday = item.scheduled_date === TODAY;
    const tone =
      item.status === 'done'
        ? c.successMuted
        : item.status === 'skipped'
        ? c.errorMuted
        : c.surface;

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Avatar name={item.assignee_name ?? '?'} size={36} />
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
              {isMe ? 'You' : item.assignee_name}
            </Text>
          </View>
          {item.status === 'done' ? (
            <Badge label="✅ Done" tone="success" />
          ) : item.status === 'skipped' ? (
            <Badge label="⏭ Skipped" tone="neutral" />
          ) : (isMe || isAdmin) && item.status === 'pending' ? (
            <Button
              label={isMe ? 'Done ✓' : 'Mark done'}
              size="sm"
              variant={isMe ? 'primary' : 'secondary'}
              onPress={() => handleMarkDone(item)}
            />
          ) : null}
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabTopBar}>
        <Text style={[typography.h3, { color: c.text }]}>
          {choreType.emoji} {choreType.name}
        </Text>
        <Button
          label={`+ ${choreType.frequency === 'daily' ? '2 weeks' : '4 weeks'}`}
          size="sm"
          variant="secondary"
          loading={generating}
          onPress={handleGenerate}
        />
      </View>
      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={c.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="📅"
              title="No schedule yet"
              body={`Tap "+ ${choreType.frequency === 'daily' ? '2 weeks' : '4 weeks'}" to auto-assign.`}
            />
          ) : null
        }
      />
    </View>
  );
}

function TodayTab({
  houseId,
  currentUserId,
  cookToday,
}: {
  houseId: string;
  currentUserId: string;
  cookToday?: { cook_name: string; status: string; recipe_name?: string };
}) {
  const c = useThemeColors();
  const toast = useToast();
  const [entries, setEntries] = useState<ChoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    houseService
      .getChoreSchedule(houseId, { date: TODAY })
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [houseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMark = async (entry: ChoreEntry) => {
    if (entry.user_id !== currentUserId) return;
    try {
      const updated = await houseService.updateChoreEntry(houseId, entry.id, { status: 'done' });
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast.show('Marked done', 'success');
    } catch {
      toast.show('Could not update', 'error');
    }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} tintColor={c.primary} />
      }
    >
      <Text
        style={[typography.label, { color: c.textSecondary, marginBottom: spacing.md, fontWeight: '700' }]}
      >
        {dateStr}
      </Text>

      {cookToday ? (
        <DutyRow
          emoji="🍳"
          chore="Cooking"
          assignee={
            cookToday.cook_name + (cookToday.recipe_name ? ` — ${cookToday.recipe_name}` : '')
          }
          status={cookToday.status}
        />
      ) : null}

      {loading ? (
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Skeleton height={64} radius={14} />
          <Skeleton height={64} radius={14} />
        </View>
      ) : entries.length === 0 ? (
        <EmptyState
          icon="🧹"
          title="No chores scheduled today"
          body="Generate a schedule in each chore tab."
        />
      ) : (
        entries.map((entry) => {
          const isMe = entry.user_id === currentUserId;
          return (
            <DutyRow
              key={entry.id}
              emoji={entry.emoji ?? '🧹'}
              chore={entry.chore_name ?? 'Chore'}
              assignee={isMe ? 'Your turn' : entry.assignee_name ?? 'Someone'}
              status={entry.status ?? 'pending'}
              isMe={isMe}
              onMark={isMe ? () => handleMark(entry) : undefined}
            />
          );
        })
      )}
    </ScrollView>
  );
}

function DutyRow({
  emoji,
  chore,
  assignee,
  status,
  isMe,
  onMark,
}: {
  emoji: string;
  chore: string;
  assignee: string;
  status: string;
  isMe?: boolean;
  onMark?: () => void;
}) {
  const c = useThemeColors();
  const done = status === 'done';
  return (
    <Card
      surface="surface"
      radius="lg"
      padding="md"
      elevation="card"
      bordered
      style={{
        marginBottom: spacing.sm,
        backgroundColor: done ? c.successMuted : isMe ? c.primaryMuted : c.surface,
        borderColor: isMe ? c.primary : c.border,
        borderWidth: isMe ? 1.5 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={{ fontSize: 24, width: 32, textAlign: 'center' }}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h4, { color: c.text }]}>{chore}</Text>
          <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: 2 }]}>
            {assignee}
          </Text>
        </View>
        {done ? (
          <Text style={{ fontSize: 20 }}>✅</Text>
        ) : onMark ? (
          <Button label="Done" size="sm" onPress={onMark} hapticStyle="medium" />
        ) : (
          <Text style={{ fontSize: 20, opacity: 0.4 }}>⏳</Text>
        )}
      </View>
    </Card>
  );
}

export default function ChoresScreen({ navigation }: any) {
  const c = useThemeColors();
  const { house, members } = useSelector((s: RootState) => s.house);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const todayEntry = useSelector((s: RootState) =>
    s.cookSchedule.schedule.find((e) => e.scheduled_date === TODAY)
  );

  const [choreTypes, setChoreTypes] = useState<ChoreType[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = members.find((m) => m.user_id === currentUser?.id)?.role === 'admin';

  const loadChoreTypes = useCallback(async () => {
    if (!house) return;
    setLoading(true);
    try {
      const types = await houseService.listChoreTypes(house.id);
      setChoreTypes(types);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [house]);

  useEffect(() => {
    loadChoreTypes();
  }, [loadChoreTypes]);

  if (!house) return null;

  const tabs = ['Today', ...choreTypes.map((ct) => `${ct.emoji} ${ct.name}`)];
  const cookToday: { cook_name: string; status: string; recipe_name?: string } | undefined =
    todayEntry
      ? {
          cook_name: todayEntry.cook_name ?? 'Someone',
          status: todayEntry.status ?? 'pending',
          recipe_name: todayEntry.recipe_name ?? undefined,
        }
      : undefined;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="House chores"
        onBack={() => navigation.goBack()}
        right={
          isAdmin ? (
            <IconButton
              icon="+"
              size={36}
              variant="filled"
              accessibilityLabel="Add chore"
              onPress={() => setShowAdd(true)}
            />
          ) : null
        }
        border
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth, maxHeight: 56 }}
        contentContainerStyle={styles.tabStrip}
      >
        {loading
          ? null
          : tabs.map((label, idx) => (
              <Chip
                key={idx}
                label={label}
                selected={activeTab === idx}
                onPress={() => setActiveTab(idx)}
              />
            ))}
      </ScrollView>

      {!loading ? (
        activeTab === 0 ? (
          <TodayTab
            houseId={house.id}
            currentUserId={currentUser?.id ?? ''}
            cookToday={cookToday}
          />
        ) : (
          <ChoreScheduleTab
            key={choreTypes[activeTab - 1]?.id}
            houseId={house.id}
            choreType={choreTypes[activeTab - 1]!}
            currentUserId={currentUser?.id ?? ''}
            isAdmin={isAdmin}
          />
        )
      ) : null}

      <AddChoreSheet
        visible={showAdd}
        houseId={house.id}
        onClose={() => setShowAdd(false)}
        onCreated={(ct) => setChoreTypes((prev) => [...prev, ct])}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  tabStrip: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  tabTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
