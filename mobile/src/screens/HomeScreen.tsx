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
import { radii } from '../theme/radii';
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
  { cuisine: 'Thai', emoji: '🍜' },
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

function GoalRing({ label, emoji, current, goal, color, trackColor, size = 76 }: RingProps) {
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
            <Text style={{ fontSize: 18 }}>{emoji}</Text>
            <Text style={{ fontSize: 11, fontWeight: '800', color, marginTop: 1 }}>
              {Math.round(pct * 100)}%
            </Text>
          </View>
        </View>
      </View>
      <Text
        style={[typography.caption, { color: c.textSecondary, marginTop: spacing.xs, fontWeight: '600' }]}
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
  const cookFromPantry = useSelector((s: RootState) => s.pantry.cookFromPantryMode);
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
  const stableCount = pantryItems.filter((i) => !i.expiry_date).length;
  const readinessScore =
    pantryCount === 0
      ? 0
      : Math.min(
          100,
          Math.round(((stableCount * 0.8 + (pantryCount - urgentCount)) / pantryCount) * 100)
        );

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

        {/* Today's cook */}
        {house && todayEntry ? (
          <Card
            surface="surface"
            radius="xl"
            elevation="card"
            bordered
            style={[
              styles.block,
              {
                borderColor: isMyTurn ? c.primary : c.success,
                backgroundColor: isMyTurn ? c.primaryMuted : c.successMuted,
              },
            ]}
            onPress={isMyTurn ? () => navigation.navigate('Tabs' as any) : undefined}
            accessibilityLabel={isMyTurn ? "It's your turn to cook" : 'View today’s cook'}
          >
            <View style={styles.row}>
              <Text style={styles.bigEmoji}>👨‍🍳</Text>
              <View style={{ flex: 1 }}>
                <Text style={[typography.h4, { color: c.text }]}>
                  {isMyTurn
                    ? "It's your turn tonight"
                    : `${todayEntry.cook_name?.split(' ')[0] ?? 'Someone'} is cooking`}
                </Text>
                {todayEntry.recipe_name ? (
                  <Text
                    style={[typography.bodySmall, { color: c.textSecondary, marginTop: 2 }]}
                    numberOfLines={1}
                  >
                    {todayEntry.recipe_name}
                  </Text>
                ) : null}
              </View>
              {isMyTurn ? <Badge label="Your turn" tone="primary" /> : null}
            </View>
          </Card>
        ) : null}

        {/* Hero — readiness */}
        <Card
          surface="surfaceMuted"
          radius="2xl"
          elevation="flat"
          padding="2xl"
          style={styles.block}
        >
          <Text style={[typography.h2, { color: c.text }]}>
            Cook smarter with what you already have.
          </Text>
          <Text
            style={[
              typography.body,
              { color: c.textSecondary, marginTop: spacing.sm },
            ]}
          >
            {urgentCount > 0
              ? `${urgentCount} ingredient${urgentCount > 1 ? 's' : ''} need attention soon.`
              : 'No expiry pressure right now.'}
          </Text>

          <View style={styles.heroStats}>
            <HeroStat label="Readiness" value={String(readinessScore)} suffix="%" />
            <HeroStat label="In pantry" value={String(pantryCount)} />
            <HeroStat
              label="Use soon"
              value={String(urgentCount)}
              tone={urgentCount > 0 ? 'warning' : 'neutral'}
            />
          </View>

          {cookFromPantry ? (
            <View style={[styles.pillNote, { backgroundColor: c.successMuted }]}>
              <Badge label="LIVE" tone="success" />
              <Text style={[typography.bodySmall, { color: c.success, fontWeight: '700' }]}>
                Pantry matching is shaping recipe priority
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Daily goals */}
        <Card surface="surface" radius="2xl" elevation="card" padding="xl" style={styles.block}>
          <View style={styles.sectionTop}>
            <View>
              <Text style={[typography.h3, { color: c.text }]}>Daily goals</Text>
              <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
                {macroProgress.calories} / {goals.calories} kcal today
              </Text>
            </View>
          </View>
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

        {/* Use first */}
        <SectionHeader title="Use first tonight" subtitle="Keep waste low and momentum high." />
        <Card surface="surface" radius="xl" elevation="card" padding="xl" style={styles.block}>
          {expiringSoon.length > 0 ? (
            <View style={{ gap: spacing.md }}>
              {expiringSoon.slice(0, 4).map((item) => (
                <View key={item.id} style={styles.useRow}>
                  <View style={[styles.dot, { backgroundColor: c.warning }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.h4, { color: c.text }]}>{item.name}</Text>
                    <Text
                      style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}
                      numberOfLines={1}
                    >
                      {item.quantity} {item.unit} · {item.location} · expires {item.expiry_date}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[typography.body, { color: c.textSecondary }]}>
              Nothing urgent. Your pantry is in a calm zone.
            </Text>
          )}
          <View style={{ marginTop: spacing.md }}>
            <Text
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('RecipeBrowser', { cuisine: 'all', intent: 'use-soon' })
              }
              style={{ color: c.primary, fontWeight: '700', fontSize: 14 }}
            >
              Find a use-it-now dinner →
            </Text>
          </View>
        </Card>

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

        {/* Quick actions */}
        <View style={[styles.quickRow, { paddingHorizontal: spacing.xl }]}>
          <Card
            onPress={() => navigation.navigate('Pantry')}
            surface="surfaceMuted"
            radius="xl"
            padding="xl"
            elevation="flat"
            style={{ flex: 1 }}
            accessibilityLabel="Open pantry"
          >
            <Text style={{ fontSize: 24 }}>🥫</Text>
            <Text style={[typography.h4, { color: c.text, marginTop: spacing.sm }]}>Pantry</Text>
            <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
              Track and use up
            </Text>
          </Card>
          <Card
            onPress={() =>
              navigation.navigate('RecipeBrowser', { cuisine: 'all', intent: 'high-protein' })
            }
            surface="surfaceMuted"
            radius="xl"
            padding="xl"
            elevation="flat"
            style={{ flex: 1 }}
            accessibilityLabel="High-protein picks"
          >
            <Text style={{ fontSize: 24 }}>💪</Text>
            <Text style={[typography.h4, { color: c.text, marginTop: spacing.sm }]}>
              Protein picks
            </Text>
            <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
              Hit your goal faster
            </Text>
          </Card>
        </View>
      </ScrollView>

      <AttendanceSheet visible={showAttendance} onClose={() => setShowAttendance(false)} />
    </SafeAreaView>
  );
};

function HeroStat({
  label,
  value,
  suffix,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  suffix?: string;
  tone?: 'neutral' | 'warning';
}) {
  const c = useThemeColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.surface,
        borderRadius: radii.lg,
        padding: spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '800',
            color: tone === 'warning' ? c.warning : c.text,
          }}
        >
          {value}
        </Text>
        {suffix ? (
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: tone === 'warning' ? c.warning : c.textSecondary,
              marginLeft: 2,
            }}
          >
            {suffix}
          </Text>
        ) : null}
      </View>
      <Text
        style={[typography.caption, { color: c.textSecondary, fontWeight: '600', marginTop: 2 }]}
      >
        {label}
      </Text>
    </View>
  );
}

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
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  block: { marginHorizontal: spacing.xl, marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bigEmoji: { fontSize: 26 },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  pillNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  sectionTop: { marginBottom: spacing.lg },
  ringRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  useRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  cuisineGrid: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
});

export default HomeScreen;
