import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { RootStackParamList } from '../types';
import { RootState } from '../store';
import type { CookScheduleEntry } from '../services/houseService';
import AttendanceSheet from './AttendanceSheet';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Avatar, Badge, Card, IconButton } from '../components/ui';
import { CuisineCard } from '../components/CuisineCard';

type HomeNav = NativeStackNavigationProp<RootStackParamList>;

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
  const stroke = 8;
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
  const isDark = useSelector((s: RootState) => s.settings.isDark);

  const user = useSelector((s: RootState) => s.auth.user);
  const preferences = useSelector((s: RootState) => s.user.preferences);
  const macroProgress = useSelector((s: RootState) => s.user.macroProgress);
  const pantryItems = useSelector((s: RootState) => s.pantry.items);
  const house = useSelector((s: RootState) => s.house.house);
  const schedule = useSelector((s: RootState) => s.cookSchedule.schedule);
  const attendance = useSelector((s: RootState) => s.attendance);

  const [showAttendance, setShowAttendance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayEntry: CookScheduleEntry | undefined = schedule.find(
    (e) => e.scheduled_date === todayISO
  );
  const isMyTurn = todayEntry?.user_id === user?.id;
  const hasRespondedToday = attendance.myResponse !== null;

  const userName = user?.name ? user.name.split(' ')[0] : 'Chef';
  const pantryCount = pantryItems.length;
  const expiringSoon = pantryItems.filter((item) => {
    if (!item.expiry_date) return false;
    const ms = new Date(item.expiry_date).getTime() - Date.now();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 3;
  });
  const urgentCount = expiringSoon.length;

  const goals = {
    calories: preferences?.calories_goal ?? 2000,
    protein: preferences?.protein_goal ?? 150,
    carbs: preferences?.carbs_goal ?? 250,
    fat: preferences?.fat_goal ?? 65,
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
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
            style={[styles.block, { borderColor: c.info, backgroundColor: c.infoMuted }]}
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
                icon="›"
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
              trackColor={c.surfaceMuted}
            />
            <GoalRing
              label="Protein"
              emoji="💪"
              current={macroProgress.protein}
              goal={goals.protein}
              color={c.protein}
              trackColor={c.surfaceMuted}
            />
            <GoalRing
              label="Carbs"
              emoji="🌾"
              current={macroProgress.carbs}
              goal={goals.carbs}
              color={c.carbs}
              trackColor={c.surfaceMuted}
            />
            <GoalRing
              label="Fat"
              emoji="🫒"
              current={macroProgress.fat}
              goal={goals.fat}
              color={c.fat}
              trackColor={c.surfaceMuted}
            />
          </View>
        </Card>

        {/* 3 rectangle sections — horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rectRow}
          decelerationRate="fast"
          snapToInterval={284} // card width 268 + gap 16
          snapToAlignment="start"
        >
          {/* 1) Use first tonight — expiring pantry items */}
          <Card
            surface="surface"
            radius="xl"
            elevation="card"
            padding="lg"
            style={styles.rectCard}
            onPress={() =>
              navigation.navigate('RecipeBrowser', {
                cuisine: 'all',
                intent: 'use-soon',
              } as any)
            }
            accessibilityLabel="Use first tonight"
          >
            <View style={styles.rectHeader}>
              <Text style={styles.bigEmoji}>⏳</Text>
              <Text style={[typography.h4, { color: c.text }]}>Use first tonight</Text>
            </View>
            {expiringSoon.length > 0 ? (
              <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
                {expiringSoon.slice(0, 3).map((item) => (
                  <View key={item.id} style={styles.useRow}>
                    <View style={[styles.dot, { backgroundColor: c.warning }]} />
                    <Text
                      style={[typography.bodySmall, { color: c.text, flex: 1, fontWeight: '600' }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: spacing.sm }]}>
                Nothing expiring soon.
              </Text>
            )}
            <Text style={[styles.rectCta, { color: c.primary }]}>
              {expiringSoon.length > 0 ? 'Find a dinner →' : 'Add pantry items →'}
            </Text>
          </Card>

          {/* 2) Today in the house — cook, cleaner, dish */}
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
                  ? { borderColor: c.success, backgroundColor: c.successMuted }
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
              onPress={() => navigation.navigate('HouseOnboarding' as any)}
              accessibilityLabel="Set up your house"
            >
              <View style={styles.rectHeader}>
                <Text style={styles.bigEmoji}>🏡</Text>
                <Text style={[typography.h4, { color: c.text }]}>Set up your house</Text>
              </View>
              <Text style={[typography.bodySmall, { color: c.textSecondary, marginTop: spacing.sm }]}>
                Share cooking, cleaning, and shopping with roommates.
              </Text>
              <Text style={[styles.rectCta, { color: c.primary }]}>Get started →</Text>
            </Card>
          )}

          {/* 3) Pantry quick picks */}
          <Card
            surface="surface"
            radius="xl"
            elevation="card"
            padding="lg"
            style={styles.rectCard}
            onPress={() => navigation.navigate('Pantry' as any)}
            accessibilityLabel="Open pantry"
          >
            <View style={styles.rectHeader}>
              <Text style={styles.bigEmoji}>🥫</Text>
              <Text style={[typography.h4, { color: c.text }]}>Your pantry</Text>
            </View>
            <View style={styles.pantryStatsRow}>
              <View style={styles.pantryStat}>
                <Text style={[typography.h2, { color: c.text }]}>{pantryCount}</Text>
                <Text style={[typography.caption, { color: c.textSecondary, fontWeight: '600' }]}>
                  In pantry
                </Text>
              </View>
              <View style={styles.pantryStat}>
                <Text style={[typography.h2, { color: urgentCount > 0 ? c.warning : c.text }]}>
                  {urgentCount}
                </Text>
                <Text style={[typography.caption, { color: c.textSecondary, fontWeight: '600' }]}>
                  Use soon
                </Text>
              </View>
            </View>
            <Text style={[styles.rectCta, { color: c.primary }]}>Manage pantry →</Text>
          </Card>
        </ScrollView>

        {/* Cuisines */}
        <SectionHeader
          title="Cook by cuisine"
          subtitle="Browse what you’re craving tonight."
        />
        <View style={styles.cuisineGrid}>
          {CUISINES.map((item) => (
            <CuisineCard
              key={item.cuisine}
              cuisine={item.cuisine}
              emoji={item.emoji}
              color={(c as any)[item.cuisine.toLowerCase().replace('-', '')] ?? c.surfaceMuted}
              onPress={() => navigation.navigate('RecipeBrowser', { cuisine: item.cuisine })}
            />
          ))}
        </View>
        <Text
          accessibilityRole="button"
          onPress={() => navigation.navigate('RecipeBrowser', { cuisine: 'all' })}
          style={[
            typography.button,
            { color: c.primary, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
          ]}
        >
          Browse all cuisines and dishes →
        </Text>

      </ScrollView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  block: { marginHorizontal: spacing.xl, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bigEmoji: { fontSize: 22 },
  miniEmoji: { fontSize: 14, width: 18, textAlign: 'center' },
  ringRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  rectRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  rectCard: {
    width: 268,
    minHeight: 168,
    marginBottom: spacing.sm,
  },
  rectHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rectCta: {
    fontWeight: '700',
    fontSize: 13,
    marginTop: spacing.md,
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
  cuisineGrid: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default HomeScreen;
