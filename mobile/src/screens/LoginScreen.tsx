import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';

import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { setAuth, type AppDispatch } from '../store';
import type { RootStackParamList } from '../types';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';
import { typography } from '../theme/typography';
import { Button, Chip, Divider, IconButton, TextField } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
type Mode = 'login' | 'register';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  general?: string;
}

const validateEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export function LoginScreen({ route, navigation }: Props): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const c = useThemeColors();

  const initialMode: Mode = route.params?.initialMode ?? 'login';
  const pendingGoals = route.params?.pendingGoals;

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (mode === 'register' && !name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!validateEmail(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (mode === 'register') {
      if (!confirm) e.confirm = 'Please confirm your password';
      else if (confirm !== password) e.confirm = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      if (mode === 'register') {
        const data = await authService.register(
          name.trim(),
          email.trim().toLowerCase(),
          password
        );
        dispatch(setAuth({ user: data.user, token: data.accessToken }));
        if (pendingGoals) {
          await Promise.allSettled([
            userService.updateGoals({
              calories_goal: pendingGoals.calories,
              protein_goal: pendingGoals.protein,
              carbs_goal: pendingGoals.carbs,
              fat_goal: pendingGoals.fat,
            }),
            pendingGoals.restrictions.length > 0
              ? userService.updateRestrictions(pendingGoals.restrictions)
              : Promise.resolve(),
          ]);
        }
      } else {
        const data = await authService.login(email.trim().toLowerCase(), password);
        dispatch(setAuth({ user: data.user, token: data.accessToken }));
      }
      navigation.replace('Tabs');
    } catch (err: any) {
      const status = err?.response?.status;
      const msg: string =
        err?.response?.data?.error?.message ??
        err?.message ??
        'Something went wrong. Please try again.';
      if (status === 409) setErrors({ email: 'An account with this email already exists.' });
      else if (status === 401) setErrors({ general: 'Incorrect email or password.' });
      else setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await authService.markOnboardingComplete();
    navigation.replace('Tabs');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.primary }]} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Hero header */}
      <View style={[styles.hero, { backgroundColor: c.primary }]}>
        <Text style={styles.logoEmoji}>🍳</Text>
        <Text style={[styles.appName, { color: c.onPrimary }]}>SmartCooking</Text>
        <Text style={[styles.tagline, { color: 'rgba(255,255,255,0.78)' }]}>
          Cook smarter, eat better
        </Text>
      </View>

      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: c.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Tab switcher */}
          <View style={[styles.tabRow, { backgroundColor: c.surfaceMuted }]}>
            <Chip
              label="Sign In"
              selected={mode === 'login'}
              onPress={() => switchMode('login')}
              style={{ flex: 1, justifyContent: 'center' }}
            />
            <Chip
              label="Create Account"
              selected={mode === 'register'}
              onPress={() => switchMode('register')}
              style={{ flex: 1, justifyContent: 'center' }}
            />
          </View>

          {errors.general ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: c.errorMuted, borderColor: c.error },
              ]}
            >
              <Text style={[typography.body, { color: c.error, fontWeight: '600' }]}>
                {errors.general}
              </Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {mode === 'register' ? (
              <TextField
                label="Full name"
                placeholder="Jane Smith"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setErrors((e) => ({ ...e, name: undefined }));
                }}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                error={errors.name}
                accessibilityLabel="Full name"
              />
            ) : null}

            <TextField
              ref={emailRef}
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErrors((e) => ({ ...e, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={errors.email}
              accessibilityLabel="Email"
            />

            <TextField
              ref={passwordRef}
              label="Password"
              placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Your password'}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrors((e) => ({ ...e, password: undefined }));
              }}
              secureTextEntry={!showPass}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              returnKeyType={mode === 'register' ? 'next' : 'done'}
              onSubmitEditing={() =>
                mode === 'register' ? confirmRef.current?.focus() : handleSubmit()
              }
              error={errors.password}
              trailing={
                <IconButton
                  icon={showPass ? '🙈' : '👁'}
                  size={32}
                  accessibilityLabel={showPass ? 'Hide password' : 'Show password'}
                  onPress={() => setShowPass((s) => !s)}
                />
              }
              accessibilityLabel="Password"
            />

            {mode === 'register' ? (
              <TextField
                ref={confirmRef}
                label="Confirm password"
                placeholder="Repeat your password"
                value={confirm}
                onChangeText={(t) => {
                  setConfirm(t);
                  setErrors((e) => ({ ...e, confirm: undefined }));
                }}
                secureTextEntry={!showConfirm}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                error={errors.confirm}
                trailing={
                  <IconButton
                    icon={showConfirm ? '🙈' : '👁'}
                    size={32}
                    accessibilityLabel={
                      showConfirm ? 'Hide password' : 'Show password'
                    }
                    onPress={() => setShowConfirm((s) => !s)}
                  />
                }
                accessibilityLabel="Confirm password"
              />
            ) : null}

            {mode === 'login' ? (
              <View style={{ alignSelf: 'flex-end' }}>
                <Text
                  accessibilityRole="button"
                  style={{ color: c.primary, fontWeight: '600', fontSize: 13 }}
                >
                  Forgot password?
                </Text>
              </View>
            ) : null}

            <Button
              label={mode === 'login' ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              size="lg"
              hapticStyle="medium"
              style={{ marginTop: spacing.sm }}
            />

            <View style={styles.dividerRow}>
              <Divider style={{ flex: 1 }} />
              <Text style={[typography.caption, { color: c.textSecondary }]}>or</Text>
              <Divider style={{ flex: 1 }} />
            </View>

            <Button
              label="Continue as Guest"
              variant="secondary"
              onPress={handleGuest}
              fullWidth
              size="lg"
            />
            <Text
              style={[
                typography.caption,
                { color: c.textLight, textAlign: 'center', marginTop: spacing.md },
              ]}
            >
              Browse recipes without an account.{'\n'}
              Shopping lists and AI chat require sign-in.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: 4,
  },
  logoEmoji: { fontSize: 48, marginBottom: 4 },
  appName: { fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  tagline: { fontSize: 14, letterSpacing: 0.3 },
  scrollContent: { paddingBottom: spacing['4xl'] },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.xs,
    borderRadius: radii.lg,
    gap: spacing.xs,
  },
  errorBanner: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  form: { paddingHorizontal: spacing.xl, paddingTop: spacing['2xl'], gap: spacing.lg },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
});
