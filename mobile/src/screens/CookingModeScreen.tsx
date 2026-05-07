import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { recipeService } from '../services/recipeService';
import { pantryService } from '../services/pantryService';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';
import type { RootState } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'CookingMode'>;

// ─── CountdownTimer ──────────────────────────────────────────────────────────

interface CountdownTimerProps {
  seconds: number;
  onDone?: () => void;
}

function CountdownTimer({ seconds, onDone }: CountdownTimerProps) {
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

  // Reset when the prop changes (new step)
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
          onDone?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onDone]);

  // Animate progress bar
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
    outputRange: [colors.error, colors.warning, colors.success],
  });

  return (
    <View style={timerStyles.container}>
      <View style={timerStyles.track}>
        <Animated.View
          style={[timerStyles.fill, { width: progressWidth, backgroundColor: progressColor }]}
        />
      </View>
      <View style={timerStyles.row}>
        <Text style={timerStyles.time}>
          {mm}:{ss}
        </Text>
        <View style={timerStyles.buttons}>
          <TouchableOpacity
            style={[timerStyles.btn, running ? timerStyles.pauseBtn : timerStyles.startBtn]}
            onPress={() => setRunning((r) => !r)}
            disabled={remaining === 0}
          >
            <Text style={timerStyles.btnText}>{running ? 'Pause' : remaining === 0 ? 'Done' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={timerStyles.resetBtn} onPress={reset}>
            <Text style={timerStyles.resetText}>↺</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const timerStyles = StyleSheet.create({
  container: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginVertical: 16 },
  track: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  fill: { height: '100%', borderRadius: 3 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: 2, fontVariant: ['tabular-nums'] },
  buttons: { flexDirection: 'row', gap: 10 },
  btn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  startBtn: { backgroundColor: colors.primary },
  pauseBtn: { backgroundColor: colors.warning },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  resetBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  resetText: { fontSize: 18, color: colors.textSecondary },
});

// ─── CookingModeScreen ────────────────────────────────────────────────────────

export function CookingModeScreen({ route, navigation }: Props): React.JSX.Element {
  const { recipeId } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const qc = useQueryClient();
  const pantryItems = useSelector((s: RootState) => s.pantry.items);

  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ['recipe-detail', recipeId],
    queryFn: () => recipeService.getById(recipeId),
  });

  const deductMutation = useMutation({
    mutationFn: (ingredients: Array<{ name: string; quantity: number; unit: string }>) =>
      pantryService.deduct(ingredients),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry'] });
    },
  });

  const steps = recipe?.instructions ?? [];
  const step = steps[currentStep];
  const totalSteps = steps.length;

  const animateSlide = useCallback(
    (direction: 'left' | 'right', cb: () => void) => {
      const toValue = direction === 'left' ? -300 : 300;
      Animated.sequence([
        Animated.timing(slideAnim, { toValue, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: direction === 'left' ? 300 : -300, duration: 0, useNativeDriver: true }),
      ]).start(() => {
        cb();
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      });
    },
    [slideAnim],
  );

  const goNext = useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      // Deduct pantry ingredients matching recipe ingredients
      if (recipe?.ingredients && pantryItems.length > 0) {
        const toDeduct = recipe.ingredients
          .filter((ing) =>
            pantryItems.some((p) =>
              p.name.toLowerCase().includes(ing.ingredient_name.toLowerCase()) ||
              ing.ingredient_name.toLowerCase().includes(p.name.toLowerCase()),
            ),
          )
          .map((ing) => ({ name: ing.ingredient_name, quantity: ing.quantity ?? 1, unit: ing.unit ?? 'units' }));
        if (toDeduct.length > 0) {
          deductMutation.mutate(toDeduct);
          Alert.alert(
            '🎉 Recipe Complete!',
            `Great job! Deducted ${toDeduct.length} ingredient${toDeduct.length > 1 ? 's' : ''} from your pantry.`,
            [{ text: 'Back to Recipe', onPress: () => navigation.goBack() }],
          );
          return;
        }
      }
      Alert.alert('🎉 Recipe Complete!', 'Great job! You finished cooking.', [
        { text: 'Back to Recipe', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    animateSlide('left', () => setCurrentStep((s) => s + 1));
  }, [currentStep, totalSteps, animateSlide, navigation, recipe, pantryItems, deductMutation]);

  const goPrev = useCallback(() => {
    if (currentStep === 0) return;
    animateSlide('right', () => setCurrentStep((s) => s - 1));
  }, [currentStep, animateSlide]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading recipe…</Text>
      </View>
    );
  }

  if (isError || !recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load recipe.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.recipeName} numberOfLines={1}>{recipe.name}</Text>
        <Text style={styles.stepCounter}>{currentStep + 1}/{totalSteps}</Text>
      </View>

      {/* Step dots */}
      <View style={styles.dots}>
        {steps.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentStep && styles.dotActive, i < currentStep && styles.dotDone]}
          />
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Step card */}
        {step ? (
          <Animated.View style={[styles.stepCard, { transform: [{ translateX: slideAnim }] }]}>
            <Text style={styles.stepLabel}>STEP {step.step_number}</Text>
            <Text style={styles.instruction}>{step.instruction}</Text>

            {/* Timer — only if step has a time */}
            {step.time_minutes && step.time_minutes > 0 ? (
              <CountdownTimer
                seconds={step.time_minutes * 60}
                onDone={() =>
                  Alert.alert('⏱ Timer Done', `Step ${step.step_number} timer is up!`, [{ text: 'OK' }])
                }
              />
            ) : null}
          </Animated.View>
        ) : null}

        {/* Ingredients reminder (collapsed on first render if many) */}
        {recipe.ingredients.length > 0 && (
          <View style={styles.ingredientSection}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ing) => (
              <View key={ing.id} style={styles.ingRow}>
                <View style={styles.ingBullet} />
                <Text style={styles.ingText}>
                  {ing.quantity} {ing.unit} {ing.ingredient_name}
                  {ing.notes ? <Text style={styles.ingNote}> ({ing.notes})</Text> : null}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navBtn, styles.navPrev, currentStep === 0 && styles.navDisabled]}
          onPress={goPrev}
          disabled={currentStep === 0}
        >
          <Text style={[styles.navBtnText, currentStep === 0 && styles.navBtnTextDisabled]}>← Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, styles.navNext]} onPress={goNext}>
          <Text style={styles.navBtnTextActive}>
            {currentStep >= totalSteps - 1 ? 'Finish 🎉' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default CookingModeScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 12, color: colors.textSecondary },
  errorText: { color: colors.error, fontSize: 16, marginBottom: 16 },
  backBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  backBtnText: { color: '#fff', fontWeight: '700' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  closeBtn: { fontSize: 18, color: colors.textSecondary, width: 28 },
  recipeName: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center', marginHorizontal: 8 },
  stepCounter: { fontSize: 14, color: colors.textSecondary, width: 36, textAlign: 'right' },

  dots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 12, gap: 6, flexWrap: 'wrap', paddingHorizontal: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  dotDone: { backgroundColor: colors.primaryLight },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 32 },

  stepCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  stepLabel: { fontSize: 12, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 },
  instruction: { fontSize: 20, color: colors.text, lineHeight: 30, fontWeight: '400' },

  ingredientSection: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  ingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  ingBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 8, marginRight: 10 },
  ingText: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  ingNote: { color: colors.textSecondary, fontStyle: 'italic' },

  navBar: { flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.divider },
  navBtn: { flex: 1, paddingVertical: 16, borderRadius: 24, alignItems: 'center' },
  navPrev: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  navNext: { backgroundColor: colors.primary },
  navDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  navBtnTextDisabled: { color: colors.textLight },
  navBtnTextActive: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
