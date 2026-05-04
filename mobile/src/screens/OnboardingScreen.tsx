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

const RESTRICTIONS = [
  { label: 'Vegetarian', emoji: '🥦' },
  { label: 'Vegan', emoji: '🌱' },
  { label: 'Gluten-Free', emoji: '🚫🌾' },
  { label: 'Dairy-Free', emoji: '🥛' },
  { label: 'Nut-Free', emoji: '🥜' },
  { label: 'Halal', emoji: '☪️' },
  { label: 'Kosher', emoji: '✡️' },
  { label: 'Keto', emoji: '🥩' },
];

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const [step, setStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [calories, setCalories] = useState('2000');
  const [protein, setProtein] = useState('150');
  const [carbs, setCarbs] = useState('250');
  const [fat, setFat] = useState('65');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const goToStep = (next: number) => {
    const direction = next > step ? -1 : 1;
    Animated.timing(slideAnim, {
      toValue: direction * width,
      duration: 0,
      useNativeDriver: true,
    }).start(() => {
      setStep(next);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }).start();
    });
  };

  const toggleRestriction = (label: string) => {
    setSelectedRestrictions((prev) =>
      prev.includes(label) ? prev.filter((r) => r !== label) : [...prev, label],
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        await userService.updateGoals({
          calories_goal: parseInt(calories, 10) || 2000,
          protein_goal: parseInt(protein, 10) || 150,
          carbs_goal: parseInt(carbs, 10) || 250,
          fat_goal: parseInt(fat, 10) || 65,
        });
        await userService.updateRestrictions(selectedRestrictions);
      }
      await authService.markOnboardingComplete();
    } catch {
      // continue regardless of API errors
    } finally {
      setLoading(false);
      navigation.replace('Tabs');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => goToStep(step - 1)}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        )}

        <Animated.View style={[styles.stepContainer, { transform: [{ translateX: slideAnim }] }]}>
          {step === 0 && (
            <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.bigEmoji}>🍳</Text>
              <Text style={styles.heading}>Welcome to{'\n'}SmartCooking</Text>
              <Text style={styles.subtitle}>
                Cook smarter with AI-powered recipes and nutrition tracking
              </Text>
              <View style={styles.bulletList}>
                {[
                  '🥗  37+ curated recipes',
                  '📊  Macro tracking',
                  '🛒  Smart shopping lists',
                ].map((b) => (
                  <View key={b} style={styles.bulletRow}>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => goToStep(1)}>
                <Text style={styles.primaryBtnText}>Get Started</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {step === 1 && (
            <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.stepIcon}>🎯</Text>
              <Text style={styles.heading}>Set Your Daily Goals</Text>
              <Text style={styles.subtitle}>
                We'll recommend recipes that match your macros
              </Text>
              <View style={styles.inputGroup}>
                {[
                  { label: 'Daily Calories', value: calories, setter: setCalories, unit: 'kcal' },
                  { label: 'Protein', value: protein, setter: setProtein, unit: 'g' },
                  { label: 'Carbs', value: carbs, setter: setCarbs, unit: 'g' },
                  { label: 'Fat', value: fat, setter: setFat, unit: 'g' },
                ].map(({ label, value, setter, unit }) => (
                  <View key={label} style={styles.inputRow}>
                    <Text style={styles.inputLabel}>{label}</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        value={value}
                        onChangeText={setter}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textLight}
                      />
                      <Text style={styles.inputUnit}>{unit}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => goToStep(2)}>
                <Text style={styles.primaryBtnText}>Continue</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {step === 2 && (
            <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.stepIcon}>🍽️</Text>
              <Text style={styles.heading}>Any dietary{'\n'}restrictions?</Text>
              <Text style={styles.subtitle}>
                We'll filter out recipes that don't match
              </Text>
              <View style={styles.chipsGrid}>
                {RESTRICTIONS.map(({ label, emoji }) => {
                  const selected = selectedRestrictions.includes(label);
                  return (
                    <TouchableOpacity
                      key={label}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleRestriction(label)}
                    >
                      <Text style={styles.chipEmoji}>{emoji}</Text>
                      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                        {label}
                      </Text>
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
                  {loading ? 'Setting up...' : 'Start Cooking! 🚀'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </Animated.View>

        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
          ))}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  backBtnText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  stepContainer: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  bigEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  stepIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  bulletList: {
    alignSelf: 'stretch',
    marginBottom: 40,
    gap: 12,
  },
  bulletRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  bulletText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  inputGroup: {
    alignSelf: 'stretch',
    marginBottom: 36,
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  inputLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    width: 70,
    textAlign: 'right',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primary,
    paddingVertical: 2,
  },
  inputUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    width: 28,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
    gap: 10,
    marginBottom: 36,
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignSelf: 'stretch',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
});

export default OnboardingScreen;
