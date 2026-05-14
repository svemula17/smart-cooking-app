import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { houseApi } from '../services/api';

const CUISINE_FLAGS: Record<string, string> = {
  Indian: '🇮🇳', Chinese: '🇨🇳', 'Indo-Chinese': '🥢', Italian: '🇮🇹',
  Mexican: '🇲🇽', Thai: '🇹🇭', Japanese: '🇯🇵', Korean: '🇰🇷',
  French: '🇫🇷', American: '🇺🇸', Mediterranean: '🫒',
};

interface CuisineData {
  cuisine_type: string; times_cooked: string; first_cooked: string; last_cooked: string;
}

export default function CuisinePassportScreen({ navigation }: any) {
  const { house } = useSelector((s: RootState) => s.house);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [locked, setLocked] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<CuisineData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!house) return;
    setLoading(true);
    try {
      const { data } = await houseApi.get(`/houses/${house.id}/cuisine-passport`);
      setUnlocked(data.data.unlocked);
      setLocked(data.data.locked);
      setCuisines(data.data.cuisines_cooked);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [house]);

  useEffect(() => { load(); }, [load]);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Cuisine Passport</Text>
        <Text style={styles.subtitle}>{unlocked.length} of {unlocked.length + locked.length} cuisines explored</Text>
      </View>

      {loading ? <ActivityIndicator size="large" color="#E85D04" style={{ marginTop: 60 }} /> : (
        <>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(unlocked.length / (unlocked.length + locked.length)) * 100}%` as any }]} />
          </View>

          <Text style={styles.sectionTitle}>UNLOCKED</Text>
          <View style={styles.grid}>
            {unlocked.map((c) => {
              const data = cuisines.find((x) => x.cuisine_type === c);
              return (
                <View key={c} style={styles.cuisineCard}>
                  <Text style={styles.cuisineFlag}>{CUISINE_FLAGS[c] ?? '🍽️'}</Text>
                  <Text style={styles.cuisineName}>{c}</Text>
                  {data && <Text style={styles.cuisineCount}>{data.times_cooked}×</Text>}
                </View>
              );
            })}
          </View>

          {locked.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>LOCKED</Text>
              <View style={styles.grid}>
                {locked.map((c) => (
                  <View key={c} style={[styles.cuisineCard, styles.cuisineCardLocked]}>
                    <Text style={[styles.cuisineFlag, { opacity: 0.3 }]}>{CUISINE_FLAGS[c] ?? '🍽️'}</Text>
                    <Text style={[styles.cuisineName, { color: '#9B9B9B' }]}>{c}</Text>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </>
      )}
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  header: { padding: 20, paddingTop: 60, marginBottom: 8 },
  back: { fontSize: 15, color: '#E85D04', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B6B6B' },
  progressBar: { height: 8, backgroundColor: '#F0F0F0', marginHorizontal: 16, borderRadius: 4, marginBottom: 24, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#E85D04', borderRadius: 4 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9B9B9B', letterSpacing: 1, marginHorizontal: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 24 },
  cuisineCard: { width: '30%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  cuisineCardLocked: { backgroundColor: '#F3F3F3' },
  cuisineFlag: { fontSize: 28 },
  cuisineName: { fontSize: 12, fontWeight: '600', color: '#1C1C1E', textAlign: 'center' },
  cuisineCount: { fontSize: 11, color: '#E85D04', fontWeight: '700' },
  lockIcon: { fontSize: 14 },
});
