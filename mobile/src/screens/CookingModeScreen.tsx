import React, { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Animated,
  ScrollView,
  StatusBar,
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
  Button,
  Card,
  ErrorState,
  IconButton,
  Skeleton,
  useHaptics,
  useToast,
} from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'CookingMode'>;

interface CountdownTimerProps {
  seconds: number;
  onDone?: () => void;
}

function CountdownTimer({ seconds, onDone }: CountdownTimerProps) {
  const c = useThemeColors();
  const haptics = useHaptics();
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progress = useRef(new Animated.Value(1)).current;

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setRemaining(seconds);
    progress.setValue(1);
  }, [seconds, progress]);

  useEffect(() => {
    reset();
  }, [seconds, reset]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setRunning(false);
          haptics.notify('success');
          onDone?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onDone, haptics]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: seconds > 0 ? remaining / seconds : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [remaining, seconds, progress]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const progressColor = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [c.error, c.warning, c.success],
  });

  return (
    <Card surface="surface" radius="lg" padding="lg" elevation="card" style={{ marginVertical: spacing.lg }}>
      <View
        style={{
          height: 6,
          backgroundColor: c.surfaceMuted,
          borderRadius: 3,
          overflow: 'hidden',
          marginBottom: spacing.md,
        }}
      >
        <Animated.View style={{ height: '100%', width: progressWidth, backgroundColor: progressColor }} />
      </View>
      <View style={styles.timerRow}>
        <Text
          style={{
            fontSize: 38,
            fontWeight: '800',
            color: c.text,
            letterSpacing: 2,
            fontVariant: ['tabular-nums'],
          }}
        >
          {mm}:{ss}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            label={running ? 'Pause' : remaining === 0 ? 'Done' : 'Start'}
            onPress={() => {
              haptics.impact('light');
              setRunning((r) => !r);
            }}
            disabled={remaining === 0}
            variant={running ? 'secondary' : 'primary'}
            size="md"
          />
          <IconButton icon="↺" accessibilityLabel="Reset timer" onPress={reset} variant="tinted" />
        </View>
      </View>
    </Card>
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
  const slideAnim = useRef(new Animated.Value(0)).current;

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
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <IconButton
          icon="✕"
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
        <View style={[styles.offlineBanner, { backgroundColor: c.warningMuted }]}>
          <Text style={{ color: c.warning, fontWeight: '700', fontSize: 12 }}>
            Offline — using cached recipe
          </Text>
        </View>
      ) : null}

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
              <CountdownTimer
                seconds={step.time_minutes * 60}
                onDone={() => toast.show(`Step ${step.step_number} timer done`, 'info')}
              />
            ) : null}
          </Card>
        </Animated.View>

        {recipe.ingredients.length > 0 ? (
          <View style={{ marginTop: spacing['2xl'] }}>
            <Text style={[typography.h4, { color: c.text, marginBottom: spacing.md }]}>
              Ingredients
            </Text>
            {recipe.ingredients.map((ing: Ingredient) => (
              <View key={ing.id} style={styles.ingRow}>
                <View style={[styles.ingBullet, { backgroundColor: c.primary }]} />
                <Text style={[typography.body, { color: c.text, flex: 1, fontSize: 15 }]}>
                  {ing.quantity} {ing.unit} {ing.ingredient_name}
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
});
