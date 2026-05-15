import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { RootStackParamList } from '../types';
import { RootState } from '../store';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';
import { typography } from '../theme/typography';
import { Button, Card, Chip, IconButton, TextField } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const RESTRICTIONS = [
  { label: 'Vegetarian', emoji: '🥦' },
  { label: 'Vegan', emoji: '🌱' },
  { label: 'Gluten-Free', emoji: '🚫' },
  { label: 'Dairy-Free', emoji: '🥛' },
  { label: 'Nut-Free', emoji: '🥜' },
  { label: 'Halal', emoji: '☪️' },
  { label: 'Kosher', emoji: '✡️' },
  { label: 'Keto', emoji: '🥩' },
  { label: 'Paleo', emoji: '🦴' },
  { label: 'Low-Carb', emoji: '🥗' },
];

const CUISINES = [
  { label: 'Indian', emoji: '🍛' },
  { label: 'Chinese', emoji: '🥢' },
  { label: 'Indo-Chinese', emoji: '🍜' },
  { label: 'Italian', emoji: '🍝' },
  { label: 'Mexican', emoji: '🌮' },
  { label: 'Thai', emoji: '🌶️' },
  { label: 'Japanese', emoji: '🍱' },
  { label: 'Mediterranean', emoji: '🫒' },
  { label: 'American', emoji: '🍔' },
  { label: 'French', emoji: '🥐' },
];

const TOTAL_STEPS = 4;

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const c = useThemeColors();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const [step, setStep] = useState(0);
  const [calories, setCalories] = useState('2000');
  const [protein, setProtein] = useState('150');
  const [carbs, setCarbs] = useState('250');
  const [fat, setFat] = useState('65');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) =>
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  const finish = async () => {
    setLoading(true);
    try {
      await authService.markOnboardingComplete();
    } catch {
      // continue
    }
    if (isAuthenticated) {
      try {
        await userService.updateGoals({
          calories_goal: parseInt(calories, 10) || 2000,
          protein_goal: parseInt(protein, 10) || 150,
          carbs_goal: parseInt(carbs, 10) || 250,
          fat_goal: parseInt(fat, 10) || 65,
        });
        if (restrictions.length > 0) await userService.updateRestrictions(restrictions);
      } catch {
        // best-effort
      }
      navigation.replace('Tabs');
    } else {
      navigation.replace('Login', {
        initialMode: 'register',
        pendingGoals: {
          calories: parseInt(calories, 10) || 2000,
          protein: parseInt(protein, 10) || 150,
          carbs: parseInt(carbs, 10) || 250,
          fat: parseInt(fat, 10) || 65,
          restrictions,
        },
      });
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={{ width: 44 }}>
            {step > 0 ? (
              <IconButton
                icon="‹"
                size={40}
                accessibilityLabel="Back"
                onPress={() => setStep((s) => s - 1)}
              />
            ) : null}
          </View>
          <View style={{ flex: 1, paddingHorizontal: spacing.md }}>
            {step > 0 ? (
              <View style={styles.progressRow}>
                {Array.from({ length: TOTAL_STEPS - 1 }, (_, i) => i + 1).map((s) => (
                  <View
                    key={s}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: s <= step ? c.primary : c.border,
                    }}
                  />
                ))}
              </View>
            ) : null}
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.stepContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 && (
            <>
              <Text style={styles.bigEmoji}>🍳</Text>
              <Text style={[typography.display, { color: c.text, textAlign: 'center' }]}>
                Welcome to{'\n'}SmartCooking
              </Text>
              <Text
                style={[
                  typography.body,
                  {
                    color: c.textSecondary,
                    textAlign: 'center',
                    marginTop: spacing.md,
                    fontSize: 16,
                  },
                ]}
              >
                Cook smarter with AI-powered recipes and nutrition tracking
              </Text>

              <View style={{ alignSelf: 'stretch', marginTop: spacing['2xl'], gap: spacing.md }}>
                {[
                  { emoji: '🥗', text: '30+ curated recipes across 8 cuisines' },
                  { emoji: '📊', text: 'Macro tracking & daily goals' },
                  { emoji: '🤖', text: 'AI cooking assistant' },
                  { emoji: '🛒', text: 'Smart ingredient shopping lists' },
                ].map(({ emoji, text }) => (
                  <Card
                    key={text}
                    surface="surfaceMuted"
                    radius="lg"
                    padding="lg"
                    elevation="flat"
                  >
                    <View style={styles.featureRow}>
                      <Text style={{ fontSize: 22, width: 28, textAlign: 'center' }}>{emoji}</Text>
                      <Text style={[typography.body, { color: c.text, fontWeight: '500', flex: 1 }]}>
                        {text}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>

              <Button
                label="Get Started"
                size="lg"
                fullWidth
                onPress={() => setStep(1)}
                style={{ marginTop: spacing['2xl'] }}
              />
              <Text
                accessibilityRole="button"
                onPress={finish}
                style={[
                  typography.body,
                  { color: c.textSecondary, marginTop: spacing.md, fontWeight: '600' },
                ]}
              >
                Skip setup
              </Text>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.stepIcon}>🎯</Text>
              <Text style={[typography.h1, { color: c.text, textAlign: 'center' }]}>
                Your daily goals
              </Text>
              <Text
                style={[
                  typography.body,
                  { color: c.textSecondary, textAlign: 'center', marginTop: spacing.sm },
                ]}
              >
                We’ll recommend recipes that fit your macros
              </Text>

              <View style={{ alignSelf: 'stretch', marginTop: spacing['2xl'], gap: spacing.md }}>
                <TextField
                  label="Calories (kcal)"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TextField
                  label="Protein (g)"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TextField
                  label="Carbs (g)"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TextField
                  label="Fat (g)"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
              </View>

              <Button
                label="Continue"
                size="lg"
                fullWidth
                onPress={() => setStep(2)}
                style={{ marginTop: spacing['2xl'] }}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.stepIcon}>🍽️</Text>
              <Text style={[typography.h1, { color: c.text, textAlign: 'center' }]}>
                Dietary restrictions
              </Text>
              <Text
                style={[
                  typography.body,
                  { color: c.textSecondary, textAlign: 'center', marginTop: spacing.sm },
                ]}
              >
                We’ll filter recipes to match your diet
              </Text>

              <View style={styles.chipsGrid}>
                {RESTRICTIONS.map(({ label, emoji }) => (
                  <Chip
                    key={label}
                    label={`${emoji}  ${label}`}
                    selected={restrictions.includes(label)}
                    onPress={() => toggle(restrictions, label, setRestrictions)}
                  />
                ))}
              </View>

              <Button
                label={
                  restrictions.length > 0
                    ? `Continue (${restrictions.length} selected)`
                    : 'Skip for now'
                }
                size="lg"
                fullWidth
                onPress={() => setStep(3)}
                style={{ marginTop: spacing['2xl'] }}
              />
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.stepIcon}>🌍</Text>
              <Text style={[typography.h1, { color: c.text, textAlign: 'center' }]}>
                Favourite cuisines
              </Text>
              <Text
                style={[
                  typography.body,
                  { color: c.textSecondary, textAlign: 'center', marginTop: spacing.sm },
                ]}
              >
                We’ll show your favourites first
              </Text>

              <View style={styles.chipsGrid}>
                {CUISINES.map(({ label, emoji }) => (
                  <Chip
                    key={label}
                    label={`${emoji}  ${label}`}
                    selected={cuisines.includes(label)}
                    onPress={() => toggle(cuisines, label, setCuisines)}
                  />
                ))}
              </View>

              <Button
                label="Start Cooking"
                size="lg"
                fullWidth
                loading={loading}
                onPress={finish}
                hapticStyle="medium"
                style={{ marginTop: spacing['2xl'] }}
              />
            </>
          )}
        </ScrollView>

        {/* Step dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                width: step === i ? 28 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  step === i ? c.primary : step > i ? c.primaryMuted : c.border,
              }}
            />
          ))}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  progressRow: { flexDirection: 'row', gap: spacing.xs },
  stepContent: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.sm,
    paddingBottom: spacing['3xl'],
    alignItems: 'center',
  },
  bigEmoji: { fontSize: 80, marginBottom: spacing.lg },
  stepIcon: { fontSize: 64, marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
