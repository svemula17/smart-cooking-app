import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { setAuth, type AppDispatch } from '../store';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'login' | 'register';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  general?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── LoginScreen ──────────────────────────────────────────────────────────────

export function LoginScreen({ route, navigation }: Props): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

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

  // Animated tab indicator
  const tabAnim = useRef(new Animated.Value(mode === 'login' ? 0 : 1)).current;

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // ── Mode switch ──────────────────────────────────────────────────────────────

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    Animated.spring(tabAnim, {
      toValue: next === 'login' ? 0 : 1,
      friction: 7,
      tension: 80,
      useNativeDriver: false,
    }).start();
  }

  const indicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, width / 2 - 8],
  });

  // ── Validation ───────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: FormErrors = {};

    if (mode === 'register' && !name.trim()) {
      e.name = 'Name is required';
    }
    if (!email.trim()) {
      e.email = 'Email is required';
    } else if (!validateEmail(email)) {
      e.email = 'Enter a valid email address';
    }
    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    }
    if (mode === 'register') {
      if (!confirm) {
        e.confirm = 'Please confirm your password';
      } else if (confirm !== password) {
        e.confirm = 'Passwords do not match';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      if (mode === 'register') {
        const data = await authService.register(
          name.trim(),
          email.trim().toLowerCase(),
          password,
        );
        dispatch(setAuth({ user: data.user, token: data.accessToken }));

        // Upload onboarding goals & restrictions if they were collected
        if (pendingGoals) {
          await Promise.allSettled([
            userService.updateGoals({
              calories_goal: pendingGoals.calories,
              protein_goal:  pendingGoals.protein,
              carbs_goal:    pendingGoals.carbs,
              fat_goal:      pendingGoals.fat,
            }),
            pendingGoals.restrictions.length > 0
              ? userService.updateRestrictions(pendingGoals.restrictions)
              : Promise.resolve(),
          ]);
        }
      } else {
        const data = await authService.login(
          email.trim().toLowerCase(),
          password,
        );
        dispatch(setAuth({ user: data.user, token: data.accessToken }));
      }

      navigation.replace('Tabs');
    } catch (err: any) {
      const status = err?.response?.status;
      const msg: string =
        err?.response?.data?.error?.message ??
        err?.message ??
        'Something went wrong. Please try again.';

      if (status === 409) {
        setErrors({ email: 'An account with this email already exists.' });
      } else if (status === 401) {
        setErrors({ general: 'Incorrect email or password.' });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Continue as guest ─────────────────────────────────────────────────────────

  async function handleGuest() {
    await authService.markOnboardingComplete();
    navigation.replace('Tabs');
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Coral header */}
      <View style={styles.heroHeader}>
        <Text style={styles.logoEmoji}>🍳</Text>
        <Text style={styles.appName}>SmartCooking</Text>
        <Text style={styles.tagline}>Cook smarter, eat better</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Tab switcher */}
          <View style={styles.tabBar}>
            <Animated.View style={[styles.tabIndicator, { left: indicatorLeft, width: width / 2 - 12 }]} />
            <TouchableOpacity style={styles.tab} onPress={() => switchMode('login')} activeOpacity={0.8}>
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => switchMode('register')} activeOpacity={0.8}>
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* General error */}
          {errors.general ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️  {errors.general}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>

            {/* Name — register only */}
            {mode === 'register' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputWrap, errors.name ? styles.inputError : null]}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Jane Smith"
                    placeholderTextColor={colors.textLight}
                    value={name}
                    onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: undefined })); }}
                    autoCapitalize="words"
                    autoComplete="name"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                </View>
                {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrap, errors.email ? styles.inputError : null]}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
              {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, errors.password ? styles.inputError : null]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Your password'}
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                  secureTextEntry={!showPass}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  returnKeyType={mode === 'register' ? 'next' : 'done'}
                  onSubmitEditing={() => mode === 'register' ? confirmRef.current?.focus() : handleSubmit()}
                />
                <TouchableOpacity onPress={() => setShowPass((s) => !s)} style={styles.eyeBtn}>
                  <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
            </View>

            {/* Confirm password — register only */}
            {mode === 'register' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputWrap, errors.confirm ? styles.inputError : null]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    ref={confirmRef}
                    style={styles.input}
                    placeholder="Repeat your password"
                    placeholderTextColor={colors.textLight}
                    value={confirm}
                    onChangeText={(t) => { setConfirm(t); setErrors((e) => ({ ...e, confirm: undefined })); }}
                    secureTextEntry={!showConfirm}
                    autoComplete="new-password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm((s) => !s)} style={styles.eyeBtn}>
                    <Text style={styles.eyeText}>{showConfirm ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.confirm ? <Text style={styles.fieldError}>{errors.confirm}</Text> : null}
              </View>
            )}

            {/* Forgot password — login only */}
            {mode === 'login' && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'login' ? 'Sign In →' : 'Create Account →'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Guest access */}
            <TouchableOpacity style={styles.guestBtn} onPress={handleGuest} activeOpacity={0.8}>
              <Text style={styles.guestBtnText}>Continue as Guest 👀</Text>
            </TouchableOpacity>
            <Text style={styles.guestHint}>
              Browse recipes without an account.{'\n'}Shopping lists and AI chat require sign-in.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default LoginScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1, backgroundColor: colors.background },

  // Hero header
  heroHeader: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
    gap: 4,
  },
  logoEmoji: { fontSize: 48, marginBottom: 4 },
  appName: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3 },

  scrollContent: { paddingBottom: 48 },

  // Tab switcher
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', zIndex: 1 },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: '#fff' },

  // Error banner
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorBannerText: { fontSize: 14, color: colors.error, fontWeight: '500' },

  // Form
  form: { paddingHorizontal: 20, paddingTop: 24 },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputError: { borderColor: colors.error, backgroundColor: '#FFF5F5' },
  inputIcon: { fontSize: 16, width: 22 },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 11,
    fontSize: 15,
    color: colors.text,
  },
  eyeBtn: { padding: 6 },
  eyeText: { fontSize: 16 },
  fieldError: { fontSize: 12, color: colors.error, marginTop: 5, marginLeft: 4 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -6 },
  forgotText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // Submit
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.65 },
  submitBtnText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 13, color: colors.textSecondary },

  // Guest
  guestBtn: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  guestBtnText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  guestHint: { fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: 12, lineHeight: 18 },
});
