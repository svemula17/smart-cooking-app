import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import type { RootState } from '../store';
import { houseApi } from '../services/api';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Card, EmptyState, Header, Skeleton } from '../components/ui';

const CUISINE_FLAGS: Record<string, string> = {
  Indian: '🇮🇳',
  Chinese: '🇨🇳',
  'Indo-Chinese': '🥢',
  Italian: '🇮🇹',
  Mexican: '🇲🇽',
  Thai: '🇹🇭',
  Japanese: '🇯🇵',
  Korean: '🇰🇷',
  French: '🇫🇷',
  American: '🇺🇸',
  Mediterranean: '🫒',
};

interface CuisineData {
  cuisine_type: string;
  times_cooked: string;
  first_cooked: string;
  last_cooked: string;
}

export default function CuisinePassportScreen({ navigation }: any) {
  const c = useThemeColors();
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
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [house]);

  useEffect(() => {
    load();
  }, [load]);

  const total = unlocked.length + locked.length;
  const pct = total > 0 ? (unlocked.length / total) * 100 : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header title="Cuisine Passport" onBack={() => navigation.goBack()} border />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={c.primary} />}
      >
        <View style={{ paddingVertical: spacing.lg }}>
          <Text style={[typography.body, { color: c.textSecondary }]}>
            {unlocked.length} of {total} cuisines explored
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: c.surfaceMuted }]}>
            <View
              style={{
                height: '100%',
                width: `${pct}%`,
                backgroundColor: c.primary,
                borderRadius: 4,
              }}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.grid}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width="30%" height={100} radius={14} />
            ))}
          </View>
        ) : total === 0 ? (
          <EmptyState
            icon="🌍"
            title="No cuisines yet"
            body="Cook your first dish to start unlocking flags."
          />
        ) : (
          <>
            <Text style={[typography.overline, { color: c.textSecondary, marginBottom: spacing.sm }]}>
              Unlocked
            </Text>
            <View style={styles.grid}>
              {unlocked.map((u) => {
                const data = cuisines.find((x) => x.cuisine_type === u);
                return (
                  <Card
                    key={u}
                    surface="surface"
                    radius="lg"
                    padding="md"
                    elevation="card"
                    style={styles.cuisineCard}
                  >
                    <Text style={{ fontSize: 28 }}>{CUISINE_FLAGS[u] ?? '🍽️'}</Text>
                    <Text style={[typography.caption, { color: c.text, fontWeight: '700', textAlign: 'center' }]}>
                      {u}
                    </Text>
                    {data ? (
                      <Text style={{ fontSize: 11, color: c.primary, fontWeight: '700' }}>
                        {data.times_cooked}×
                      </Text>
                    ) : null}
                  </Card>
                );
              })}
            </View>

            {locked.length > 0 ? (
              <>
                <Text
                  style={[
                    typography.overline,
                    { color: c.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
                  ]}
                >
                  Locked
                </Text>
                <View style={styles.grid}>
                  {locked.map((l) => (
                    <Card
                      key={l}
                      surface="surfaceMuted"
                      radius="lg"
                      padding="md"
                      elevation="flat"
                      style={styles.cuisineCard}
                    >
                      <Text style={{ fontSize: 28, opacity: 0.35 }}>
                        {CUISINE_FLAGS[l] ?? '🍽️'}
                      </Text>
                      <Text
                        style={[typography.caption, { color: c.textLight, textAlign: 'center' }]}
                      >
                        {l}
                      </Text>
                      <Text style={{ fontSize: 14 }}>🔒</Text>
                    </Card>
                  ))}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cuisineCard: {
    width: '31%',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
