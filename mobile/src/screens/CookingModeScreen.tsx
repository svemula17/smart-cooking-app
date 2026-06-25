import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ThemedStatusBar } from "../components/ThemedStatusBar";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { recipeService } from '../services/recipeService';
import { pantryService } from '../services/pantryService';
import type { RootStackParamList, RecipeWithDetails, Ingredient, RecipeStep } from '../types';
import type { RootState } from '../store';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';
import { typography } from '../theme/typography';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Icon,
  IconButton,
  Skeleton,
  useHaptics,
  useToast,
} from '../components/ui';
import { ActiveTimersBar } from '../components/ActiveTimersBar';
import { useCookingTimers } from '../hooks/useCookingTimers';
import { formatScaled } from '../utils/scaleQuantity';

type Props = NativeStackScreenProps<RootStackParamList, 'CookingMode'>;

// Inline "start this step's timer" button — pushes into the shared pool
// (managed by useCookingTimers) so it persists across step navigation.
interface StartTimerButtonProps {
  label: string;
  seconds: number;
  isQueued: boolean;
  onAdd: () => void;
}
function StartTimerButton({ label, seconds, isQueued, onAdd }: StartTimerButtonProps) {
  const c = useThemeColors();
  const mins = Math.round(seconds / 60);
  return (
    <Card surface="surfaceMuted" radius="lg" padding="lg" elevation="flat" style={{ marginTop: spacing.lg }}>
      <View style={styles.timerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.overline, { color: c.textSecondary }]}>STEP TIMER</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, marginTop: 2 }}>
            {mins} min · {label}
          </Text>
        </View>
        <Button
          label={isQueued ? 'Running ↓' : '▶ Start'}
          onPress={onAdd}
          disabled={isQueued}
          variant={isQueued ? 'secondary' : 'primary'}
          size="md"
        />
      </View>
    </Card>
  );
}

// Compact +/− servings stepper rendered in the header
function ServingsStepper({
  value,
  base,
  onChange,
}: {
  value: number;
  base: number;
  onChange: (next: number) => void;
}) {
  const c = useThemeColors();
  return (
    <View style={[styles.stepper, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}>
      <IconButton
        icon={<Icon name="minus" size={16} />}
        size={28}
        accessibilityLabel="Decrease servings"
        onPress={() => onChange(Math.max(1, value - 1))}
      />
      <View style={{ alignItems: 'center', minWidth: 48 }}>
        <Text style={{ color: c.text, fontWeight: '800', fontSize: 14 }}>
          {value} {value === 1 ? 'serving' : 'servings'}
        </Text>
        {value !== base ? (
          <Text style={[typography.caption, { color: c.textSecondary, fontSize: 10 }]}>
            ({base} default)
          </Text>
        ) : null}
      </View>
      <IconButton
        icon={<Icon name="plus" size={16} />}
        size={28}
        accessibilityLabel="Increase servings"
        onPress={() => onChange(Math.min(20, value + 1))}
      />
    </View>
  );
}

export function CookingModeScreen({ route, navigation }: Props): React.JSX.Element {
  const { recipeId } = route.params;
  const c = useThemeColors();
  const haptics = useHaptics();
  const toast = useToast();
  const qc = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [offlineRecipe, setOfflineRecipe] = useState<RecipeWithDetails | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [servings, setServings] = useState<number | null>(null);
  // Stable map of step index → timer id (so the same step's timer doesn't
  // get added twice).
  const [stepTimerIds, setStepTimerIds] = useState<Record<number, string>>({});
  const slideAnim = useRef(new Animated.Value(0)).current;

  const timers = useCookingTimers((label) => toast.show(`⏰ ${label}`, 'success'));

  const pantryItems = useSelector((s: RootState) => s.pantry.items);

  useEffect(() => {
    AsyncStorage.getItem(`offline_recipe_${recipeId}`)
      .then((raw) => {
        if (raw) setOfflineRecipe(JSON.parse(raw));
      })
      .catch(() => {});
  }, [recipeId]);

  const { data: networkRecipe, isLoading, isError, refetch } = useQuery<RecipeWithDetails>({
    queryKey: ['recipe-detail', recipeId],
    queryFn: () => recipeService.getById(recipeId),
  });

  useEffect(() => {
    if (networkRecipe) {
      AsyncStorage.setItem(
        `offline_recipe_${recipeId}`,
        JSON.stringify(networkRecipe)
      ).catch(() => {});
      setIsOffline(false);
    } else if (offlineRecipe && isError) {
      setIsOffline(true);
    }
  }, [networkRecipe, recipeId, offlineRecipe, isError]);

  const recipe = networkRecipe ?? offlineRecipe;

  // Initialize servings on first load from the recipe's default
  useEffect(() => {
    if (recipe && servings === null) setServings(recipe.servings ?? 4);
  }, [recipe, servings]);
  const baseServings = recipe?.servings ?? 4;
  const effectiveServings = servings ?? baseServings;
  const scaleFactor = useMemo(
    () => (baseServings > 0 ? effectiveServings / baseServings : 1),
    [baseServings, effectiveServings],
  );

  const deduct = useMutation({
    mutationFn: (ingredients: Array<{ name: string; quantity: number; unit: string }>) =>
      pantryService.deduct(ingredients),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pantry'] }),
  });

  const steps: RecipeStep[] = recipe?.instructions ?? [];
  const step = steps[currentStep];
  const totalSteps = steps.length;

  const animateSlide = useCallback(
    (dir: 'left' | 'right', cb: () => void) => {
      const toValue = dir === 'left' ? -300 : 300;
      Animated.sequence([
        Animated.timing(slideAnim, { toValue, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, {
          toValue: dir === 'left' ? 300 : -300,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        cb();
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      });
    },
    [slideAnim]
  );

  const goNext = useCallback(() => {
    haptics.impact('medium');
    if (currentStep >= totalSteps - 1) {
      if (recipe?.ingredients && pantryItems.length > 0) {
        const toDeduct = recipe.ingredients
          .filter((ing: Ingredient) =>
            pantryItems.some(
              (p) =>
                p.name.toLowerCase().includes(ing.ingredient_name.toLowerCase()) ||
                ing.ingredient_name.toLowerCase().includes(p.name.toLowerCase())
            )
          )
          .map((ing: Ingredient) => ({
            name: ing.ingredient_name,
            quantity: ing.quantity ?? 1,
            unit: ing.unit ?? 'units',
          }));
        if (toDeduct.length > 0) {
          deduct.mutate(toDeduct);
          toast.show(`Deducted ${toDeduct.length} ingredient${toDeduct.length > 1 ? 's' : ''}`, 'success');
        }
      }
      haptics.notify('success');
      toast.show('🎉 Recipe complete', 'success');
      setTimeout(() => navigation.goBack(), 800);
      return;
    }
    animateSlide('left', () => setCurrentStep((s) => s + 1));
  }, [currentStep, totalSteps, animateSlide, navigation, recipe, pantryItems, deduct, haptics, toast]);

  const goPrev = useCallback(() => {
    if (currentStep === 0) return;
    haptics.selection();
    animateSlide('right', () => setCurrentStep((s) => s - 1));
  }, [currentStep, animateSlide, haptics]);

  if (isLoading && !offlineRecipe) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Skeleton height={20} width="60%" />
          <Skeleton height={200} radius={radii.lg} />
        </View>
      </SafeAreaView>
    );
  }

  if ((isError || !recipe) && !offlineRecipe) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        <ErrorState
          title="Couldn’t load recipe"
          body="Check your connection and try again."
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  if (!recipe || !step) return <View />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <ThemedStatusBar />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <IconButton
          icon={<Icon name="x" size={20} />}
          size={36}
          accessibilityLabel="Close cooking mode"
          onPress={() => navigation.goBack()}
        />
        <Text style={[typography.h4, { flex: 1, textAlign: 'center', color: c.text }]} numberOfLines={1}>
          {recipe.name}
        </Text>
        <Text style={[typography.label, { color: c.textSecondary, width: 36, textAlign: 'right' }]}>
          {currentStep + 1}/{totalSteps}
        </Text>
      </View>

      {isOffline ? (
        <View style={[styles.offlineBanner, { backgroundColor: c.surfaceMuted }]}>
          <Text style={{ color: c.textSecondary, fontWeight: '700', fontSize: 12 }}>
            Offline — using cached recipe
          </Text>
        </View>
      ) : null}

      {/* Servings scaler */}
      <View style={styles.scalerRow}>
        <ServingsStepper value={effectiveServings} base={baseServings} onChange={setServings} />
      </View>

      {/* Step dots */}
      <View style={styles.dots}>
        {steps.map((_step: RecipeStep, i: number) => (
          <View
            key={i}
            style={{
              width: i === currentStep ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                i === currentStep ? c.primary : i < currentStep ? c.primaryMuted : c.border,
            }}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          <Card surface="surface" radius="2xl" padding="2xl" elevation="card">
            <Text
              style={[
                typography.overline,
                { color: c.primary, marginBottom: spacing.md },
              ]}
            >
              STEP {step.step_number}
            </Text>
            <Text
              style={{
                fontSize: 22,
                lineHeight: 32,
                color: c.text,
                fontWeight: '500',
              }}
            >
              {step.instruction}
            </Text>
            {step.time_minutes && step.time_minutes > 0 ? (
              <StartTimerButton
                label={`Step ${step.step_number}`}
                seconds={step.time_minutes * 60}
                isQueued={
                  stepTimerIds[currentStep] != null &&
                  timers.list.some((t) => t.id === stepTimerIds[currentStep])
                }
                onAdd={() => {
                  const id = timers.add(
                    `Step ${step.step_number} — ${recipe.name.split(' ').slice(0, 3).join(' ')}`,
                    step.time_minutes! * 60,
                  );
                  setStepTimerIds((prev) => ({ ...prev, [currentStep]: id }));
                  haptics.impact('light');
                }}
              />
            ) : null}
          </Card>
        </Animated.View>

        {recipe.ingredients.length > 0 ? (
          <View style={{ marginTop: spacing['2xl'] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
              <Text style={[typography.h4, { color: c.text }]}>Ingredients</Text>
              {scaleFactor !== 1 ? (
                <Badge label={`×${scaleFactor.toFixed(scaleFactor % 1 === 0 ? 0 : 2)}`} tone="primary" />
              ) : null}
            </View>
            {recipe.ingredients.map((ing: Ingredient) => (
              <View key={ing.id} style={styles.ingRow}>
                <View style={[styles.ingBullet, { backgroundColor: c.primary }]} />
                <Text style={[typography.body, { color: c.text, flex: 1, fontSize: 15 }]}>
                  {formatScaled(ing.quantity, scaleFactor)} {ing.unit} {ing.ingredient_name}
                  {ing.notes ? (
                    <Text style={{ color: c.textSecondary, fontStyle: 'italic' }}>
                      {' '}
                      ({ing.notes})
                    </Text>
                  ) : null}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* Active timers — persists across step navigation */}
      <ActiveTimersBar
        timers={timers.list}
        onToggle={timers.toggle}
        onReset={timers.reset}
        onRemove={timers.remove}
      />

      {/* Nav buttons */}
      <View style={[styles.navBar, { borderTopColor: c.border }]}>
        <Button
          label="← Previous"
          onPress={goPrev}
          variant="secondary"
          disabled={currentStep === 0}
          fullWidth
          size="lg"
          style={{ flex: 1 }}
        />
        <Button
          label={currentStep >= totalSteps - 1 ? 'Finish 🎉' : 'Next →'}
          onPress={goNext}
          fullWidth
          size="lg"
          hapticStyle="medium"
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

export default CookingModeScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  offlineBanner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  ingBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  navBar: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  scalerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    gap: spacing.xs,
  },
});
