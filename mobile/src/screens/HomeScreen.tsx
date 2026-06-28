import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ThemedStatusBar } from "../components/ThemedStatusBar";
import {
  Animated,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';

import type { AppNavigation, MealType } from '../types';
import { RootState, type AppDispatch, setPreferences } from '../store';
import { userService } from '../services/userService';
import { scheduleCookReminders } from '../services/reminderService';
import type { CookScheduleEntry } from '../services/houseService';
import AttendanceSheet from './AttendanceSheet';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Avatar, Badge, Card, Chip, Icon, IconButton } from '../components/ui';
import { CuisineCard } from '../components/CuisineCard';

type HomeNav = AppNavigation;

const CUISINES = [
  { cuisine: 'Indian', emoji: '🍛' },
  { cuisine: 'Chinese', emoji: '🥢' },
  { cuisine: 'Indo-Chinese', emoji: '🍜' },
  { cuisine: 'Italian', emoji: '🍝' },
  { cuisine: 'Mexican', emoji: '🌮' },
  { cuisine: 'Thai', emoji: '🍲' },
  { cuisine: 'Japanese', emoji: '🍱' },
  { cuisine: 'Mediterranean', emoji: '🫒' },
];

const MEALS: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

interface RingProps {
  label: string;
  emoji: string;
  current: number;
  goal: number;
  color: string;
  trackColor: string;
  size?: number;
}

function GoalRing({ label, emoji, current, goal, color, trackColor, size = 56 }: RingProps) {
  const c = useThemeColors();
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(current / goal, 1) : 0;
  const dash = circumference * pct;
  const cx = size / 2;

  return (
    <View
      style={{ alignItems: 'center', flex: 1 }}
      accessibilityLabel={`${label}: ${Math.round(pct * 100)} percent of goal`}
    >
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cx} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
          <Circle
            cx={cx}
            cy={cx}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${cx},${cx}`}
          />
        </Svg>
        <View style={StyleSheet.absoluteFill as any}>
          <View style={ringCenter}>
            <Text style={{ fontSize: 11, fontWeight: '800', color }}>
              {Math.round(pct * 100)}%
            </Text>
          </View>
        </View>
      </View>
      <Text
        style={[typography.caption, { color: c.textSecondary, marginTop: 2, fontWeight: '600', fontSize: 10 }]}
      >
        {label}
      </Text>
    </View>
  );
}

const ringCenter = {
  flex: 1,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNav>();
  const c = useThemeColors();
  const dispatch = useDispatch<AppDispatch>();
  const isDark = useSelector((s: RootState) => s.settings.isDark);

  const user = useSelector((s: RootState) => s.auth.user);
  const preferences = useSelector((s: RootState) => s.user.preferences);
  const macroProgress = useSelector((s: RootState) => s.user.macroProgress);
  const pantryItems = useSelector((s: RootState) => s.pantry.items);
  const house = useSelector((s: RootState) => s.house.house);
  const schedule = useSelector((s: RootState) => s.cookSchedule.schedule);
  const attendance = useSelector((s: RootState) => s.attendance);
  const cookReminders = useSelector((s: RootState) => s.settings.cookReminders);

  const [showAttendance, setShowAttendance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Optional meal-type filter; when set, tapping a cuisine opens it filtered.
  const [meal, setMeal] = useState<MealType | undefined>(undefined);

  // Auto-scrolling carousel for the 3 quick-action cards. Stops once the user
  // takes over by dragging.
  const stripRef = useRef<ScrollView>(null);
  const stripTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stripIdx = useRef(0);
  const STRIP_STEP = 284; // card width 268 + gap 16
  const STRIP_COUNT = 3;
  useEffect(() => {
    stripTimer.current = setInterval(() => {
      stripIdx.current = (stripIdx.current + 1) % STRIP_COUNT;
      stripRef.current?.scrollTo({ x: stripIdx.current * STRIP_STEP, animated: true });
    }, 3500);
    return () => {
      if (stripTimer.current) clearInterval(stripTimer.current);
    };
  }, []);
  const stopAutoScroll = useCallback(() => {
    if (stripTimer.current) {
      clearInterval(stripTimer.current);
      stripTimer.current = null;
    }
  }, []);

  // Schedule the morning-of cook nudge + prep reminders whenever the schedule,
  // the signed-in user, or the toggle changes. Idempotent (clears + reschedules).
  useEffect(() => {
    scheduleCookReminders(schedule, user?.id, cookReminders).catch(() => {});
  }, [schedule, user?.id, cookReminders]);

  // Gentle entrance for the Chef-AI FAB.
  const fabIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(fabIn, {
      toValue: 1,
      delay: 350,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  }, [fabIn]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // Load macro goals into the store on entry so the rings reflect real goals
  // (preferences aren't otherwise fetched until you open Profile).
  useEffect(() => {
    if (!user) return;
    userService
      .getPreferences()
      .then((p) => p && dispatch(setPreferences(p)))
      .catch(() => {});
  }, [user, dispatch]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayEntry: CookScheduleEntry | undefined = schedule.find(
    (e) => e.scheduled_date === todayISO
  );
  const isMyTurn = todayEntry?.user_id === user?.id;
  const hasRespondedToday = attendance.myResponse !== null;

  const userName = user?.name ? user.name.split(' ')[0] : 'Chef';
  const pantryCount = pantryItems.length;

  const goals = {
    calories: preferences?.calories_goal ?? 2000,
    protein: preferences?.protein_goal ?? 150,
    carbs: preferences?.carbs_goal ?? 250,
    fat: preferences?.fat_goal ?? 65,
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ThemedStatusBar />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
        }
      >
        {/* Greeting header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.label, { color: c.textSecondary }]}>{greeting()}</Text>
            <Text style={[typography.h1, { color: c.text, marginTop: 2 }]} numberOfLines={1}>
              {userName} 👋
            </Text>
          </View>
          <IconButton
            icon={<Icon name="search" size={20} />}
            accessibilityLabel="Search recipes"
            onPress={() => navigation.navigate('Search')}
            size={40}
            style={{ marginRight: spacing.xs }}
          />
          <Avatar name={user?.name} size={44} tone="primary" />
        </View>

        {/* Attendance prompt — sticky-ish, persists until answered */}
        {house && todayEntry && !hasRespondedToday ? (
          <Card
            onPress={() => setShowAttendance(true)}
            surface="surface"
            radius="xl"
            elevation="card"
            bordered
            accessibilityLabel="Respond to dinner attendance"
            style={[styles.block, { borderColor: c.borderStrong, backgroundColor: c.surfaceMuted }]}
          >
            <View style={styles.row}>
              <Text style={styles.bigEmoji}>🍽️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[typography.h4, { color: c.text }]}>Are you eating tonight?</Text>
                <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: 2 }]}>
                  {attendance.summary.attending} eating · {attendance.summary.pending} pending
                </Text>
              </View>
              <IconButton
                icon={<Icon name="chevron-right" size={20} />}
                accessibilityLabel="Open attendance sheet"
                onPress={() => setShowAttendance(true)}
                size={32}
              />
            </View>
          </Card>
        ) : null}

        {/* Daily goals — compact */}
        <Card surface="surface" radius="xl" elevation="card" padding="md" style={styles.block}>
          <View style={styles.ringRow}>
            <GoalRing
              label="Calories"
              emoji="🔥"
              current={macroProgress.calories}
              goal={goals.calories}
              color={c.calories}
              trackColor={`${c.calories}26`}
            />
            <GoalRing
              label="Protein"
              emoji="💪"
              current={macroProgress.protein}
              goal={goals.protein}
              color={c.protein}
              trackColor={`${c.protein}26`}
            />
            <GoalRing
              label="Carbs"
              emoji="🌾"
              current={macroProgress.carbs}
              goal={goals.carbs}
              color={c.carbs}
              trackColor={`${c.carbs}26`}
            />
            <GoalRing
              label="Fat"
              emoji="🫒"
              current={macroProgress.fat}
              goal={goals.fat}
              color={c.fat}
              trackColor={`${c.fat}26`}
            />
          </View>
        </Card>

        {/* 3 quick-action cards — auto-scrolling carousel */}
        <ScrollView
          ref={stripRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rectRow}
          decelerationRate="fast"
          snapToInterval={STRIP_STEP}
          snapToAlignment="start"
          onScrollBeginDrag={stopAutoScroll}
        >
          {/* What can I make now? — AI-style pantry matcher */}
          <Card
            surface="surface"
            radius="xl"
            elevation="card"
            padding="lg"
            bordered
            style={[styles.rectCard, { borderColor: c.primary, backgroundColor: c.primaryMuted }]}
            onPress={() => navigation.navigate('MakeNow')}
            accessibilityLabel="What can I make right now"
          >
            <View style={styles.rectHeader}>
              <Text style={styles.bigEmoji}>✨</Text>
              <Text style={[typography.h4, { color: c.text }]}>What can I make?</Text>
            </View>
            <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: spacing.xs }]}>
              {pantryCount === 0
                ? 'Add pantry items to see dishes you can cook right now.'
                : `Match ${pantryCount} pantry items against every recipe to find dinners you can make tonight.`}
            </Text>
            <Text style={[styles.rectCta, { color: c.primary, marginTop: spacing.sm }]}>
              Find recipes →
            </Text>
          </Card>

          {/* Today in the house — cook, cleaner, dish */}
          {house ? (
            <Card
              surface="surface"
              radius="xl"
              elevation="card"
              padding="lg"
              bordered
              style={[
                styles.rectCard,
                isMyTurn
                  ? { borderColor: c.primary, backgroundColor: c.primaryMuted }
                  : todayEntry
                  ? { borderColor: c.borderStrong, backgroundColor: c.surfaceMuted }
                  : undefined,
              ]}
              onPress={() => navigation.navigate('House' as any)}
              accessibilityLabel="Today in the house"
            >
              <View style={styles.rectHeader}>
                <Text style={styles.bigEmoji}>🏡</Text>
                <Text style={[typography.h4, { color: c.text }]}>Today in the house</Text>
              </View>
              <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
                <View style={styles.useRow}>
                  <Text style={styles.miniEmoji}>👨‍🍳</Text>
                  <Text
                    style={[typography.bodySmall, { color: c.text, flex: 1, fontWeight: '600' }]}
                    numberOfLines={1}
                  >
                    {isMyTurn
                      ? 'You — your turn'
                      : todayEntry?.cook_name?.split(' ')[0] ?? 'No cook set'}
                  </Text>
                </View>
                <View style={styles.useRow}>
                  <Text style={styles.miniEmoji}>🍽️</Text>
                  <Text
                    style={[typography.bodySmall, { color: c.text, flex: 1, fontWeight: '600' }]}
                    numberOfLines={1}
                  >
                    {todayEntry?.recipe_name ?? 'Dish TBD'}
                  </Text>
                </View>
                <View style={styles.useRow}>
                  <Text style={styles.miniEmoji}>🧹</Text>
                  <Text
                    style={[typography.bodySmall, { color: c.text, flex: 1, fontWeight: '600' }]}
                    numberOfLines={1}
                  >
                    Tap to view chores
                  </Text>
                </View>
              </View>
              {isMyTurn ? (
                <View style={{ marginTop: spacing.sm }}>
                  <Badge label="Your turn" tone="primary" />
                </View>
              ) : null}
            </Card>
          ) : (
            <Card
              surface="surfaceMuted"
              radius="xl"
              padding="lg"
              elevation="flat"
              style={styles.rectCard}
              // HouseOnboarding isn't a registered route — it renders inside
              // HouseScreen when the user has no house. Just open the House tab.
              onPress={() => navigation.navigate('House')}
              accessibilityLabel="Set up your house"
            >
              <View style={styles.rectHeader}>
                <Text style={styles.bigEmoji}>🏡</Text>
                <Text style={[typography.h4, { color: c.text }]}>Set up your house</Text>
              </View>
              <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: spacing.sm }]}>
                Share cooking, cleaning, and house duties with roommates.
              </Text>
              <Text style={[styles.rectCta, { color: c.primary }]}>Get started →</Text>
            </Card>
          )}

          {/* Plan your week — meal planner (moved out of the tab bar) */}
          <Card
            surface="surface"
            radius="xl"
            elevation="card"
            padding="lg"
            style={styles.rectCard}
            onPress={() => navigation.navigate('MealPlanner')}
            accessibilityLabel="Plan your meals"
          >
            <View style={styles.rectHeader}>
              <Text style={styles.bigEmoji}>🗓️</Text>
              <Text style={[typography.h4, { color: c.text }]}>Plan your week</Text>
            </View>
            <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: spacing.xs }]}>
              Schedule meals for the next 7 days, then build a shopping list in one tap.
            </Text>
            <Text style={[styles.rectCta, { color: c.primary, marginTop: spacing.sm }]}>
              Open meal plan →
            </Text>
          </Card>
        </ScrollView>

        {/* Cuisines */}
        <SectionHeader
          title="Cook by cuisine"
          subtitle={meal ? `Pick a cuisine for ${meal}.` : undefined}
        />
        {/* Meal-type filter — pick one, then tap a cuisine to see those dishes */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mealRow}
        >
          {MEALS.map((m) => (
            <Chip
              key={m.key}
              label={m.label}
              selected={meal === m.key}
              onPress={() => setMeal((curr) => (curr === m.key ? undefined : m.key))}
            />
          ))}
        </ScrollView>
        <View style={styles.cuisineGrid}>
          {CUISINES.map((item) => (
            <CuisineCard
              key={item.cuisine}
              cuisine={item.cuisine}
              emoji={item.emoji}
              color={(c as any)[item.cuisine.toLowerCase().replace('-', '')] ?? c.surfaceMuted}
              onPress={() =>
                navigation.navigate('RecipeBrowser', { cuisine: item.cuisine, mealType: meal })
              }
            />
          ))}
        </View>
        <Text
          accessibilityRole="button"
          onPress={() => navigation.navigate('RecipeBrowser', { cuisine: 'all', mealType: meal })}
          style={[
            typography.button,
            { color: c.primary, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
          ]}
        >
          Browse all cuisines and dishes →
        </Text>

      </ScrollView>

      {/* Chef AI floating action button — was a tab, demoted to FAB on Home */}
      <Animated.View
        style={[
          styles.aiFabWrap,
          {
            opacity: fabIn,
            transform: [
              { scale: fabIn.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
            ],
          },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open Chef AI assistant"
          onPress={() => navigation.navigate('AIChat')}
          activeOpacity={0.85}
          style={[styles.aiFab, { backgroundColor: c.primary, shadowColor: '#000' }]}
        >
          <Text style={styles.aiFabEmoji}>🧑‍🍳</Text>
        </TouchableOpacity>
      </Animated.View>

      <AttendanceSheet visible={showAttendance} onClose={() => setShowAttendance(false)} />
    </SafeAreaView>
  );
};

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const c = useThemeColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[typography.h3, { color: c.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: spacing['4xl'] },
  aiFabWrap: {
    position: 'absolute',
    right: spacing.lg,
    // Sits above the bottom tab bar (~56pt) + a margin
    bottom: 80,
  },
  aiFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  aiFabEmoji: { fontSize: 26 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  block: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bigEmoji: { fontSize: 22 },
  miniEmoji: { fontSize: 14, width: 18, textAlign: 'center' },
  ringRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  rectRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  rectCard: {
    width: 268,
    minHeight: 124,
    marginBottom: spacing.sm,
  },
  rectHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rectCta: {
    fontWeight: '700',
    fontSize: 13,
    marginTop: spacing.sm,
  },
  pantryStatsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  pantryStat: { flex: 1 },
  useRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  mealRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  cuisineGrid: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default HomeScreen;
