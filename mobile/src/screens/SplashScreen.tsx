import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import { RootStackParamList } from '../types';
import { setAuth, AppDispatch, RootState } from '../store';
import { authService } from '../services/authService';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MARK_SIZE = 132;
const RING_THICKNESS = 6;
const RING_RADIUS = (MARK_SIZE - RING_THICKNESS) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const DISC_SIZE = Math.round((MARK_SIZE - RING_THICKNESS * 2) * 0.58);

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SCREEN_DIAGONAL = Math.hypot(SCREEN_W, SCREEN_H);

const TOTAL_MS = 1150;
const REDUCED_MS = 260;

const expoOut = Easing.bezier(0.22, 1, 0.36, 1);

type SteamConfig = {
  xOffset: number;
  rise: number;
  drift: number;
  width: number;
  height: number;
  delay: number;
  duration: number;
  peakOpacity: number;
  useAccent: boolean;
};

const STEAM: SteamConfig[] = [
  { xOffset: -22, rise: -34, drift: -4, width: 9,  height: 22, delay: 400, peakOpacity: 0.45, duration: 760, useAccent: false },
  { xOffset: -2,  rise: -46, drift: 3,  width: 11, height: 26, delay: 520, peakOpacity: 0.55, duration: 820, useAccent: true  },
  { xOffset: 18,  rise: -30, drift: -2, width: 8,  height: 20, delay: 640, peakOpacity: 0.40, duration: 720, useAccent: false },
];

function tryHaptic() {
  try {
    // expo-haptics is optional; never crash if it's not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const H = require('expo-haptics');
    H?.selectionAsync?.();
  } catch {
    // no-op
  }
}

function Steam({
  cfg,
  driver,
  color,
}: {
  cfg: SteamConfig;
  driver: Animated.Value;
  color: string;
}) {
  // Triangle opacity curve: 0 → peak at t=0.35 → 0
  const opacity = driver.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, cfg.peakOpacity, 0],
  });
  const translateY = driver.interpolate({
    inputRange: [0, 1],
    outputRange: [0, cfg.rise],
  });
  // Sine drift via piecewise interpolation (0 → drift at 0.5 → 0)
  const translateX = driver.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, cfg.drift, 0],
  });
  const scaleX = driver.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.1],
  });

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.steam,
        {
          left: MARK_SIZE / 2 + cfg.xOffset - cfg.width / 2,
          width: cfg.width,
          height: cfg.height,
          borderRadius: cfg.width / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateX }, { translateY }, { scaleX }],
        },
      ]}
    />
  );
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const c = useThemeColors();
  const isDark = useSelector((s: RootState) => s.settings.isDark);
  const dispatch = useDispatch<AppDispatch>();

  // One driver per beat — all use RN's classic Animated API (no worklets).
  const spark = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const ringDraw = useRef(new Animated.Value(0)).current;
  const disc = useRef(new Animated.Value(0)).current;
  const settle = useRef(new Animated.Value(0)).current;
  const wash = useRef(new Animated.Value(0)).current;
  const wordmark = useRef(new Animated.Value(0)).current;
  const wordmarkWipe = useRef(new Animated.Value(0)).current;
  const s0 = useRef(new Animated.Value(0)).current;
  const s1 = useRef(new Animated.Value(0)).current;
  const s2 = useRef(new Animated.Value(0)).current;
  const reducedFade = useRef(new Animated.Value(0)).current;

  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const navigateNext = async () => {
      try {
        const session = await authService.restoreSession();
        if (cancelled) return;
        if (session) {
          dispatch(setAuth(session));
          navigation.replace('Tabs');
          return;
        }
      } catch {}
      if (cancelled) return;
      try {
        const isFirst = await authService.isFirstLaunch();
        if (cancelled) return;
        navigation.replace(isFirst ? 'Onboarding' : 'Login');
      } catch {
        if (cancelled) return;
        navigation.replace('Onboarding');
      }
    };

    const time = (
      v: Animated.Value,
      toValue: number,
      duration: number,
      easing = expoOut,
      useNativeDriver = true,
    ) =>
      Animated.timing(v, { toValue, duration, easing, useNativeDriver });

    const delayed = (ms: number, anim: Animated.CompositeAnimation) =>
      Animated.sequence([Animated.delay(ms), anim]);

    const startFull = () => {
      Animated.parallel([
        // Beat 1 — Spark + glow bloom (0–520)
        time(spark, 1, 260),
        time(glow, 1, 520, expoOut, false), // SVG attr (r) → JS driver
        // Beat 2 — Ring stroke-draw (200–660)
        delayed(200, time(ringDraw, 1, 460, expoOut, false)),
        // Beat 3 — Contents puck (350–650)
        delayed(
          350,
          Animated.spring(disc, {
            toValue: 1,
            damping: 14,
            stiffness: 180,
            mass: 0.7,
            useNativeDriver: true,
          }),
        ),
        // Beat 4 — Steam wisps (individuated)
        delayed(STEAM[0].delay, time(s0, 1, STEAM[0].duration)),
        delayed(STEAM[1].delay, time(s1, 1, STEAM[1].duration)),
        delayed(STEAM[2].delay, time(s2, 1, STEAM[2].duration)),
        // Beat 5 — Wordmark (580–900)
        delayed(580, time(wordmark, 1, 260)),
        delayed(600, time(wordmarkWipe, 1, 320)),
        // Beat 6 — Settle pulse (830 → 1040)
        delayed(
          830,
          Animated.sequence([time(settle, 1, 90), time(settle, 0, 120)]),
        ),
        // Beat 7 — Exit wash (900–1140)
        delayed(900, time(wash, 1, 240)),
      ]).start();

      timers.push(setTimeout(() => !cancelled && tryHaptic(), 850));
      timers.push(setTimeout(() => !cancelled && navigateNext(), TOTAL_MS));
    };

    const startReduced = () => {
      setIsReduced(true);
      Animated.timing(reducedFade, {
        toValue: 1,
        duration: REDUCED_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
      timers.push(setTimeout(() => !cancelled && navigateNext(), REDUCED_MS + 40));
    };

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => {
        if (cancelled) return;
        reduce ? startReduced() : startFull();
      })
      .catch(() => {
        if (!cancelled) startFull();
      });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Interpolations ---

  const sparkOpacity = spark;
  const sparkScale = spark.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });

  // Glow radius and opacity combine the bloom-in and exit-wash drivers.
  const glowR = Animated.add(
    glow.interpolate({ inputRange: [0, 1], outputRange: [14, 184] }),
    wash.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_DIAGONAL * 0.65] }),
  );
  const glowOpacity = Animated.add(
    glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
    wash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.25] }),
  );

  const ringDashOffset = ringDraw.interpolate({
    inputRange: [0, 1],
    outputRange: [RING_CIRCUMFERENCE, 0],
  });
  const ringOpacity = ringDraw;

  const discOpacity = disc;
  const discScale = disc.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  const breathScale = settle.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  const washOpacity = wash;
  const washScale = wash.interpolate({ inputRange: [0, 1], outputRange: [0.2, 8] });

  const wordmarkOpacity = wordmark;
  const wordmarkMaskScaleX = wordmarkWipe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const ringColor = isDark ? c.text : c.accent;
  const glowColor = c.primary;

  return (
    <View
      style={[styles.container, { backgroundColor: c.background }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="SmartCooking — loading"
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Reduced-motion overlay */}
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          StyleSheet.absoluteFillObject,
          styles.center,
          { opacity: reducedFade, zIndex: isReduced ? 10 : -1 },
        ]}
      >
        <View style={[styles.reducedDot, { backgroundColor: c.primary }]} />
        <Text style={[styles.wordmark, { color: c.text, marginTop: spacing.lg }]}>
          Smart<Text style={{ color: c.primary }}>Cooking</Text>
        </Text>
      </Animated.View>

      {/* Full-screen heat-bloom gradient */}
      <Svg
        pointerEvents="none"
        width={SCREEN_W}
        height={SCREEN_H}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="bloom" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={glowColor} stopOpacity="0.55" />
            <Stop offset="55%" stopColor={glowColor} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <AnimatedCircle
          cx={SCREEN_W / 2}
          cy={SCREEN_H / 2}
          fill="url(#bloom)"
          r={glowR as unknown as number}
          opacity={glowOpacity as unknown as number}
        />
      </Svg>

      {/* Mark */}
      <Animated.View style={[styles.markWrap, { transform: [{ scale: breathScale }] }]}>
        {/* Spark */}
        <Animated.View
          style={[
            styles.spark,
            {
              backgroundColor: c.primary,
              opacity: sparkOpacity,
              transform: [{ scale: sparkScale }],
            },
          ]}
        />

        {/* Steam wisps */}
        <Steam
          cfg={STEAM[0]}
          driver={s0}
          color={STEAM[0].useAccent ? c.primary : c.textLight}
        />
        <Steam
          cfg={STEAM[1]}
          driver={s1}
          color={STEAM[1].useAccent ? c.primary : c.textLight}
        />
        <Steam
          cfg={STEAM[2]}
          driver={s2}
          color={STEAM[2].useAccent ? c.primary : c.textLight}
        />

        {/* Pan ring — SVG stroke-draw */}
        <Svg width={MARK_SIZE} height={MARK_SIZE} style={StyleSheet.absoluteFill}>
          <AnimatedCircle
            cx={MARK_SIZE / 2}
            cy={MARK_SIZE / 2}
            r={RING_RADIUS}
            stroke={ringColor}
            strokeWidth={RING_THICKNESS}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            originX={MARK_SIZE / 2}
            originY={MARK_SIZE / 2}
            rotation={-90}
            strokeDashoffset={ringDashOffset as unknown as number}
            opacity={ringOpacity as unknown as number}
          />
        </Svg>

        {/* Contents puck */}
        <Animated.View
          style={[
            styles.disc,
            {
              backgroundColor: c.primary,
              opacity: discOpacity,
              transform: [{ scale: discScale }],
            },
          ]}
        />
      </Animated.View>

      {/* Wordmark + left-to-right mask wipe */}
      <Animated.View style={[styles.wordmarkWrap, { opacity: wordmarkOpacity }]}>
        <View>
          <Text style={[styles.wordmark, { color: c.text }]}>
            Smart<Text style={{ color: c.primary }}>Cooking</Text>
          </Text>
          <Text style={[styles.tagline, { color: c.textLight }]}>
            plan · cook · eat
          </Text>
          <Animated.View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.wordmarkMask,
              {
                backgroundColor: c.background,
                transform: [{ scaleX: wordmarkMaskScaleX }],
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Exit wash */}
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.washDot,
          {
            backgroundColor: c.primary,
            opacity: washOpacity,
            transform: [{ scale: washScale }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  markWrap: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  steam: {
    position: 'absolute',
    bottom: MARK_SIZE - 6,
  },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    marginTop: -6,
    marginLeft: -8,
  },
  wordmarkWrap: {
    position: 'absolute',
    bottom: spacing['5xl'] + spacing.md,
    alignItems: 'center',
  },
  wordmark: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tagline: {
    marginTop: spacing.xs,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  wordmarkMask: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    left: 0,
    right: 0,
    transformOrigin: 'right',
  },
  reducedDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  washDot: {
    position: 'absolute',
    width: MARK_SIZE,
    height: MARK_SIZE,
    left: SCREEN_W / 2 - MARK_SIZE / 2,
    top: SCREEN_H / 2 - MARK_SIZE / 2,
    borderRadius: MARK_SIZE / 2,
  },
});

export default SplashScreen;
