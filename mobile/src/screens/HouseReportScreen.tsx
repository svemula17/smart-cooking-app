import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { houseApi } from '../services/api';

interface Report {
  week_start: string; meals_cooked: number; total_spent: number;
  money_saved_vs_delivery: number; member_count: number;
  best_meal: { recipe_name: string; cook_name: string; avg_rating: string } | null;
  total_waste: number;
}

export default function HouseReportScreen({ navigation }: any) {
  const { house } = useSelector((s: RootState) => s.house);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!house) return;
    setLoading(true);
    try {
      const { data } = await houseApi.get(`/houses/${house.id}/report/weekly`);
      setReport(data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [house]);

  useEffect(() => { load(); }, [load]);

  async function handleShare() {
    if (!report || !house) return;
    await Share.share({
      message: `📊 ${house.name} — Weekly Report\n\n` +
        `🍳 Meals cooked: ${report.meals_cooked}\n` +
        `💰 Spent: ₹${report.total_spent.toFixed(0)}\n` +
        `💸 Saved vs delivery: ₹${report.money_saved_vs_delivery}\n` +
        (report.best_meal ? `⭐ Best meal: ${report.best_meal.recipe_name} by ${report.best_meal.cook_name}\n` : '') +
        `\nCooked with Smart Cooking App 🚀`,
    });
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Weekly Report</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}><Text style={styles.shareBtnText}>Share</Text></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#E85D04" style={{ marginTop: 60 }} /> : report ? (
        <>
          <View style={styles.heroCard}>
            <Text style={styles.heroSaved}>₹{report.money_saved_vs_delivery}</Text>
            <Text style={styles.heroLabel}>saved vs ordering out</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{report.meals_cooked}</Text>
              <Text style={styles.statLabel}>meals cooked</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>₹{report.total_spent.toFixed(0)}</Text>
              <Text style={styles.statLabel}>spent on groceries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: '#DC2626' }]}>₹{report.total_waste.toFixed(0)}</Text>
              <Text style={styles.statLabel}>wasted</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{report.member_count}</Text>
              <Text style={styles.statLabel}>members fed</Text>
            </View>
          </View>

          {report.best_meal && (
            <View style={styles.bestMealCard}>
              <Text style={styles.cardLabel}>BEST MEAL OF THE WEEK</Text>
              <Text style={styles.bestMealName}>{report.best_meal.recipe_name}</Text>
              <Text style={styles.bestMealMeta}>
                By {report.best_meal.cook_name} · ⭐ {report.best_meal.avg_rating}
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySub}>Start cooking to see your weekly report.</Text>
        </View>
      )}
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  back: { fontSize: 15, color: '#E85D04' },
  title: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  shareBtn: { backgroundColor: '#E85D04', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 14 },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  heroCard: { backgroundColor: '#16A34A', borderRadius: 20, margin: 16, padding: 28, alignItems: 'center' },
  heroSaved: { fontSize: 48, fontWeight: '800', color: '#fff' },
  heroLabel: { fontSize: 16, color: '#BBF7D0', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 16 },
  statCard: { width: '46%', backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: '#1C1C1E' },
  statLabel: { fontSize: 12, color: '#9B9B9B', marginTop: 4 },
  bestMealCard: { backgroundColor: '#FFF3E0', borderRadius: 16, margin: 16, padding: 18, borderWidth: 1, borderColor: '#E85D04' },
  cardLabel: { fontSize: 11, fontWeight: '700', color: '#E85D04', letterSpacing: 1, marginBottom: 8 },
  bestMealName: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  bestMealMeta: { fontSize: 14, color: '#6B6B6B', marginTop: 4 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  emptySub: { fontSize: 15, color: '#6B6B6B' },
});
