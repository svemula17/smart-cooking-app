// HouseScreen.tsx — restructured for clarity and speed-of-use.
//
// Information architecture (top → bottom):
//   1. HEADER       house identity + member strip + invite/settings icons
//   2. TODAY        Cook · Chores · Balance — each with a primary CTA
//   3. THIS WEEK    cook schedule scroller
//   4. ACTIVITY     latest chat message + latest expense
//   5. MORE         grid of secondary features
//
// Design philosophy: above the fold should answer the user's three
// recurring questions in one glance — "who's cooking?", "what's mine to
// do?", "who owes who?" — with a single tap to act on any of them.

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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../store';
import { setHouse, setHouseError, setHouseLoading } from '../store/slices/houseSlice';
import { setSchedule } from '../store/slices/cookScheduleSlice';
import { setBalances, setExpenses } from '../store/slices/expenseSlice';
import * as houseService from '../services/houseService';
import type { ChoreEntry } from '../services/houseService';
import HouseOnboardingScreen from './HouseOnboardingScreen';
import { getCategoryMeta } from '../utils/expenseCategories';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { radii } from '../theme/radii';
import {
  Avatar,
  Badge,
  Button,
  Card,
  IconButton,
  Skeleton,
  useToast,
} from '../components/ui';

// ─── helpers ─────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10);

const formatDay = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
  });

const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const timeAgo = (iso: string): string => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

// ─── chat preview hook ───────────────────────────────────────────────────────
// Reads the *last* message from the local chat log (HouseChatScreen
// persists per-house under `house-chat:<id>`). Cheap one-shot read on
// mount + refresh.

interface ChatPreview {
  text: string;
  userName: string;
  createdAt: number;
}

function useLatestChat(houseId: string | undefined) {
  const [preview, setPreview] = useState<ChatPreview | null>(null);
  useEffect(() => {
    if (!houseId) return;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(`house-chat:${houseId}`);
        if (!raw) return;
        const msgs = JSON.parse(raw) as ChatPreview[];
        if (msgs.length > 0) setPreview(msgs[msgs.length - 1]);
      } catch {
        /* ignore — preview is best-effort */
      }
    })();
  }, [houseId]);
  return preview;
}

// ─── Today's chore mini-card (just my chore for today) ───────────────────────

function MyChoreToday({
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
  const [mine, setMine] = useState<ChoreEntry | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    houseService
      .getChoreSchedule(houseId, { date: TODAY })
      .then((all) => {
        const m = all.find((ch) => ch.user_id === currentUserId && ch.status !== 'done');
        setMine(m ?? null);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [houseId, currentUserId]);

  const markDone = async () => {
    if (!mine) return;
    try {
      await houseService.updateChoreEntry(houseId, mine.id, { status: 'done' });
      setMine(null);
      toast.show('Chore done — nice', 'success');
    } catch {
      toast.show('Could not update', 'error');
    }
  };

  if (!loaded) return null;

  if (!mine) {
    return (
      <View style={styles.todayLane}>
        <Text style={styles.todayLaneEmoji}>🧹</Text>
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodySmall, { color: c.textSecondary, fontWeight: '600' }]}>
            Your chores
          </Text>
          <Text style={[typography.body, { color: c.text, fontWeight: '700', marginTop: 2 }]}>
            All clear for today
          </Text>
        </View>
        <Text
          accessibilityRole="button"
          onPress={() => navigation.navigate('Chores')}
          style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}
        >
          View
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.todayLane}>
      <Text style={styles.todayLaneEmoji}>{mine.emoji ?? '🧹'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodySmall, { color: c.textSecondary, fontWeight: '600' }]}>
          Your chore today
        </Text>
        <Text
          style={[typography.body, { color: c.text, fontWeight: '700', marginTop: 2 }]}
          numberOfLines={1}
        >
          {mine.chore_name ?? 'Pending chore'}
        </Text>
      </View>
      <Button label="Done" size="sm" onPress={markDone} hapticStyle="medium" />
    </View>
  );
}

// ─── screen ──────────────────────────────────────────────────────────────────

export default function HouseScreen({ navigation }: any) {
  const c = useThemeColors();
  const dispatch = useDispatch();
  const { house, members, isLoading } = useSelector((s: RootState) => s.house);
  const schedule = useSelector((s: RootState) => s.cookSchedule.schedule);
  const { balances, expenses } = useSelector((s: RootState) => s.expense);
  const currentUser = useSelector((s: RootState) => s.auth.user);

  const load = useCallback(async () => {
    dispatch(setHouseLoading(true));
    try {
      const data = await houseService.getMyHouse();
      dispatch(setHouse({ house: data.house, members: data.members }));
      if (data.house) {
        const [sched, bal, exp] = await Promise.all([
          houseService.getSchedule(data.house.id, 7),
          houseService.getBalances(data.house.id),
          houseService.listExpenses(data.house.id, 1).catch(() => null),
        ]);
        dispatch(setSchedule(sched));
        dispatch(setBalances(bal));
        if (exp) {
          dispatch(
            setExpenses({
              expenses: exp.expenses,
              total: exp.pagination.total,
              page: 1,
            }),
          );
        }
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

  const latestChat = useLatestChat(house?.id);

  if (isLoading && !house) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          <Skeleton height={28} width="60%" />
          <Skeleton height={160} radius={20} />
          <Skeleton height={120} radius={20} />
        </View>
      </SafeAreaView>
    );
  }
  if (!house) return <HouseOnboardingScreen />;

  const todayEntry = schedule.find((e) => e.scheduled_date === TODAY);
  const upcoming = schedule.filter((e) => e.scheduled_date > TODAY).slice(0, 4);
  const myBalance = balances.find((b) => b.user_id === currentUser?.id);
  const isMyTurn = todayEntry?.user_id === currentUser?.id;
  const recentExpense = expenses[0];

  const shareInvite = async () => {
    try {
      await Share.share({
        message: `Join my house "${house.name}" on SmartCooking. Invite code: ${house.invite_code}`,
      });
    } catch {
      /* user dismissed */
    }
  };

  // ─── lane 1: cook ──────────────────────────────────────────────────────────
  const cookLane = (
    <View style={styles.todayLane}>
      <Text style={styles.todayLaneEmoji}>👨‍🍳</Text>
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodySmall, { color: c.textSecondary, fontWeight: '600' }]}>
          Cook tonight
        </Text>
        <Text
          style={[typography.body, { color: c.text, fontWeight: '700', marginTop: 2 }]}
          numberOfLines={1}
        >
          {todayEntry
            ? isMyTurn
              ? 'You — your turn'
              : todayEntry.cook_name?.split(' ')[0] ?? 'Someone'
            : 'No cook scheduled'}
        </Text>
        {todayEntry?.recipe_name ? (
          <Text style={[typography.caption, { color: c.textSecondary }]} numberOfLines={1}>
            {todayEntry.recipe_name}
          </Text>
        ) : null}
      </View>
      {todayEntry && isMyTurn && todayEntry.recipe_id ? (
        <Button
          label="Cook"
          size="sm"
          onPress={() =>
            navigation.navigate('CookingMode', { recipeId: todayEntry.recipe_id })
          }
          hapticStyle="medium"
        />
      ) : todayEntry && isMyTurn ? (
        <Button
          label="Pick"
          size="sm"
          variant="secondary"
          onPress={() => navigation.navigate('CookSchedule')}
        />
      ) : (
        <Text
          accessibilityRole="button"
          onPress={() => navigation.navigate('CookSchedule')}
          style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}
        >
          View
        </Text>
      )}
    </View>
  );

  // ─── lane 3: balance ───────────────────────────────────────────────────────
  const balanceLane = (
    <View style={styles.todayLane}>
      <Text style={styles.todayLaneEmoji}>💸</Text>
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodySmall, { color: c.textSecondary, fontWeight: '600' }]}>
          Money
        </Text>
        <Text
          style={{
            color:
              !myBalance || myBalance.net === 0
                ? c.text
                : myBalance.net > 0
                ? c.success
                : c.error,
            fontSize: 16,
            fontWeight: '800',
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {!myBalance || myBalance.net === 0
            ? 'All settled'
            : myBalance.net > 0
            ? `Owed ₹${myBalance.net.toFixed(0)}`
            : `You owe ₹${Math.abs(myBalance.net).toFixed(0)}`}
        </Text>
      </View>
      <Button
        label="Add"
        size="sm"
        variant="secondary"
        onPress={() => navigation.navigate('AddExpense')}
      />
    </View>
  );

  // ─── more grid ─────────────────────────────────────────────────────────────
  const moreLinks: { label: string; emoji: string; screen: string }[] = [
    { label: 'Chores',     emoji: '🧹', screen: 'Chores' },
    { label: 'Expenses',   emoji: '💸', screen: 'Expenses' },
    { label: 'Members',    emoji: '👥', screen: 'HouseMembers' },
    { label: 'Leaderboard',emoji: '🏆', screen: 'Leaderboard' },
    { label: 'Passport',   emoji: '🌍', screen: 'CuisinePassport' },
    { label: 'Report',     emoji: '📊', screen: 'HouseReport' },
    { label: 'Meal prep',  emoji: '🍱', screen: 'PrepMeals' },
    { label: 'Schedule',   emoji: '📅', screen: 'CookSchedule' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={c.primary} />
        }
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h1, { color: c.text }]} numberOfLines={1}>
              {house.name}
            </Text>
            <View style={styles.memberStrip}>
              {members.slice(0, 4).map((m, i) => (
                <View
                  key={m.user_id}
                  style={{
                    marginLeft: i === 0 ? 0 : -10,
                    borderWidth: 2,
                    borderColor: c.background,
                    borderRadius: 999,
                  }}
                >
                  <Avatar name={m.name} size={26} tone="primary" />
                </View>
              ))}
              {members.length > 4 ? (
                <View
                  style={[
                    styles.memberMore,
                    { backgroundColor: c.surfaceMuted, borderColor: c.background },
                  ]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: c.textSecondary }}>
                    +{members.length - 4}
                  </Text>
                </View>
              ) : null}
              <Text style={[typography.caption, { color: c.textSecondary, marginLeft: spacing.sm }]}>
                {members.length} member{members.length === 1 ? '' : 's'}
              </Text>
            </View>
          </View>
          <IconButton
            icon="↗"
            size={40}
            accessibilityLabel="Share invite code"
            onPress={shareInvite}
          />
          <IconButton
            icon="⚙"
            size={40}
            accessibilityLabel="Manage members"
            onPress={() => navigation.navigate('HouseMembers')}
          />
        </View>

        {/* ─── TODAY hero ──────────────────────────────────────────────── */}
        <Card
          surface="surface"
          radius="2xl"
          padding="lg"
          elevation="card"
          bordered
          style={[
            styles.block,
            isMyTurn ? { borderColor: c.primary, backgroundColor: c.primaryMuted } : undefined,
          ]}
        >
          <View style={styles.todayHeader}>
            <Text style={[typography.overline, { color: c.textSecondary }]}>Today</Text>
            {isMyTurn ? <Badge label="Your turn to cook" tone="primary" /> : null}
          </View>
          {cookLane}
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          {currentUser?.id ? (
            <MyChoreToday
              houseId={house.id}
              currentUserId={currentUser.id}
              navigation={navigation}
            />
          ) : null}
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          {balanceLane}
        </Card>

        {/* ─── THIS WEEK — cook scroller ───────────────────────────────── */}
        <View style={styles.block}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.overline, { color: c.textSecondary }]}>This week</Text>
            <Text
              accessibilityRole="button"
              onPress={() => navigation.navigate('CookSchedule')}
              style={{ fontSize: 13, color: c.primary, fontWeight: '700' }}
            >
              Full schedule →
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm }}
          >
            {upcoming.length === 0 ? (
              <Card
                surface="surfaceMuted"
                radius="lg"
                padding="md"
                elevation="flat"
                onPress={() => navigation.navigate('CookSchedule')}
                style={{ borderStyle: 'dashed', borderWidth: 1.5, borderColor: c.borderStrong }}
              >
                <Text style={{ fontSize: 13, color: c.textSecondary }}>+ Generate schedule</Text>
              </Card>
            ) : (
              upcoming.map((entry) => {
                const mineUpcoming = entry.user_id === currentUser?.id;
                return (
                  <Card
                    key={entry.id}
                    surface="surface"
                    radius="lg"
                    padding="md"
                    elevation="card"
                    bordered
                    style={
                      mineUpcoming
                        ? { borderColor: c.primary, backgroundColor: c.primaryMuted, minWidth: 110 }
                        : { minWidth: 110 }
                    }
                  >
                    <Text style={[typography.caption, { color: c.textSecondary, fontWeight: '700' }]}>
                      {formatDay(entry.scheduled_date).toUpperCase()}
                    </Text>
                    <Text style={[typography.bodySmall, { color: c.textSecondary }]}>
                      {formatDate(entry.scheduled_date)}
                    </Text>
                    <Text
                      style={[typography.h4, { color: c.text, marginTop: spacing.xs }]}
                      numberOfLines={1}
                    >
                      {mineUpcoming ? 'You' : entry.cook_name?.split(' ')[0]}
                    </Text>
                    {entry.recipe_name ? (
                      <Text
                        style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}
                        numberOfLines={1}
                      >
                        {entry.recipe_name}
                      </Text>
                    ) : null}
                  </Card>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* ─── ACTIVITY ─────────────────────────────────────────────────── */}
        <View style={styles.block}>
          <Text style={[typography.overline, { color: c.textSecondary, marginBottom: spacing.sm }]}>
            Recent
          </Text>
          {/* Chat preview */}
          <Card
            surface="surface"
            radius="xl"
            padding="md"
            elevation="card"
            bordered
            onPress={() => navigation.navigate('HouseChat')}
            style={{ marginBottom: spacing.sm }}
            accessibilityLabel="Open house chat"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Text style={{ fontSize: 24 }}>💬</Text>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodySmall, { color: c.textSecondary, fontWeight: '600' }]}>
                  {latestChat ? `${latestChat.userName} · ${timeAgo(new Date(latestChat.createdAt).toISOString())}` : 'House chat'}
                </Text>
                <Text
                  style={[typography.body, { color: c.text, fontWeight: '600', marginTop: 2 }]}
                  numberOfLines={1}
                >
                  {latestChat?.text ?? 'No messages yet — start the conversation'}
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: c.textLight }}>›</Text>
            </View>
          </Card>
          {/* Recent expense */}
          {recentExpense ? (
            <Card
              surface="surface"
              radius="xl"
              padding="md"
              elevation="card"
              bordered
              onPress={() => navigation.navigate('Expenses')}
              accessibilityLabel="View expenses"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Text style={{ fontSize: 24 }}>{getCategoryMeta(recentExpense.category).emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodySmall, { color: c.textSecondary, fontWeight: '600' }]}>
                    {recentExpense.paid_by_name ?? 'Someone'} · {timeAgo(recentExpense.created_at)}
                  </Text>
                  <Text
                    style={[typography.body, { color: c.text, fontWeight: '600', marginTop: 2 }]}
                    numberOfLines={1}
                  >
                    {recentExpense.description}
                  </Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: c.text }}>
                  ₹{parseFloat(recentExpense.amount as any).toFixed(0)}
                </Text>
              </View>
            </Card>
          ) : null}
        </View>

        {/* ─── MORE — secondary actions in a compact grid ──────────────── */}
        <View style={styles.block}>
          <Text style={[typography.overline, { color: c.textSecondary, marginBottom: spacing.sm }]}>
            More
          </Text>
          <View style={styles.moreGrid}>
            {moreLinks.map((link) => (
              <Card
                key={link.screen}
                surface="surfaceMuted"
                radius="lg"
                padding="md"
                elevation="flat"
                onPress={() => navigation.navigate(link.screen)}
                accessibilityLabel={link.label}
                style={styles.moreTile}
              >
                <Text style={{ fontSize: 22 }}>{link.emoji}</Text>
                <Text style={[typography.bodySmall, { color: c.text, fontWeight: '700', marginTop: spacing.xs }]}>
                  {link.label}
                </Text>
              </Card>
            ))}
          </View>
        </View>
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
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  memberStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  memberMore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  block: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  todayLane: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  todayLaneEmoji: { fontSize: 26, width: 32, textAlign: 'center' },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
  },
  moreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moreTile: {
    width: '31%',
    minHeight: 80,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});
