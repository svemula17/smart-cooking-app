// "The Roundtable" intro animation.
//
// The app's 4 pillars (🍳 Cook · 📅 Plan · 🏡 Share · 📊 Track) fly in
// from N/E/S/W, settle into seats around a table, then the whole ring
// slowly orbits the steaming plate in the center. Emoji-only — no labels.
//
// Used both in the Lab prototype showcase and as the production splash
// (wrapped by SplashScreen with session-restore + navigation logic).

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';

const { width: W, height: H } = Dimensions.get('window');
const GLOW = Math.round(W * 0.95); // soft radial bloom diameter behind the plate

interface Props {
  onDone?: () => void;
  /** Hide the wordmark — useful if the host screen draws its own. */
  showWordmark?: boolean;
}

const AVATAR_SIZE = 46;
const TABLE_RADIUS = 82;

// Fly-in start points (off-screen, in each seat's direction).
const STARTS = [
  { x: 0,         y: -H * 0.42 }, // Cook  — from above
  { x:  W * 0.55, y: 0         }, // Plan  — from the right
  { x: 0,         y:  H * 0.42 }, // Share — from below
  { x: -W * 0.55, y: 0         }, // Track — from the left
];

// Settled seats (N/E/S/W around the table center).
const SEATS = [
  { x: 0,            y: -TABLE_RADIUS }, // north
  { x:  TABLE_RADIUS, y: 0            }, // east
  { x: 0,            y:  TABLE_RADIUS }, // south
  { x: -TABLE_RADIUS, y: 0            }, // west
];

// One pillar per seat — emoji + theme color key.
const PILLARS = [
  { emoji: '🍳', color: 'primary' },
  { emoji: '📅', color: 'info' },
  { emoji: '🏡', color: 'success' },
  { emoji: '📊', color: 'warning' },
] as const;

export function RoundtableSplash({ onDone, showWordmark = true }: Props) {
  const c = useThemeColors();

  const slides   = useRef(STARTS.map(() => new Animated.Value(0))).current; // 0=start, 1=seat
  const tableIn  = useRef(new Animated.Value(0)).current;
  const plateIn  = useRef(new Animated.Value(0)).current;
  const steam    = useRef(new Animated.Value(0)).current;
  const wordmark = useRef(new Animated.Value(0)).current;
  const orbit    = useRef(new Animated.Value(0)).current; // continuous ring rotation
  const glow     = useRef(new Animated.Value(0)).current; // breathing bloom behind the plate
  const pulse    = useRef(new Animated.Value(0)).current; // gentle plate scale pulse

  useEffect(() => {
    const entrance = Animated.stagger(
      80,
      slides.map((s) =>
        Animated.spring(s, { toValue: 1, damping: 13, stiffness: 130, useNativeDriver: true }),
      ),
    );
    const settle = Animated.parallel([
      Animated.timing(tableIn, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.spring(plateIn, { toValue: 1, damping: 9, stiffness: 200, useNativeDriver: true }),
      Animated.timing(steam,   { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(wordmark,{ toValue: 1, duration: 320, useNativeDriver: true }),
    ]);

    // Slow, continuous orbit — one revolution every 4.2s. Loops until unmount.
    const spin = Animated.loop(
      Animated.timing(orbit, { toValue: 1, duration: 4200, easing: Easing.linear, useNativeDriver: true }),
    );
    // Breathing bloom + plate pulse — gentle, never-ending, in sync.
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(glow,  { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow,  { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    const beat = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );

    const seq = Animated.sequence([entrance, settle]);
    seq.start();
    const spinTimer = setTimeout(() => { spin.start(); breathe.start(); beat.start(); }, 650);
    const doneTimer = setTimeout(() => onDone?.(), 2000);   // intro reads in ~2s

    return () => {
      seq.stop();
      spin.stop();
      breathe.stop();
      beat.stop();
      clearTimeout(spinTimer);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orbitRotate = orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowOpacity = Animated.multiply(
    plateIn,
    glow.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.92] }),
  );
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] });
  const plateScale = Animated.multiply(
    plateIn,
    pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }),
  );
  const wordmarkShift = wordmark.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  return (
    <View style={[styles.fill, { backgroundColor: c.background }]}>
      {/* Radial bloom glow behind the plate — blooms in with the plate, then breathes */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: W / 2 - GLOW / 2,
          top: H / 2 - GLOW / 2,
          width: GLOW,
          height: GLOW,
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        }}
      >
        <Svg width={GLOW} height={GLOW}>
          <Defs>
            <RadialGradient id="bloom" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={c.primary} stopOpacity="0.5" />
              <Stop offset="55%" stopColor={c.primary} stopOpacity="0.12" />
              <Stop offset="100%" stopColor={c.primary} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill="url(#bloom)" />
        </Svg>
      </Animated.View>

      {/* Table ring (static) */}
      <Animated.View
        style={{
          position: 'absolute',
          left: W / 2 - TABLE_RADIUS - 6,
          top: H / 2 - TABLE_RADIUS - 6,
          width: (TABLE_RADIUS + 6) * 2,
          height: (TABLE_RADIUS + 6) * 2,
          borderRadius: TABLE_RADIUS + 6,
          borderWidth: tableIn.interpolate({ inputRange: [0, 1], outputRange: [0, 2] }),
          borderColor: c.border,
          opacity: tableIn,
        }}
      />

      {/* Plate of food at center — pulses gently after settling */}
      <Animated.View
        style={[styles.centerPoint, { opacity: plateIn, transform: [{ scale: plateScale }] }]}
      >
        <Text style={{ fontSize: 56 }}>🍲</Text>
      </Animated.View>

      {/* Steam (static) */}
      <Animated.View
        style={{
          position: 'absolute',
          left: W / 2 - 16,
          top: H / 2 - 70,
          opacity: steam.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.7, 0] }),
          transform: [{ translateY: steam.interpolate({ inputRange: [0, 1], outputRange: [10, -30] }) }],
        }}
      >
        <Text style={{ fontSize: 30, color: c.textLight }}>💨</Text>
      </Animated.View>

      {/* Orbiting ring of pillar emojis. The wrapper is a 0×0 point at
          screen center; rotating it orbits all 4 avatars around the plate. */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: W / 2,
          top: H / 2,
          width: 0,
          height: 0,
          transform: [{ rotate: orbitRotate }],
        }}
      >
        {SEATS.map((seat, i) => {
          const pillar = PILLARS[i];
          const start = STARTS[i];
          const tx = slides[i].interpolate({ inputRange: [0, 1], outputRange: [start.x, seat.x] });
          const ty = slides[i].interpolate({ inputRange: [0, 1], outputRange: [start.y, seat.y] });
          const op = slides[i].interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] });
          const scale = slides[i].interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.5, 1.08, 1] });
          const color = (c as any)[pillar.color] as string;
          return (
            <Animated.View
              key={i}
              style={[
                styles.avatar,
                {
                  backgroundColor: color,
                  transform: [{ translateX: tx }, { translateY: ty }, { scale }],
                  opacity: op,
                },
              ]}
            >
              <Text style={styles.avatarEmoji}>{pillar.emoji}</Text>
            </Animated.View>
          );
        })}
      </Animated.View>

      {/* Wordmark */}
      {showWordmark ? (
        <Animated.View style={[styles.wordmarkWrap, { opacity: wordmark, transform: [{ translateY: wordmarkShift }] }]}>
          <Text style={[styles.wordmark, { color: c.text }]}>
            Smart<Text style={{ color: c.primary }}>Cooking</Text>
          </Text>
          <Text style={[styles.tagline, { color: c.textLight }]}>cooking is better together</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  centerPoint: {
    position: 'absolute',
    left: W / 2 - 32,
    top: H / 2 - 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    position: 'absolute',
    left: -AVATAR_SIZE / 2,
    top: -AVATAR_SIZE / 2,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarEmoji: { fontSize: 24 },
  wordmarkWrap: { position: 'absolute', bottom: H * 0.18, alignSelf: 'center', alignItems: 'center', width: '100%' },
  wordmark: { fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  tagline: { marginTop: spacing.xs, fontSize: 11, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase' },
});

export default RoundtableSplash;
