import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { houseApi } from '../services/api';

interface PrepMeal {
  id: string; recipe_id: string; recipe_name: string; cuisine_type: string;
  cooked_by: string; cooked_by_name: string; total_portions: number;
  remaining_portions: number; cooked_at: string; available_until: string;
}

export default function PrepMealsScreen({ navigation }: any) {
  const { house } = useSelector((s: RootState) => s.house);
  const [meals, setMeals] = useState<PrepMeal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!house) return;
    setLoading(true);
    try {
      const { data } = await houseApi.get(`/houses/${house.id}/prep-meals`);
      setMeals(data.data.prep_meals);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [house]);

  useEffect(() => { load(); }, [load]);

  async function handleConsume(meal: PrepMeal) {
    if (!house) return;
    Alert.alert(`Eat ${meal.recipe_name}?`, `${meal.remaining_portions} portions left`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Eat 1 portion',
        onPress: async () => {
          try {
            await houseApi.patch(`/houses/${house.id}/prep-meals/${meal.id}/consume`, { portions: 1 });
            await load();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.error?.message ?? 'Could not update');
          }
        },
      },
    ]);
  }

  const daysUntil = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Prep Meals</Text>
        <Text style={styles.subtitle}>Ready-to-eat portions from earlier cooks</Text>
      </View>

      {loading ? <ActivityIndicator size="large" color="#E85D04" style={{ marginTop: 60 }} /> :
        meals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No prep meals available</Text>
            <Text style={styles.emptySub}>Cook a large batch and mark it as prep to see portions here.</Text>
          </View>
        ) : meals.map((meal) => {
          const days = daysUntil(meal.available_until);
          return (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealName}>{meal.recipe_name}</Text>
                  <Text style={styles.mealMeta}>Made by {meal.cooked_by_name} · {meal.cuisine_type}</Text>
                </View>
                <View style={styles.portionsBox}>
                  <Text style={styles.portionsNum}>{meal.remaining_portions}</Text>
                  <Text style={styles.portionsLabel}>left</Text>
                </View>
              </View>
              <View style={styles.mealBottom}>
                <Text style={styles.expiry}>
                  {days > 0 ? `Good for ${days} more day${days !== 1 ? 's' : ''}` : 'Expires today'}
                </Text>
                <TouchableOpacity style={styles.eatBtn} onPress={() => handleConsume(meal)}>
                  <Text style={styles.eatBtnText}>Eat a portion</Text>
                </TouchableOpacity>
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
  title: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B6B6B' },
  mealCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginHorizontal: 16, marginBottom: 12 },
  mealTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  mealName: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  mealMeta: { fontSize: 13, color: '#9B9B9B' },
  portionsBox: { backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 52 },
  portionsNum: { fontSize: 22, fontWeight: '800', color: '#16A34A' },
  portionsLabel: { fontSize: 11, color: '#16A34A' },
  mealBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expiry: { fontSize: 13, color: '#6B6B6B' },
  eatBtn: { backgroundColor: '#E85D04', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  eatBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  emptySub: { fontSize: 15, color: '#6B6B6B', textAlign: 'center', paddingHorizontal: 32 },
});
