import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../store';
import { setHouse, setHouseError, setHouseLoading } from '../store/slices/houseSlice';
import { setSchedule } from '../store/slices/cookScheduleSlice';
import { setBalances } from '../store/slices/expenseSlice';
import * as houseService from '../services/houseService';
import type { ChoreEntry } from '../services/houseService';
import HouseOnboardingScreen from './HouseOnboardingScreen';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Skeleton,
  useToast,
} from '../components/ui';

const TODAY = new Date().toISOString().slice(0, 10);

const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

function TodaysDutiesCard({
  houseId,
  currentUserId,
  navigation,
}: {
  houseId: string;
  currentUserId: string;
  navigation: any;
}) {
  const c = useThemeColors();
  const toast = useToast();
  const [chores, setChores] = useState<ChoreEntry[]>([]);

  useEffect(() => {
    houseService
      .getChoreSchedule(houseId, { date: TODAY })
      .then(setChores)
      .catch(() => {});
  }, [houseId]);

  const markDone = async (chore: ChoreEntry) => {
    if (chore.user_id !== currentUserId) return;
    try {
      const updated = await houseService.updateChoreEntry(houseId, chore.id, { status: 'done' });
      setChores((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.show('Marked done', 'success');
    } catch {
      toast.show('Could not update', 'error');
    }
  };

  return (
    <Card
      surface="surface"
      radius="xl"
      padding="lg"
      elevation="card"
      onPress={() => navigation.navigate('Chores')}
      style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}
      accessibilityLabel="Open today’s duties"
    >
      <View style={styles.cardHeader}>
        <Text style={[typography.overline, { color: c.textSecondary }]}>Today's duties</Text>
        <Text style={{ fontSize: 13, color: c.primary, fontWeight: '700' }}>View all →</Text>
      </View>
      {chores.length === 0 ? (
        <Text style={[typography.bodySmall, { color: c.textLight, fontStyle: 'italic' }]}>
          No chores scheduled — tap to set up
        </Text>
      ) : (
        chores.map((chore, i) => {
          const isMe = chore.user_id === currentUserId;
          return (
            <View
              key={chore.id}
              style={[
                styles.choreRow,
                {
                  borderTopColor: c.border,
                  borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                  backgroundColor: isMe ? c.primaryMuted : 'transparent',
                  borderRadius: isMe ? 8 : 0,
                  marginHorizontal: isMe ? -spacing.sm : 0,
                  paddingHorizontal: isMe ? spacing.sm : 0,
                },
              ]}
            >
              <Text style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{chore.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: c.text, fontWeight: '700' }]}>
                  {chore.chore_name}
                </Text>
                <Text style={[typography.caption, { color: c.textSecondary, marginTop: 1 }]}>
                  {isMe ? 'Your turn' : chore.assignee_name}
                </Text>
              </View>
              {chore.status === 'done' ? (
                <Text style={{ fontSize: 18 }}>✅</Text>
              ) : isMe ? (
                <Button
                  label="Done"
                  size="sm"
                  onPress={() => markDone(chore)}
                  hapticStyle="medium"
                />
              ) : (
                <Text style={{ fontSize: 18, opacity: 0.4 }}>⏳</Text>
              )}
            </View>
          );
        })
      )}
    </Card>
  );
}

export default function HouseScreen({ navigation }: any) {
  const c = useThemeColors();
  const dispatch = useDispatch();
  const { house, members, isLoading } = useSelector((s: RootState) => s.house);
  const schedule = useSelector((s: RootState) => s.cookSchedule.schedule);
  const { balances } = useSelector((s: RootState) => s.expense);
  const currentUser = useSelector((s: RootState) => s.auth.user);

  const load = useCallback(async () => {
    dispatch(setHouseLoading(true));
    try {
      const data = await houseService.getMyHouse();
      dispatch(setHouse({ house: data.house, members: data.members }));
      if (data.house) {
        const [sched, bal] = await Promise.all([
          houseService.getSchedule(data.house.id, 7),
          houseService.getBalances(data.house.id),
        ]);
        dispatch(setSchedule(sched));
        dispatch(setBalances(bal));
      }
    } catch {
      dispatch(setHouseError('Could not load house data'));
    } finally {
      dispatch(setHouseLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading && !house) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          <Skeleton height={28} width="60%" />
          <Skeleton height={120} radius={20} />
          <Skeleton height={120} radius={20} />
        </View>
      </SafeAreaView>
    );
  }
  if (!house) return <HouseOnboardingScreen />;

  const todayEntry = schedule.find((e) => e.scheduled_date === TODAY);
  const upcoming = schedule.filter((e) => e.scheduled_date > TODAY).slice(0, 5);
  const myBalance = balances.find((b) => b.user_id === currentUser?.id);
  const isMyTurn = todayEntry?.user_id === currentUser?.id;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={c.primary} />}
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h1, { color: c.text }]} numberOfLines={1}>
              {house.name}
            </Text>
            <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
              {members.length} members
            </Text>
          </View>
          <Button
            label="⚙ Manage"
            variant="ghost"
            size="sm"
            onPress={() => navigation.navigate('HouseMembers')}
          />
        </View>

        {/* Today's cook */}
        <Card
          surface="surface"
          radius="xl"
          padding="lg"
          elevation="card"
          bordered
          style={[
            styles.block,
            {
              borderColor: isMyTurn ? c.primary : c.success,
              backgroundColor: isMyTurn ? c.primaryMuted : c.successMuted,
            },
          ]}
        >
          <Text style={[typography.overline, { color: c.textSecondary }]}>Today's cook</Text>
          {todayEntry ? (
            <>
              <Text style={[typography.h3, { color: c.text, marginTop: spacing.xs }]}>
                {isMyTurn
                  ? '👨‍🍳 Your turn to cook!'
                  : `👨‍🍳 ${todayEntry.cook_name} is cooking`}
              </Text>
              {todayEntry.recipe_name ? (
                <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: spacing.xs }]}>
                  {todayEntry.recipe_name}
                </Text>
              ) : isMyTurn ? (
                <Button
                  label="Pick a recipe →"
                  variant="ghost"
                  size="sm"
                  onPress={() => navigation.navigate('CookSchedule')}
                  style={{ marginTop: spacing.xs, paddingHorizontal: 0 }}
                />
              ) : (
                <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: spacing.xs }]}>
                  Recipe not picked yet
                </Text>
              )}
              {isMyTurn && todayEntry.recipe_id ? (
                <Button
                  label="Start cooking"
                  size="md"
                  onPress={() =>
                    navigation.navigate('CookingMode', { recipeId: todayEntry.recipe_id })
                  }
                  hapticStyle="medium"
                  style={{ marginTop: spacing.sm }}
                />
              ) : null}
            </>
          ) : (
            <Text style={[typography.body, { color: c.textSecondary, marginTop: spacing.xs }]}>
              No cook scheduled today
            </Text>
          )}
        </Card>

        <TodaysDutiesCard
          houseId={house.id}
          currentUserId={currentUser?.id ?? ''}
          navigation={navigation}
        />

        {/* Upcoming */}
        <View style={styles.block}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.overline, { color: c.textSecondary }]}>Upcoming</Text>
            <Text
              accessibilityRole="button"
              onPress={() => navigation.navigate('CookSchedule')}
              style={{ fontSize: 13, color: c.primary, fontWeight: '700' }}
            >
              View schedule →
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {upcoming.length === 0 ? (
              <Card
                surface="surfaceMuted"
                radius="md"
                padding="md"
                elevation="flat"
                onPress={() => navigation.navigate('CookSchedule')}
                style={{ borderStyle: 'dashed', borderWidth: 1.5, borderColor: c.borderStrong }}
              >
                <Text style={{ fontSize: 13, color: c.textSecondary }}>+ Generate schedule</Text>
              </Card>
            ) : (
              upcoming.map((entry) => (
                <Card key={entry.id} surface="surface" radius="md" padding="md" elevation="card">
                  <Text style={[typography.caption, { color: c.textSecondary }]}>
                    {formatDate(entry.scheduled_date)}
                  </Text>
                  <Text
                    style={[typography.h4, { color: c.text, marginTop: 2 }]}
                    numberOfLines={1}
                  >
                    {entry.cook_name?.split(' ')[0]}
                  </Text>
                </Card>
              ))
            )}
          </ScrollView>
        </View>

        {/* Members */}
        <View style={styles.block}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.overline, { color: c.textSecondary }]}>Members</Text>
            <Text style={{ fontSize: 13, color: c.primary, fontWeight: '700' }}>
              Code: {house.invite_code}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
            {members.map((m) => (
              <View key={m.user_id} style={{ alignItems: 'center', gap: spacing.xs }}>
                <Avatar name={m.name} size={48} tone="primary" />
                <Text style={[typography.caption, { color: c.textSecondary }]}>
                  {m.name?.split(' ')[0]}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quick links */}
        <View style={[styles.block, { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }]}>
          {[
            { label: '🧹 Chores', screen: 'Chores' },
            { label: '🏆 Leaderboard', screen: 'Leaderboard' },
            { label: '🌍 Passport', screen: 'CuisinePassport' },
            { label: '📊 Report', screen: 'HouseReport' },
            { label: '🍱 Prep', screen: 'PrepMeals' },
          ].map((link) => (
            <Card
              key={link.screen}
              surface="surfaceMuted"
              radius="md"
              padding="sm"
              elevation="flat"
              onPress={() => navigation.navigate(link.screen)}
              accessibilityLabel={link.label}
            >
              <Text style={{ fontSize: 13, color: c.text, fontWeight: '600' }}>
                {link.label}
              </Text>
            </Card>
          ))}
        </View>

        {/* Expenses */}
        <Card
          surface="surface"
          radius="xl"
          padding="lg"
          elevation="card"
          bordered
          style={styles.block}
          onPress={() => navigation.navigate('Expenses')}
        >
          <Text style={[typography.overline, { color: c.textSecondary }]}>Expenses</Text>
          {myBalance !== undefined ? (
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: myBalance.net >= 0 ? c.success : c.error,
                marginTop: spacing.xs,
              }}
            >
              {myBalance.net >= 0
                ? `You are owed ₹${myBalance.net.toFixed(2)}`
                : `You owe ₹${Math.abs(myBalance.net).toFixed(2)}`}
            </Text>
          ) : (
            <Text style={[typography.body, { color: c.textSecondary, marginTop: spacing.xs }]}>
              No expenses yet
            </Text>
          )}
          <Text style={{ fontSize: 13, color: c.primary, fontWeight: '700', marginTop: spacing.sm }}>
            View all →
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  block: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  choreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
