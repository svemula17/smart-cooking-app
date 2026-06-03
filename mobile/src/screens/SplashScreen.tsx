import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ThemedStatusBar } from '../components/ThemedStatusBar';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';

import { RootStackParamList } from '../types';
import { setAuth, AppDispatch } from '../store';
import { authService } from '../services/authService';

import { RoundtableSplash } from './splash-prototypes/RoundtableSplash';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;
type Target = 'Tabs' | 'Onboarding' | 'Login';

const REDUCED_MS = 320;
// Hard ceiling — if session restore hangs, navigate anyway so we never
// strand the user on the splash.
const SAFETY_MS = 4000;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const c = useThemeColors();
  const dispatch = useDispatch<AppDispatch>();

  // Navigation gates on TWO conditions: (1) the open animation has played,
  // (2) session restore has decided where to go. Whichever finishes last
  // triggers the actual navigation.
  const decided = useRef<Target | null>(null);
  const animDone = useRef(false);
  const navigated = useRef(false);
  const [isReduced, setIsReduced] = useState<boolean | null>(null);
  const reducedFade = useRef(new Animated.Value(0)).current;

  const tryNavigate = useCallback(() => {
    if (navigated.current) return;
    if (decided.current && animDone.current) {
      navigated.current = true;
      navigation.replace(decided.current);
    }
  }, [navigation]);

  // ── Session restore in parallel with the animation ──────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let target: Target = 'Onboarding';
      try {
        const session = await authService.restoreSession();
        if (session) {
          dispatch(setAuth(session));
          target = 'Tabs';
        } else {
          const isFirst = await authService.isFirstLaunch();
          target = isFirst ? 'Onboarding' : 'Login';
        }
      } catch {
        target = 'Onboarding';
      }
      if (cancelled) return;
      decided.current = target;
      tryNavigate();
    })();

    const safety = setTimeout(() => {
      // Force-resolve both gates if something stalled.
      if (!decided.current) decided.current = 'Login';
      animDone.current = true;
      tryNavigate();
    }, SAFETY_MS);

    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, [dispatch, tryNavigate]);

  // ── Reduced-motion branch: skip the animation, fade a static mark ───────
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => {
        if (cancelled) return;
        setIsReduced(reduce);
        if (reduce) {
          Animated.timing(reducedFade, {
            toValue: 1,
            duration: REDUCED_MS,
            useNativeDriver: true,
          }).start();
          setTimeout(() => {
            animDone.current = true;
            tryNavigate();
          }, REDUCED_MS + 40);
        }
      })
      .catch(() => setIsReduced(false));
    return () => {
      cancelled = true;
    };
  }, [reducedFade, tryNavigate]);

  const onAnimDone = useCallback(() => {
    animDone.current = true;
    tryNavigate();
  }, [tryNavigate]);

  // Wait until we know the reduce-motion preference before committing to a path.
  if (isReduced === null) {
    return <View style={[styles.fill, { backgroundColor: c.background }]}><ThemedStatusBar /></View>;
  }

  if (isReduced) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: c.background }]}>
        <ThemedStatusBar />
        <Animated.View style={{ opacity: reducedFade, alignItems: 'center' }}>
          <Text style={{ fontSize: 56 }}>🍲</Text>
          <Text style={[styles.wordmark, { color: c.text, marginTop: spacing.lg }]}>
            Smart<Text style={{ color: c.primary }}>Cooking</Text>
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <ThemedStatusBar />
      <RoundtableSplash onDone={onAnimDone} />
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
});

export default SplashScreen;
