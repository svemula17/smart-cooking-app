import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import type { RootState } from '../store';
import { houseApi } from '../services/api';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Avatar, Badge, Card, EmptyState, Header, Skeleton } from '../components/ui';

interface Ranking {
  user_id: string;
  name: string;
  cook_count: string;
  avg_rating: string | null;
  total_ratings: string;
  rank: number;
  badge: string | null;
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardScreen({ navigation }: any) {
  const c = useThemeColors();
  const { house } = useSelector((s: RootState) => s.house);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!house) return;
    setLoading(true);
    try {
      const { data } = await houseApi.get(`/houses/${house.id}/leaderboard`);
      setRankings(data.data.rankings);
      setStreak(data.data.house_streak);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [house]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Leaderboard"
        onBack={() => navigation.goBack()}
        right={streak > 0 ? <Badge label={`🔥 ${streak}d`} tone="warning" size="md" /> : null}
        border
      />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={c.primary} />}
      >
        {loading ? (
          <View style={{ gap: spacing.sm }}>
            <Skeleton height={64} radius={14} />
            <Skeleton height={64} radius={14} />
            <Skeleton height={64} radius={14} />
          </View>
        ) : rankings.length === 0 ? (
          <EmptyState icon="🏆" title="No data yet" body="Cook some meals to land on the board." />
        ) : (
          rankings.map((r) => {
            const isMe = r.user_id === currentUser?.id;
            const isFirst = r.rank === 1;
            return (
              <Card
                key={r.user_id}
                surface="surface"
                radius="lg"
                padding="md"
                elevation="card"
                bordered
                style={{
                  marginBottom: spacing.sm,
                  borderColor: isMe ? c.primary : isFirst ? c.warning : c.border,
                  borderWidth: isMe || isFirst ? 2 : 1,
                  backgroundColor: isFirst ? c.warningMuted : c.surface,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Text style={{ fontSize: 24, width: 36, textAlign: 'center' }}>
                    {MEDALS[r.rank] ?? `#${r.rank}`}
                  </Text>
                  <Avatar name={r.name} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.h4, { color: c.text }]}>
                      {isMe ? `${r.name} (you)` : r.name}
                    </Text>
                    {r.badge ? (
                      <Text style={{ fontSize: 12, color: c.primary, marginTop: 2 }}>
                        {r.badge}
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[typography.body, { color: c.text, fontWeight: '700' }]}>
                      {r.cook_count} meals
                    </Text>
                    {r.avg_rating ? (
                      <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
                        ⭐ {r.avg_rating}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
