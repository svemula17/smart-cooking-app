import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import type { Nutrition } from '../types';

interface NutritionCellProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  emoji: string;
}

const NutritionCell: React.FC<NutritionCellProps> = ({ label, value, unit, color, emoji }) => (
  <View style={styles.cell}>
    <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
    <Text style={[styles.value, { color }]}>
      {typeof value === 'number' ? Math.round(value) : '—'}
    </Text>
    <Text style={styles.unit}>{unit}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

export interface NutritionGridProps {
  nutrition: Nutrition;
}

export const NutritionGrid: React.FC<NutritionGridProps> = ({ nutrition }) => (
  <View style={styles.grid}>
    <NutritionCell
      label="Calories"
      value={nutrition.calories}
      unit="kcal"
      color={colors.calories}
      emoji="🔥"
    />
    <NutritionCell
      label="Protein"
      value={nutrition.protein_g}
      unit="g"
      color={colors.protein}
      emoji="💪"
    />
    <NutritionCell
      label="Carbs"
      value={nutrition.carbs_g}
      unit="g"
      color={colors.carbs}
      emoji="🌾"
    />
    <NutritionCell
      label="Fat"
      value={nutrition.fat_g}
      unit="g"
      color={colors.fat}
      emoji="🥑"
    />
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emoji: {
    fontSize: 18,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 10,
    color: colors.textLight,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
