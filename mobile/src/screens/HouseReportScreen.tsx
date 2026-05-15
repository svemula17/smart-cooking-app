import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import type { RootState } from '../store';
import { houseApi } from '../services/api';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button, Card, EmptyState, Header, Skeleton } from '../components/ui';

interface Report {
  week_start: string;
  meals_cooked: number;
  total_spent: number;
  money_saved_vs_delivery: number;
  member_count: number;
  best_meal: { recipe_name: string; cook_name: string; avg_rating: string } | null;
  total_waste: number;
}

export default function HouseReportScreen({ navigation }: any) {
  const c = useThemeColors();
  const { house } = useSelector((s: RootState) => s.house);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!house) return;
    setLoading(true);
    try {
      const { data } = await houseApi.get(`/houses/${house.id}/report/weekly`);
      setReport(data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [house]);

  useEffect(() => {
    load();
  }, [load]);

  const handleShare = async () => {
    if (!report || !house) return;
    await Share.share({
      message:
        `📊 ${house.name} — Weekly Report\n\n` +
        `🍳 Meals cooked: ${report.meals_cooked}\n` +
        `💰 Spent: ₹${report.total_spent.toFixed(0)}\n` +
        `💸 Saved vs delivery: ₹${report.money_saved_vs_delivery}\n` +
        (report.best_meal
          ? `⭐ Best meal: ${report.best_meal.recipe_name} by ${report.best_meal.cook_name}\n`
          : '') +
        `\nCooked with Smart Cooking App 🚀`,
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Weekly Report"
        onBack={() => navigation.goBack()}
        right={<Button label="Share" size="sm" onPress={handleShare} />}
        border
      />
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={c.primary} />}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={140} radius={20} />
            <Skeleton height={100} radius={16} />
            <Skeleton height={100} radius={16} />
          </View>
        ) : report ? (
          <>
            <Card
              surface="surface"
              radius="2xl"
              padding="2xl"
              elevation="card"
              style={{
                backgroundColor: c.success,
                alignItems: 'center',
                marginBottom: spacing.lg,
              }}
            >
              <Text style={{ fontSize: 48, fontWeight: '800', color: c.onPrimary }}>
                ₹{report.money_saved_vs_delivery}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.85)',
                  marginTop: spacing.xs,
                }}
              >
                saved vs ordering out
              </Text>
            </Card>

            <View style={styles.grid}>
              <StatCard num={String(report.meals_cooked)} label="meals cooked" />
              <StatCard num={`₹${report.total_spent.toFixed(0)}`} label="spent on groceries" />
              <StatCard
                num={`₹${report.total_waste.toFixed(0)}`}
                label="wasted"
                tone="error"
              />
              <StatCard num={String(report.member_count)} label="members fed" />
            </View>

            {report.best_meal ? (
              <Card
                surface="surfaceMuted"
                radius="xl"
                padding="lg"
                elevation="flat"
                style={{
                  marginTop: spacing.lg,
                  borderWidth: 1,
                  borderColor: c.primary,
                }}
              >
                <Text style={[typography.overline, { color: c.primary }]}>
                  Best meal of the week
                </Text>
                <Text style={[typography.h2, { color: c.text, marginTop: spacing.xs }]}>
                  {report.best_meal.recipe_name}
                </Text>
                <Text
                  style={[typography.body, { color: c.textSecondary, marginTop: spacing.xs }]}
                >
                  By {report.best_meal.cook_name} · ⭐ {report.best_meal.avg_rating}
                </Text>
              </Card>
            ) : null}
          </>
        ) : (
          <EmptyState
            icon="📊"
            title="No data yet"
            body="Start cooking to see your weekly report."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  num,
  label,
  tone = 'neutral',
}: {
  num: string;
  label: string;
  tone?: 'neutral' | 'error';
}) {
  const c = useThemeColors();
  return (
    <Card
      surface="surface"
      radius="lg"
      padding="lg"
      elevation="card"
      bordered
      style={styles.statCard}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: '800',
          color: tone === 'error' ? c.error : c.text,
        }}
      >
        {num}
      </Text>
      <Text style={[typography.caption, { color: c.textSecondary, marginTop: 4 }]}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: { width: '48%', alignItems: 'center' },
});
