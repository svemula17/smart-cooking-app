import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { trackingService } from '../services/trackingService';
import { colors } from '../theme/colors';
import type { RootState } from '../store';
import type { DailyNutritionData, WeeklyComparison } from '../types';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;

// ─── Macro tab selector ───────────────────────────────────────────────────────

type MacroKey = 'calories' | 'protein' | 'carbs' | 'fat';

const MACRO_TABS: { key: MacroKey; label: string; color: string; unit: string }[] = [
  { key: 'calories', label: 'Calories', color: colors.calories, unit: 'kcal' },
  { key: 'protein',  label: 'Protein',  color: colors.protein,  unit: 'g' },
  { key: 'carbs',    label: 'Carbs',    color: colors.carbs,    unit: 'g' },
  { key: 'fat',      label: 'Fat',      color: colors.fat,      unit: 'g' },
];

// ─── TrendChart ───────────────────────────────────────────────────────────────

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
  if (daily.length === 0) {
    return (
      <View style={chartStyles.empty}>
        <Text style={chartStyles.emptyText}>No data yet this month</Text>
      </View>
    );
  }

  // Sample up to 10 data points evenly
  const step = Math.max(1, Math.floor(daily.length / 10));
  const sampled = daily.filter((_, i) => i % step === 0 || i === daily.length - 1).slice(0, 10);
  const labels  = sampled.map((d) => d.date.slice(8));
  const values  = sampled.map((d) => d[`total_${macroKey}` as keyof DailyNutritionData] as number);

  return (
    <View style={chartStyles.wrapper}>
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
          backgroundColor: colors.surfaceElevated,
          backgroundGradientFrom: colors.surfaceElevated,
          backgroundGradientTo: colors.surfaceElevated,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0,0,0,${opacity * 0.4})`,
          labelColor: () => colors.textLight,
          style: { borderRadius: 16 },
          propsForDots: { r: '3', strokeWidth: '2', stroke: color },
        }}
        bezier
        style={{ borderRadius: 16 }}
        withInnerLines={false}
        withOuterLines={false}
      />
      <View style={chartStyles.legend}>
        <View style={chartStyles.legendItem}>
          <View style={[chartStyles.dot, { backgroundColor: color }]} />
          <Text style={chartStyles.legendText}>Daily {unit}</Text>
        </View>
        <View style={chartStyles.legendItem}>
          <View style={[chartStyles.dot, { backgroundColor: `${color}55` }]} />
          <Text style={chartStyles.legendText}>Goal</Text>
        </View>
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrapper:     { marginTop: 4 },
  empty:       { height: 200, alignItems: 'center', justifyContent: 'center' },
  emptyText:   { color: colors.textLight, fontSize: 14 },
  legend:      { flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 8 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot:         { width: 8, height: 8, borderRadius: 4 },
  legendText:  { fontSize: 11, color: colors.textSecondary },
});

// ─── AveragesCard ─────────────────────────────────────────────────────────────

function AveragesCard({ averages, goals }: {
  averages: { calories: number; protein: number; carbs: number; fat: number };
  goals:    { calories: number; protein: number; carbs: number; fat: number };
}) {
  return (
    <View style={avgStyles.card}>
      <Text style={avgStyles.cardTitle}>📊 This Month's Averages</Text>
      {MACRO_TABS.map(({ key, label, color, unit }) => {
        const avg  = averages[key] ?? 0;
        const goal = goals[key] ?? 1;
        const pct  = Math.min(Math.round((avg / goal) * 100), 100);
        return (
          <View key={key} style={avgStyles.row}>
            <View style={avgStyles.rowHeader}>
              <Text style={avgStyles.label}>{label}</Text>
              <Text style={avgStyles.value}>{Math.round(avg)}{unit} / {goal}{unit}</Text>
            </View>
            <View style={avgStyles.track}>
              <View style={[avgStyles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
            </View>
            <Text style={avgStyles.pct}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}

const avgStyles = StyleSheet.create({
  card:      { backgroundColor: colors.surfaceElevated, borderRadius: 18, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 },
  row:       { marginBottom: 14 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label:     { fontSize: 14, color: colors.text, fontWeight: '500' },
  value:     { fontSize: 13, color: colors.textSecondary },
  track:     { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  fill:      { height: '100%', borderRadius: 4 },
  pct:       { fontSize: 11, color: colors.textLight, textAlign: 'right' },
});

// ─── WeekComparisonCard ───────────────────────────────────────────────────────

function WeekComparisonCard({ comparison }: { comparison: WeeklyComparison }) {
  const { this_week, last_week } = comparison;
  const metrics: { label: string; key: MacroKey; unit: string }[] = [
    { label: 'Avg Calories', key: 'calories', unit: '' },
    { label: 'Avg Protein',  key: 'protein',  unit: 'g' },
    { label: 'Avg Carbs',    key: 'carbs',    unit: 'g' },
    { label: 'Avg Fat',      key: 'fat',      unit: 'g' },
  ];

  return (
    <View style={wkStyles.card}>
      <Text style={wkStyles.cardTitle}>📈 This Week vs Last Week</Text>
      {metrics.map(({ label, key, unit }) => {
        const curr  = Math.round(this_week[key] ?? 0);
        const prev  = Math.round(last_week[key] ?? 0);
        const diff  = curr - prev;
        const pct   = prev > 0 ? Math.round((diff / prev) * 100) : 0;
        const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
        const arrColor = diff > 0 ? colors.success : diff < 0 ? colors.error : colors.textLight;
        return (
          <View key={key} style={wkStyles.row}>
            <Text style={wkStyles.label}>{label}</Text>
            <Text style={wkStyles.curr}>{curr}{unit}</Text>
            <Text style={[wkStyles.arrow, { color: arrColor }]}>
              {arrow} {diff !== 0 ? `${diff > 0 ? '+' : ''}${diff}${unit} (${pct > 0 ? '+' : ''}${pct}%)` : '0%'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const wkStyles = StyleSheet.create({
  card:      { backgroundColor: colors.surfaceElevated, borderRadius: 18, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 14 },
  row:       { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label:     { flex: 1, fontSize: 14, color: colors.text },
  curr:      { fontSize: 14, fontWeight: '600', color: colors.text, marginRight: 8, width: 60, textAlign: 'right' },
  arrow:     { fontSize: 13, fontWeight: '600', width: 110, textAlign: 'right' },
});

// ─── AdherenceCard ────────────────────────────────────────────────────────────

function AdherenceCard({ pct, streak }: { pct: number; streak: number }) {
  return (
    <View style={adhStyles.card}>
      <Text style={adhStyles.cardTitle}>🎯 Goal Adherence</Text>
      <Text style={adhStyles.stat}>{Math.round(pct)}% of days met goals</Text>
      <View style={adhStyles.track}>
        <View style={[adhStyles.fill, { width: `${pct}%` as any }]} />
      </View>
      {streak >= 3 && (
        <Text style={adhStyles.streak}>🔥 {streak}-day streak!</Text>
      )}
    </View>
  );
}

const adhStyles = StyleSheet.create({
  card:      { backgroundColor: colors.surfaceElevated, borderRadius: 18, padding: 18, marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  stat:      { fontSize: 15, color: colors.text, marginBottom: 10 },
  track:     { height: 12, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  fill:      { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
  streak:    { fontSize: 16, fontWeight: '700', color: colors.calories },
});

// ─── MonthlyTrackingScreen ────────────────────────────────────────────────────

export function MonthlyTrackingScreen(): React.JSX.Element {
  const user  = useSelector((s: RootState) => s.auth.user);
  const prefs = useSelector((s: RootState) => s.user.preferences);
  const [activeTab, setActiveTab] = useState<MacroKey>('calories');

  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['monthly-stats', user?.id, currentMonth],
    queryFn:  () => trackingService.getMonthlyStats(user!.id, currentMonth),
    enabled:  !!user?.id,
  });

  const goals = {
    calories: prefs?.calories_goal ?? 2000,
    protein:  prefs?.protein_goal  ?? 150,
    carbs:    prefs?.carbs_goal    ?? 250,
    fat:      prefs?.fat_goal      ?? 65,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Stats</Text>
        <Text style={styles.headerSub}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
      </View>

      {!user ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Sign in to view stats</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError || !data ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySub}>Start logging meals to see your stats</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Macro tab selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
            {MACRO_TABS.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, activeTab === t.key && { backgroundColor: t.color + '22', borderColor: t.color }]}
                onPress={() => setActiveTab(t.key)}
              >
                <Text style={[styles.tabText, activeTab === t.key && { color: t.color }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Line chart */}
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>
              {MACRO_TABS.find((t) => t.key === activeTab)?.label} Trend
            </Text>
            <TrendChart
              daily={data.daily_data}
              macroKey={activeTab}
              goal={goals[activeTab]}
              color={MACRO_TABS.find((t) => t.key === activeTab)!.color}
              unit={MACRO_TABS.find((t) => t.key === activeTab)!.unit}
            />
          </View>

          <AveragesCard averages={data.averages} goals={goals} />
          <WeekComparisonCard comparison={data.weekly_comparison} />
          <AdherenceCard pct={data.goal_adherence_percent} streak={data.current_streak} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default MonthlyTrackingScreen;

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.background },
  header:     { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle:{ fontSize: 26, fontWeight: '800', color: colors.text },
  headerSub:  { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  scroll:     { padding: 16 },
  tabScroll:  { marginBottom: 16 },
  tabRow:     { gap: 8, paddingHorizontal: 0 },
  tab:        { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  tabText:    { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chartCard:  { backgroundColor: colors.surfaceElevated, borderRadius: 18, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTitle:  { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  emptySub:   { fontSize: 14, color: colors.textLight, marginTop: 6, textAlign: 'center' },
  retryBtn:   { marginTop: 20, backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 28, paddingVertical: 12 },
  retryText:  { color: '#fff', fontWeight: '700' },
});
