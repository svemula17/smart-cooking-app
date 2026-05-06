import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootStackParamList } from '../types';
import { RootState } from '../store';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

// ─── Data ─────────────────────────────────────────────────────────────────────

const RESTRICTIONS = [
  { label: 'Vegetarian', emoji: '🥦' },
  { label: 'Vegan',      emoji: '🌱' },
  { label: 'Gluten-Free',emoji: '🚫' },
  { label: 'Dairy-Free', emoji: '🥛' },
  { label: 'Nut-Free',   emoji: '🥜' },
  { label: 'Halal',      emoji: '☪️' },
  { label: 'Kosher',     emoji: '✡️' },
  { label: 'Keto',       emoji: '🥩' },
  { label: 'Paleo',      emoji: '🦴' },
  { label: 'Low-Carb',   emoji: '🥗' },
];

const CUISINES = [
  { label: 'Indian',       emoji: '🍛', color: colors.indian },
  { label: 'Chinese',      emoji: '🥢', color: colors.chinese },
  { label: 'Indo-Chinese', emoji: '🍜', color: colors.indoChinese },
  { label: 'Italian',      emoji: '🍝', color: colors.italian },
  { label: 'Mexican',      emoji: '🌮', color: colors.mexican },
  { label: 'Thai',         emoji: '🌶️', color: colors.thai },
  { label: 'Japanese',     emoji: '🍱', color: colors.japanese },
  { label: 'Mediterranean',emoji: '🫒', color: colors.mediterranean },
  { label: 'American',     emoji: '🍔', color: colors.american },
  { label: 'French',       emoji: '🥐', color: colors.french },
];

// ─── Step counter + progress ──────────────────────────────────────────────────

const TOTAL_STEPS = 4; // 0=welcome, 1=goals, 2=restrictions, 3=cuisines

function StepProgress({ current }: { current: number }) {
  if (current === 0) return null;
  return (
    <View style={progressStyles.row}>
      {Array.from({ length: TOTAL_STEPS - 1 }, (_, i) => i + 1).map((s) => (
        <View
          key={s}
          style={[
            progressStyles.segment,
            s <= current ? progressStyles.segmentActive : progressStyles.segmentInactive,
          ]}
        />
      ))}
    </View>
  );
}

const progressStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, paddingHorizontal: 24, marginBottom: 4 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  segmentActive: { backgroundColor: colors.primary },
  segmentInactive: { backgroundColor: colors.border },
});

// ─── OnboardingScreen ─────────────────────────────────────────────────────────

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const [step, setStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 1 — goals
  const [calories, setCalories] = useState('2000');
  const [protein,  setProtein]  = useState('150');
  const [carbs,    setCarbs]    = useState('250');
  const [fat,      setFat]      = useState('65');

  // Step 2 — restrictions
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);

  // Step 3 — cuisines
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  // ── Animation ────────────────────────────────────────────────────────────────

  const goToStep = (next: number) => {
    const direction = next > step ? -1 : 1;
    Animated.timing(slideAnim, { toValue: direction * width, duration: 0, useNativeDriver: true }).start(() => {
      setStep(next);
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }).start();
    });
  };

  // ── Toggle helpers ────────────────────────────────────────────────────────────

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  // ── Finish ────────────────────────────────────────────────────────────────────

  const handleFinish = async () => {
    setLoading(true);
    try {
      await authService.markOnboardingComplete();
    } catch {
      // continue regardless
    } finally {
      setLoading(false);
    }

    if (isAuthenticated) {
      // Already logged in (e.g. came back to onboarding) — save goals and go straight to app
      try {
        await userService.updateGoals({
          calories_goal: parseInt(calories, 10) || 2000,
          protein_goal:  parseInt(protein,  10) || 150,
          carbs_goal:    parseInt(carbs,    10) || 250,
          fat_goal:      parseInt(fat,      10) || 65,
        });
        if (selectedRestrictions.length > 0) {
          await userService.updateRestrictions(selectedRestrictions);
        }
      } catch {
        // best-effort
      }
      navigation.replace('Tabs');
    } else {
      // New user — go to Login/Register, carrying goals so they can be saved after signup
      navigation.replace('Login', {
        initialMode: 'register',
        pendingGoals: {
          calories: parseInt(calories, 10) || 2000,
          protein:  parseInt(protein,  10) || 150,
          carbs:    parseInt(carbs,    10) || 250,
          fat:      parseInt(fat,      10) || 65,
          restrictions: selectedRestrictions,
        },
      });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Back + progress */}
        <View style={styles.topBar}>
          {step > 0 ? (
            <TouchableOpacity onPress={() => goToStep(step - 1)} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <StepProgress current={step} />
        </View>

        {/* Animated step container */}
        <Animated.View style={[styles.stepWrap, { transform: [{ translateX: slideAnim }] }]}>

          {/* ── STEP 0: Welcome ─────────────────────────────────────────────── */}
          {step === 0 && (
            <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.bigEmoji}>🍳</Text>
              <Text style={styles.heading}>Welcome to{'\n'}SmartCooking</Text>
              <Text style={styles.subtitle}>
                Cook smarter with AI-powered recipes and nutrition tracking
              </Text>

              <View style={styles.featureList}>
                {[
                  { emoji: '🥗', text: '30+ curated recipes across 8 cuisines' },
                  { emoji: '📊', text: 'Macro tracking & daily goals' },
                  { emoji: '🤖', text: 'AI cooking assistant' },
                  { emoji: '🛒', text: 'Smart ingredient shopping lists' },
                ].map(({ emoji, text }) => (
                  <View key={text} style={styles.featureRow}>
                    <Text style={styles.featureEmoji}>{emoji}</Text>
                    <Text style={styles.featureText}>{text}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => goToStep(1)}>
                <Text style={styles.primaryBtnText}>Get Started →</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipBtn} onPress={handleFinish}>
                <Text style={styles.skipText}>Skip setup</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── STEP 1: Goals ───────────────────────────────────────────────── */}
          {step === 1 && (
            <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.stepIcon}>🎯</Text>
              <Text style={styles.heading}>Your Daily Goals</Text>
              <Text style={styles.subtitle}>
                We'll recommend recipes that fit your macros
              </Text>

              <View style={styles.inputGroup}>
                {[
                  { label: 'Daily Calories', value: calories, setter: setCalories, unit: 'kcal', color: colors.calories },
                  { label: 'Protein',        value: protein,  setter: setProtein,  unit: 'g',    color: colors.protein },
                  { label: 'Carbs',          value: carbs,    setter: setCarbs,    unit: 'g',    color: colors.carbs },
                  { label: 'Fat',            value: fat,      setter: setFat,      unit: 'g',    color: colors.fat },
                ].map(({ label, value, setter, unit, color }) => (
                  <View key={label} style={styles.inputRow}>
                    <View style={[styles.inputDot, { backgroundColor: color }]} />
                    <Text style={styles.inputLabel}>{label}</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        value={value}
                        onChangeText={setter}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textLight}
                        selectTextOnFocus
                      />
                      <Text style={styles.inputUnit}>{unit}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => goToStep(2)}>
                <Text style={styles.primaryBtnText}>Continue →</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── STEP 2: Restrictions ────────────────────────────────────────── */}
          {step === 2 && (
            <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.stepIcon}>🍽️</Text>
              <Text style={styles.heading}>Dietary Restrictions</Text>
              <Text style={styles.subtitle}>
                We'll filter recipes to match your diet
              </Text>

              <View style={styles.chipsGrid}>
                {RESTRICTIONS.map(({ label, emoji }) => {
                  const selected = selectedRestrictions.includes(label);
                  return (
                    <TouchableOpacity
                      key={label}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleItem(selectedRestrictions, label, setSelectedRestrictions)}
                    >
                      <Text style={styles.chipEmoji}>{emoji}</Text>
                      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => goToStep(3)}>
                <Text style={styles.primaryBtnText}>
                  {selectedRestrictions.length > 0 ? `Continue (${selectedRestrictions.length} selected)` : 'Skip for now →'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── STEP 3: Cuisines ─────────────────────────────────────────────── */}
          {step === 3 && (
            <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.stepIcon}>🌍</Text>
              <Text style={styles.heading}>Favourite Cuisines</Text>
              <Text style={styles.subtitle}>
                Pick the cuisines you love — we'll show them first
              </Text>

              <View style={styles.cuisineGrid}>
                {CUISINES.map(({ label, emoji, color }) => {
                  const selected = selectedCuisines.includes(label);
                  return (
                    <TouchableOpacity
                      key={label}
                      style={[styles.cuisineChip, { backgroundColor: selected ? color : colors.surface }, selected && styles.cuisineChipSelected]}
                      onPress={() => toggleItem(selectedCuisines, label, setSelectedCuisines)}
                    >
                      <Text style={styles.cuisineChipEmoji}>{emoji}</Text>
                      <Text style={[styles.cuisineChipLabel, selected && styles.cuisineChipLabelSelected]}>{label}</Text>
                      {selected && <Text style={styles.cuisineCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                onPress={handleFinish}
                disabled={loading}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? 'Setting up your profile…' : 'Start Cooking! 🚀'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </Animated.View>

        {/* Step dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive, step > i && styles.dotDone]} />
          ))}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  topBar: { paddingHorizontal: 4, paddingTop: 8, paddingBottom: 4 },
  backBtn: { paddingHorizontal: 16, paddingVertical: 6, minHeight: 36, justifyContent: 'center' },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },

  stepWrap: { flex: 1 },
  stepContent: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 32, alignItems: 'center' },

  bigEmoji: { fontSize: 80, marginBottom: 24 },
  stepIcon: { fontSize: 64, marginBottom: 20 },
  heading: { fontSize: 30, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 12, lineHeight: 38 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 },

  // Welcome step
  featureList: { alignSelf: 'stretch', marginBottom: 36, gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 },
  featureEmoji: { fontSize: 22, width: 28, textAlign: 'center' },
  featureText: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },

  primaryBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 17, paddingHorizontal: 40, alignSelf: 'stretch', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  skipBtn: { marginTop: 14, paddingVertical: 10 },
  skipText: { fontSize: 14, color: colors.textSecondary },

  // Goals step
  inputGroup: { alignSelf: 'stretch', marginBottom: 36, gap: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, gap: 10 },
  inputDot: { width: 10, height: 10, borderRadius: 5 },
  inputLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '600' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  textInput: { fontSize: 18, fontWeight: '700', color: colors.primary, width: 68, textAlign: 'right', borderBottomWidth: 2, borderBottomColor: colors.primary, paddingVertical: 2 },
  inputUnit: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', width: 30 },

  // Restrictions step
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'stretch', gap: 10, marginBottom: 36, justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1.5, borderColor: colors.border, gap: 6 },
  chipSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipEmoji: { fontSize: 16 },
  chipLabel: { fontSize: 14, color: colors.text, fontWeight: '500' },
  chipLabelSelected: { color: colors.primaryDark, fontWeight: '700' },

  // Cuisines step
  cuisineGrid: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'stretch', gap: 10, marginBottom: 36, justifyContent: 'center' },
  cuisineChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, gap: 8, borderWidth: 1.5, borderColor: colors.border, minWidth: '44%' },
  cuisineChipSelected: { borderColor: 'transparent' },
  cuisineChipEmoji: { fontSize: 20 },
  cuisineChipLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  cuisineChipLabelSelected: { color: colors.text, fontWeight: '700' },
  cuisineCheck: { fontSize: 14, color: colors.success, fontWeight: '700' },

  // Dots
  dotsRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 24, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 28, backgroundColor: colors.primary },
  dotDone: { backgroundColor: colors.primaryLight },
});
