import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Chip, Icon, IconButton, Sheet, useToast } from './ui';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { nutritionService, type MealType } from '../services/nutritionService';
import type { Recipe } from '../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface LogMealSheetProps {
  visible: boolean;
  onClose: () => void;
  recipe: Recipe & {
    nutrition?: {
      calories: number;
      protein_g: number | string;
      carbs_g: number | string;
      fat_g: number | string;
    } | null;
  };
}

const SERVING_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];

const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🥞' },
  { value: 'lunch',     label: 'Lunch',     emoji: '🥗' },
  { value: 'dinner',    label: 'Dinner',    emoji: '🍝' },
  { value: 'snack',     label: 'Snack',     emoji: '🍎' },
];

function num(value: number | string | undefined): number {
  if (value === undefined || value === null) return 0;
  return typeof value === 'string' ? parseFloat(value) : value;
}

/**
 * A bottom-sheet for logging that the user just ate a recipe. Lets them
 * adjust how many servings they consumed (with a live nutrition preview
 * that scales the recipe's per-serving macros) before submitting.
 */
export function LogMealSheet({ visible, onClose, recipe }: LogMealSheetProps): React.JSX.Element {
  const c = useThemeColors();
  const toast = useToast();
  const user = useSelector((s: RootState) => s.auth.user);

  const [servings, setServings] = useState(1.0);
  const [mealType, setMealType] = useState<MealType>(() => suggestMealType());
  const [submitting, setSubmitting] = useState(false);

  // Live-scaled nutrition (numbers; nutrition columns sometimes come back as strings)
  const cal = num(recipe.nutrition?.calories);
  const protein = num(recipe.nutrition?.protein_g);
  const carbs = num(recipe.nutrition?.carbs_g);
  const fat = num(recipe.nutrition?.fat_g);

  const scaledCal = Math.round(cal * servings);
  const scaledProtein = Math.round(protein * servings * 10) / 10;
  const scaledCarbs = Math.round(carbs * servings * 10) / 10;
  const scaledFat = Math.round(fat * servings * 10) / 10;

  const handleSubmit = async () => {
    if (!user) {
      toast.show('Sign in to log meals', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await nutritionService.log({
        user_id: user.id,
        recipe_id: recipe.id,
        servings_consumed: servings,
        meal_type: mealType,
        date: new Date().toISOString().split('T')[0],
        auto_logged: false,
      });
      toast.show(`Logged ${scaledCal} cal`, 'success');
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ??
        err?.message ??
        'Could not log this meal. Try again?';
      toast.show(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Log this meal">
      <View style={styles.body}>
        <Text style={[typography.h3, { color: c.text }]}>{recipe.name}</Text>
        <Text style={[typography.caption, { color: c.textSecondary, marginBottom: spacing.lg }]}>
          {recipe.servings} servings per recipe
        </Text>

        {/* Servings stepper */}
        <Text style={[typography.label, { color: c.textSecondary, marginBottom: spacing.sm }]}>
          How many servings did you eat?
        </Text>
        <View style={styles.servingRow}>
          <IconButton
            icon={<Icon name="minus" size={18} />}
            size={44}
            accessibilityLabel="Less"
            onPress={() => setServings((s) => prevServing(s))}
          />
          <View style={[styles.servingDisplay, { backgroundColor: c.surfaceMuted }]}>
            <Text style={[typography.h2, { color: c.text }]}>{servings}</Text>
            <Text style={[typography.caption, { color: c.textSecondary }]}>servings</Text>
          </View>
          <IconButton
            icon={<Icon name="plus" size={18} />}
            size={44}
            accessibilityLabel="More"
            onPress={() => setServings((s) => nextServing(s))}
          />
        </View>

        {/* Nutrition preview (live) */}
        <View
          style={[
            styles.macroBox,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View style={styles.macroRow}>
            <Macro label="Calories" value={`${scaledCal}`} unit="cal" color={c.calories} />
            <Macro label="Protein" value={`${scaledProtein}`} unit="g" color={c.protein} />
          </View>
          <View style={[styles.macroRow, { marginTop: spacing.sm }]}>
            <Macro label="Carbs" value={`${scaledCarbs}`} unit="g" color={c.carbs} />
            <Macro label="Fat" value={`${scaledFat}`} unit="g" color={c.fat} />
          </View>
        </View>

        {/* Meal type chips */}
        <Text style={[typography.label, { color: c.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Meal
        </Text>
        <View style={styles.mealRow}>
          {MEAL_TYPES.map((m) => (
            <Chip
              key={m.value}
              label={`${m.emoji} ${m.label}`}
              selected={mealType === m.value}
              onPress={() => setMealType(m.value)}
              style={{ flex: 1, justifyContent: 'center' }}
            />
          ))}
        </View>

        {/* Submit */}
        <Button
          label="Log meal"
          variant="primary"
          fullWidth
          size="lg"
          loading={submitting}
          onPress={handleSubmit}
          style={{ marginTop: spacing.xl }}
          hapticStyle="medium"
        />
      </View>
    </Sheet>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function prevServing(current: number): number {
  const idx = SERVING_OPTIONS.findIndex((s) => s >= current);
  if (idx <= 0) return SERVING_OPTIONS[0];
  return SERVING_OPTIONS[idx - 1];
}

function nextServing(current: number): number {
  const idx = SERVING_OPTIONS.findIndex((s) => s > current);
  if (idx === -1) return SERVING_OPTIONS[SERVING_OPTIONS.length - 1];
  return SERVING_OPTIONS[idx];
}

function suggestMealType(): MealType {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

function Macro({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}): React.JSX.Element {
  const c = useThemeColors();
  return (
    <View style={styles.macroCell}>
      <Text style={[typography.caption, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[typography.h3, { color }]}>
        {value}
        <Text style={[typography.caption, { color: c.textSecondary }]}> {unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  servingDisplay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  macroBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  macroRow: {
    flexDirection: 'row',
  },
  macroCell: {
    flex: 1,
  },
  mealRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});

export default LogMealSheet;
