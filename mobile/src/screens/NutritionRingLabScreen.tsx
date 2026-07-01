import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';

import { RootStackParamList } from '../types';
import { RootState, type AppDispatch } from '../store';
import { setRingPalette } from '../store/slices/settingsSlice';
import { RING_PALETTES, RING_PALETTE_ORDER } from '../theme/ringPalettes';
import { GoalRing } from '../components/GoalRing';
import { Card, Header, Icon } from '../components/ui';
import { useThemeColors } from '../theme/useThemeColors';
import { useHaptics } from '../components/ui/useHaptics';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'NutritionRingLab'>;

// Representative sample progress so every ring shows a partial fill.
const MACROS: { label: string; key: 'calories' | 'protein' | 'carbs' | 'fat'; current: number; goal: number }[] = [
  { label: 'Calories', key: 'calories', current: 1450, goal: 2000 },
  { label: 'Protein', key: 'protein', current: 88, goal: 120 },
  { label: 'Carbs', key: 'carbs', current: 150, goal: 250 },
  { label: 'Fat', key: 'fat', current: 40, goal: 65 },
];

export default function NutritionRingLabScreen({ navigation }: Props) {
  const c = useThemeColors();
  const dispatch = useDispatch<AppDispatch>();
  const haptics = useHaptics();
  const selected = useSelector((s: RootState) => s.settings.ringPalette);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <Header title="Nutrition rings" border onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}>
        <Text style={[typography.body, { color: c.textSecondary, marginBottom: spacing.md }]}>
          Same rings, different colors. Tap a palette — it applies to your Home
          daily-goal rings instantly.
        </Text>

        {RING_PALETTE_ORDER.map((key) => {
          const p = RING_PALETTES[key];
          const isSel = selected === key;
          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ selected: isSel }}
              onPress={() => {
                haptics.impact();
                dispatch(setRingPalette(key));
              }}
            >
              <Card
                surface="surface"
                radius="xl"
                padding="md"
                elevation="card"
                bordered
                style={[styles.card, isSel ? { borderColor: c.primary, borderWidth: 2 } : null]}
              >
                <View style={styles.head}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.h3, { color: c.text }]}>{p.name}</Text>
                    <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
                      {p.desc}
                    </Text>
                  </View>
                  {isSel ? (
                    <View style={[styles.badge, { backgroundColor: c.primary }]}>
                      <Icon name="check" size={14} color={c.onPrimary} />
                      <Text style={[typography.caption, { color: c.onPrimary, fontWeight: '700' }]}>
                        On Home
                      </Text>
                    </View>
                  ) : (
                    <Text style={[typography.button, { color: c.primary }]}>Use</Text>
                  )}
                </View>

                <View style={styles.ringRow}>
                  {MACROS.map((m) => {
                    const color = p.colors[m.key];
                    return (
                      <GoalRing
                        key={m.label}
                        label={m.label}
                        current={m.current}
                        goal={m.goal}
                        color={color}
                        trackColor={`${color}26`}
                        size={60}
                      />
                    );
                  })}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  ringRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
