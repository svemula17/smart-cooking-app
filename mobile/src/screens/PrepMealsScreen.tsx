import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import type { RootState } from '../store';
import { houseApi } from '../services/api';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Badge, Button, Card, EmptyState, Header, Skeleton, useToast } from '../components/ui';

interface PrepMeal {
  id: string;
  recipe_id: string;
  recipe_name: string;
  cuisine_type: string;
  cooked_by: string;
  cooked_by_name: string;
  total_portions: number;
  remaining_portions: number;
  cooked_at: string;
  available_until: string;
}

export default function PrepMealsScreen({ navigation }: any) {
  const c = useThemeColors();
  const toast = useToast();
  const { house } = useSelector((s: RootState) => s.house);
  const [meals, setMeals] = useState<PrepMeal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!house) return;
    setLoading(true);
    try {
      const { data } = await houseApi.get(`/houses/${house.id}/prep-meals`);
      setMeals(data.data.prep_meals);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [house]);

  useEffect(() => {
    load();
  }, [load]);

  const handleConsume = (meal: PrepMeal) => {
    if (!house) return;
    Alert.alert(`Eat ${meal.recipe_name}?`, `${meal.remaining_portions} portions left`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Eat 1 portion',
        onPress: async () => {
          try {
            await houseApi.patch(
              `/houses/${house.id}/prep-meals/${meal.id}/consume`,
              { portions: 1 }
            );
            await load();
            toast.show('Portion logged', 'success');
          } catch (e: any) {
            toast.show(
              e?.response?.data?.error?.message ?? 'Could not update',
              'error'
            );
          }
        },
      },
    ]);
  };

  const daysUntil = (date: string) =>
    Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Prep meals"
        subtitle="Ready-to-eat portions from earlier cooks"
        onBack={() => navigation.goBack()}
        border
      />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={c.primary} />}
      >
        {loading ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={120} radius={16} />
            <Skeleton height={120} radius={16} />
          </View>
        ) : meals.length === 0 ? (
          <EmptyState
            icon="🍱"
            title="No prep meals available"
            body="Cook a large batch and mark it as prep to see portions here."
          />
        ) : (
          meals.map((meal) => {
            const days = daysUntil(meal.available_until);
            return (
              <Card
                key={meal.id}
                surface="surface"
                radius="xl"
                padding="lg"
                elevation="card"
                bordered
                style={{ marginBottom: spacing.md }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.h4, { color: c.text }]}>{meal.recipe_name}</Text>
                    <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
                      Made by {meal.cooked_by_name} · {meal.cuisine_type}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: c.successMuted,
                      borderRadius: 10,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      alignItems: 'center',
                      minWidth: 56,
                    }}
                  >
                    <Text style={{ fontSize: 22, fontWeight: '800', color: c.success }}>
                      {meal.remaining_portions}
                    </Text>
                    <Text style={{ fontSize: 11, color: c.success }}>left</Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: spacing.md,
                  }}
                >
                  <Badge
                    label={days > 0 ? `${days}d left` : 'Expires today'}
                    tone={days <= 1 ? 'warning' : 'neutral'}
                  />
                  <Button label="Eat a portion" size="sm" onPress={() => handleConsume(meal)} />
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
