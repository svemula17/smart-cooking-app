import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { houseApi } from '../services/api';

interface Ranking {
  user_id: string; name: string; cook_count: string; avg_rating: string | null;
  total_ratings: string; rank: number; badge: string | null;
}

export default function LeaderboardScreen({ navigation }: any) {
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
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [house]);

  useEffect(() => { load(); }, [load]);

  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak}-day streak</Text>
          </View>
        )}
      </View>

      {loading ? <ActivityIndicator size="large" color="#E85D04" style={{ marginTop: 60 }} /> : rankings.map((r) => {
        const isMe = r.user_id === currentUser?.id;
        return (
          <View key={r.user_id} style={[styles.row, isMe && styles.rowMe, r.rank === 1 && styles.rowFirst]}>
            <Text style={styles.medal}>{medals[r.rank] ?? `#${r.rank}`}</Text>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{r.name[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{isMe ? `${r.name} (you)` : r.name}</Text>
              {r.badge && <Text style={styles.badge}>{r.badge}</Text>}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cookCount}>{r.cook_count} meals</Text>
              {r.avg_rating && <Text style={styles.rating}>⭐ {r.avg_rating}</Text>}
            </View>
          </View>
        );
      })}
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  header: { padding: 20, paddingTop: 60, marginBottom: 8 },
  back: { fontSize: 15, color: '#E85D04', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  streakBadge: { backgroundColor: '#FFF3E0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start' },
  streakText: { fontSize: 14, fontWeight: '700', color: '#E85D04' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 10, gap: 12 },
  rowMe: { borderWidth: 2, borderColor: '#E85D04' },
  rowFirst: { backgroundColor: '#FFF8E1' },
  medal: { fontSize: 24, width: 36, textAlign: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E85D04', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  name: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  badge: { fontSize: 12, color: '#E85D04', marginTop: 2 },
  cookCount: { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  rating: { fontSize: 12, color: '#9B9B9B', marginTop: 2 },
});
