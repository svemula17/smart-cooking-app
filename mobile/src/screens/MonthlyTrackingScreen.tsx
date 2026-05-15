import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { trackingService } from '../services/trackingService';
import type { RootState } from '../store';
import type { DailyNutritionData, WeeklyComparison } from '../types';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  Badge,
  Card,
  Chip,
  EmptyState,
  Skeleton,
} from '../components/ui';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;

type MacroKey = 'calories' | 'protein' | 'carbs' | 'fat';

function useMacroTabs() {
  const c = useThemeColors();
  return [
    { key: 'calories' as MacroKey, label: 'Calories', color: c.calories, unit: 'kcal' },
    { key: 'protein' as MacroKey, label: 'Protein', color: c.protein, unit: 'g' },
    { key: 'carbs' as MacroKey, label: 'Carbs', color: c.carbs, unit: 'g' },
    { key: 'fat' as MacroKey, label: 'Fat', color: c.fat, unit: 'g' },
  ];
}

function TrendChart({
  daily,
  macroKey,
  goal,
  color,
  unit,
}: {
  daily: DailyNutritionData[];
  macroKey: MacroKey;
  goal: number;
  color: string;
  unit: string;
}) {
  const c = useThemeColors();
  if (daily.length === 0) {
    return <EmptyState icon="📊" title="No data yet" body="Log meals to see your trends." />;
  }

  const step = Math.max(1, Math.floor(daily.length / 10));
  const sampled = daily.filter((_, i) => i % step === 0 || i === daily.length - 1).slice(0, 10);
  const labels = sampled.map((d) => d.date.slice(8));
  const values = sampled.map((d) => d[`total_${macroKey}` as keyof DailyNutritionData] as number);

  return (
    <View style={{ marginTop: spacing.xs }}>
      <LineChart
        data={{
          labels,
          datasets: [
            { data: values, color: () => color, strokeWidth: 2 },
            { data: values.map(() => goal), color: () => `${color}55`, strokeWidth: 1, withDots: false },
          ],
        }}
        width={CHART_WIDTH}
        height={200}
        chartConfig={{
          backgroundColor: c.surface,
          backgroundGradientFrom: c.surface,
          backgroundGradientTo: c.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0,0,0,${opacity * 0.4})`,
          labelColor: () => c.textLight,
          style: { borderRadius: 16 },
          propsForDots: { r: '3', strokeWidth: '2', stroke: color },
        }}
        bezier
        style={{ borderRadius: 16 }}
        withInnerLines={false}
        withOuterLines={false}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={[typography.caption, { color: c.textSecondary }]}>Daily {unit}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: `${color}55` }]} />
          <Text style={[typography.caption, { color: c.textSecondary }]}>Goal</Text>
        </View>
      </View>
    </View>
  );
}

function buildMockData(goals: { calories: number; protein: number; carbs: number; fat: number }) {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysToShow = Math.min(today.getDate(), daysInMonth);
  const seeds = [0.85, 0.95, 1.05, 0.90, 1.10, 0.88, 1.02, 0.78, 1.08, 0.92,
    1.15, 0.82, 0.98, 1.12, 0.87, 1.03, 0.93, 1.07, 0.80, 1.01,
    0.96, 1.14, 0.84, 1.09, 0.91, 0.99, 1.06, 0.86, 1.13, 0.94];

  const daily_data: DailyNutritionData[] = Array.from({ length: daysToShow }, (_, i) => {
    const f = seeds[i % seeds.length]!;
    const cals = Math.round(goals.calories * f);
    return {
      date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
      total_calories: cals,
      total_protein: Math.round(goals.protein * f),
      total_carbs: Math.round(goals.carbs * f),
      total_fat: Math.round(goals.fat * f),
      goal_met: cals >= goals.calories * 0.8,
    };
  });

  const n = daily_data.length || 1;
  const avg = (key: keyof DailyNutritionData) =>
    Math.round(daily_data.reduce((s, d) => s + (d[key] as number), 0) / n);
  const thisWeek = daily_data.slice(-7);
  const lastWeek = daily_data.slice(-14, -7);
  const wAvg = (arr: DailyNutritionData[], key: keyof DailyNutritionData) =>
    arr.length ? Math.round(arr.reduce((s, d) => s + (d[key] as number), 0) / arr.length) : 0;
  const daysMet = daily_data.filter((d) => d.goal_met).length;
  let streak = 0;
  for (let i = daily_data.length - 1; i >= 0; i--) {
    if (daily_data[i]!.goal_met) streak++;
    else break;
  }
  return {
    month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
    daily_data,
    averages: {
      calories: avg('total_calories'),
      protein: avg('total_protein'),
      carbs: avg('total_carbs'),
      fat: avg('total_fat'),
    },
    weekly_comparison: {
      this_week: {
        calories: wAvg(thisWeek, 'total_calories'),
        protein: wAvg(thisWeek, 'total_protein'),
        carbs: wAvg(thisWeek, 'total_carbs'),
        fat: wAvg(thisWeek, 'total_fat'),
      },
      last_week: {
        calories: wAvg(lastWeek, 'total_calories'),
        protein: wAvg(lastWeek, 'total_protein'),
        carbs: wAvg(lastWeek, 'total_carbs'),
        fat: wAvg(lastWeek, 'total_fat'),
      },
    },
    goal_adherence_percent: Math.round((daysMet / n) * 100),
    current_streak: streak,
    goals,
  };
}

export function MonthlyTrackingScreen(): React.JSX.Element {
  const c = useThemeColors();
  const macroTabs = useMacroTabs();
  const user = useSelector((s: RootState) => s.auth.user);
  const prefs = useSelector((s: RootState) => s.user.preferences);
  const [activeTab, setActiveTab] = useState<MacroKey>('calories');

  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data, isLoading } = useQuery({
    queryKey: ['monthly-stats', user?.id, currentMonth],
    queryFn: () => trackingService.getMonthlyStats(user!.id, currentMonth),
    enabled: !!user?.id,
  });

  const goals = {
    calories: prefs?.calories_goal ?? 2000,
    protein: prefs?.protein_goal ?? 150,
    carbs: prefs?.carbs_goal ?? 250,
    fat: prefs?.fat_goal ?? 65,
  };

  const displayData = data && data.daily_data.length > 0 ? data : buildMockData(goals);
  const isMock = !data || data.daily_data.length === 0;
  const activeMeta = macroTabs.find((t) => t.key === activeTab)!;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={[typography.h1, { color: c.text }]}>Stats</Text>
          <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
      </View>

      {!user ? (
        <EmptyState icon="🔒" title="Sign in to view stats" body="Track your goals over time." />
      ) : isLoading ? (
        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          <Skeleton height={48} radius={16} />
          <Skeleton height={220} radius={20} />
          <Skeleton height={180} radius={20} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
        >
          {isMock ? (
            <View style={{ marginBottom: spacing.md, alignItems: 'center' }}>
              <Badge label="📋 Sample data — log meals to see real stats" tone="warning" size="md" />
            </View>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
          >
            {macroTabs.map((t) => (
              <Chip
                key={t.key}
                label={t.label}
                selected={activeTab === t.key}
                onPress={() => setActiveTab(t.key)}
              />
            ))}
          </ScrollView>

          {/* Trend chart */}
          <Card surface="surface" radius="2xl" padding="lg" elevation="card" bordered style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.h3, { color: c.text, marginBottom: spacing.md }]}>
              {activeMeta.label} trend
            </Text>
            <TrendChart
              daily={displayData.daily_data}
              macroKey={activeTab}
              goal={goals[activeTab]}
              color={activeMeta.color}
              unit={activeMeta.unit}
            />
          </Card>

          {/* Averages */}
          <Card surface="surface" radius="2xl" padding="lg" elevation="card" bordered style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.h3, { color: c.text, marginBottom: spacing.md }]}>
              📊 This month’s averages
            </Text>
            {macroTabs.map((m) => {
              const avg = displayData.averages[m.key] ?? 0;
              const goal = goals[m.key] ?? 1;
              const pct = Math.min(Math.round((avg / goal) * 100), 100);
              return (
                <View key={m.key} style={{ marginBottom: spacing.md }}>
                  <View style={styles.rowSpread}>
                    <Text style={[typography.body, { color: c.text, fontWeight: '600' }]}>
                      {m.label}
                    </Text>
                    <Text style={[typography.bodySmall, { color: c.textSecondary }]}>
                      {Math.round(avg)}{m.unit} / {goal}{m.unit}
                    </Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: c.surfaceMuted }]}>
                    <View style={{ height: '100%', borderRadius: 4, width: `${pct}%`, backgroundColor: m.color }} />
                  </View>
                </View>
              );
            })}
          </Card>

          {/* Week comparison */}
          <Card surface="surface" radius="2xl" padding="lg" elevation="card" bordered style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.h3, { color: c.text, marginBottom: spacing.md }]}>
              📈 This week vs last week
            </Text>
            <WeekComparisonRows comparison={displayData.weekly_comparison} />
          </Card>

          {/* Adherence */}
          <Card surface="surface" radius="2xl" padding="lg" elevation="card" bordered>
            <Text style={[typography.h3, { color: c.text, marginBottom: spacing.sm }]}>
              🎯 Goal adherence
            </Text>
            <Text style={[typography.body, { color: c.text, marginBottom: spacing.md }]}>
              {Math.round(displayData.goal_adherence_percent)}% of days met goals
            </Text>
            <View style={[styles.trackTall, { backgroundColor: c.surfaceMuted }]}>
              <View
                style={{
                  height: '100%',
                  width: `${displayData.goal_adherence_percent}%`,
                  backgroundColor: c.primary,
                  borderRadius: 6,
                }}
              />
            </View>
            {displayData.current_streak >= 3 ? (
              <Text style={{ fontSize: 16, fontWeight: '700', color: c.calories, marginTop: spacing.md }}>
                🔥 {displayData.current_streak}-day streak!
              </Text>
            ) : null}
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function WeekComparisonRows({ comparison }: { comparison: WeeklyComparison }) {
  const c = useThemeColors();
  const { this_week, last_week } = comparison;
  const metrics: { label: string; key: MacroKey; unit: string }[] = [
    { label: 'Avg calories', key: 'calories', unit: '' },
    { label: 'Avg protein', key: 'protein', unit: 'g' },
    { label: 'Avg carbs', key: 'carbs', unit: 'g' },
    { label: 'Avg fat', key: 'fat', unit: 'g' },
  ];

  return (
    <>
      {metrics.map(({ label, key, unit }) => {
        const curr = Math.round(this_week[key] ?? 0);
        const prev = Math.round(last_week[key] ?? 0);
        const diff = curr - prev;
        const pct = prev > 0 ? Math.round((diff / prev) * 100) : 0;
        const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
        const color = diff > 0 ? c.success : diff < 0 ? c.error : c.textLight;
        return (
          <View key={key} style={[styles.rowSpread, { marginBottom: spacing.sm }]}>
            <Text style={[typography.body, { color: c.text, flex: 1 }]}>{label}</Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: c.text,
                marginRight: 8,
                width: 60,
                textAlign: 'right',
              }}
            >
              {curr}
              {unit}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color, width: 110, textAlign: 'right' }}>
              {arrow} {diff !== 0 ? `${diff > 0 ? '+' : ''}${diff}${unit} (${pct > 0 ? '+' : ''}${pct}%)` : '0%'}
            </Text>
          </View>
        );
      })}
    </>
  );
}

export default MonthlyTrackingScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.md },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowSpread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: spacing.xs },
  trackTall: { height: 12, borderRadius: 6, overflow: 'hidden' },
});
