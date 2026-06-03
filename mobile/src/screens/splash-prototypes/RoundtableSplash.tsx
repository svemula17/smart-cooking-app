// Concept D — "The Roundtable"
// 4 roommate avatars fade in at corners, slide diagonally to center,
// form a circle (the table), a plate appears in the middle. Tells the
// "cooking is better together" story in ~1.4s.

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';

const { width: W, height: H } = Dimensions.get('window');

interface Props { onDone?: () => void }

const AVATAR_SIZE = 44;
const TABLE_RADIUS = 80; // distance of avatars from center when settled
const CORNER_OFFSET = 0.18; // % from screen edges to start from

// Avatars fly in from off-screen in the rough direction of their seat,
// so they read as gathering radially toward the shared table.
const STARTS = [
  { x: 0,         y: -H * 0.42 }, // Cook  — from above
  { x:  W * 0.55, y: 0         }, // Plan  — from the right
  { x: 0,         y:  H * 0.42 }, // Share — from below
  { x: -W * 0.55, y: 0         }, // Track — from the left
];

// Each avatar settles at one of 4 cardinal points around the table.
// Order matches PILLARS below: north, east, south, west.
const SEATS = [
  { x: 0, y: -TABLE_RADIUS  }, // north  → Cook
  { x:  TABLE_RADIUS, y: 0  }, // east   → Plan
  { x: 0, y:  TABLE_RADIUS  }, // south  → Share
  { x: -TABLE_RADIUS, y: 0  }, // west   → Track
];

// The app's 4 pillars — one per seat at the table.
const PILLARS = [
  { emoji: '🍳', label: 'Cook',  color: 'primary' },
  { emoji: '📅', label: 'Plan',  color: 'info' },
  { emoji: '🏡', label: 'Share', color: 'success' },
  { emoji: '📊', label: 'Track', color: 'warning' },
] as const;

export function RoundtableSplash({ onDone }: Props) {
  const c = useThemeColors();

  const slides    = useRef(STARTS.map(() => new Animated.Value(0))).current; // 0=corner, 1=seat
  const tableIn   = useRef(new Animated.Value(0)).current;
  const plateIn   = useRef(new Animated.Value(0)).current;
  const steam     = useRef(new Animated.Value(0)).current;
  const wordmark  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const seq = Animated.sequence([
      // 1. Avatars fade in + slide diagonally to seats (staggered)
      Animated.stagger(80,
        slides.map((s) =>
          Animated.spring(s, { toValue: 1, damping: 13, stiffness: 130, useNativeDriver: true }),
        ),
      ),
      // 2. Table ring draws + plate pops in + steam rises
      Animated.parallel([
        Animated.timing(tableIn, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.spring(plateIn, { toValue: 1, damping: 9, stiffness: 200, useNativeDriver: true }),
        Animated.timing(steam, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      // 3. Wordmark
      Animated.timing(wordmark, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]);
    seq.start(() => onDone?.());
    return () => seq.stop();
  }, []);

  return (
    <View style={[styles.fill, { backgroundColor: c.background }]}>
      {/* Table (ring outline) */}
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

      {/* Plate of food at center */}
      <Animated.View
        style={{
          position: 'absolute',
          left: W / 2 - 32,
          top: H / 2 - 32,
          opacity: plateIn,
          transform: [{ scale: plateIn }],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 56 }}>🍲</Text>
      </Animated.View>

      {/* Steam from plate */}
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

      {/* The 4 pillars, seated around the table */}
      {SEATS.map((seat, i) => {
        const pillar = PILLARS[i];
        const start = STARTS[i];
        const tx = slides[i].interpolate({ inputRange: [0, 1], outputRange: [start.x, seat.x] });
        const ty = slides[i].interpolate({ inputRange: [0, 1], outputRange: [start.y, seat.y] });
        const op = slides[i].interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] });
        const scale = slides[i].interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.5, 1.08, 1] });
        // Label fades in only after the pillar settles into its seat.
        const labelOpacity = slides[i].interpolate({ inputRange: [0, 0.85, 1], outputRange: [0, 0, 1] });
        const color = (c as any)[pillar.color] as string;
        // Push the label outward from the table center so it doesn't overlap the plate.
        const labelOffset = {
          x: seat.x === 0 ? 0 : seat.x > 0 ? 30 : -30,
          y: seat.y === 0 ? 0 : seat.y > 0 ? 34 : -34,
        };
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: W / 2 - AVATAR_SIZE / 2,
              top:  H / 2 - AVATAR_SIZE / 2,
              transform: [{ translateX: tx }, { translateY: ty }, { scale }],
              opacity: op,
              alignItems: 'center',
            }}
          >
            <View style={[styles.avatar, { backgroundColor: color }]}>
              <Text style={styles.avatarEmoji}>{pillar.emoji}</Text>
            </View>
            <Animated.Text
              style={[
                styles.pillarLabel,
                {
                  color: c.textSecondary,
                  opacity: labelOpacity,
                  transform: [{ translateX: labelOffset.x }, { translateY: labelOffset.y }],
                },
              ]}
            >
              {pillar.label}
            </Animated.Text>
          </Animated.View>
        );
      })}

      {/* Wordmark */}
      <Animated.View style={[styles.wordmarkWrap, { opacity: wordmark }]}>
        <Text style={[styles.wordmark, { color: c.text }]}>
          Smart<Text style={{ color: c.primary }}>Cooking</Text>
        </Text>
        <Text style={[styles.tagline, { color: c.textLight }]}>cooking is better together</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  avatar: {
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
  avatarEmoji: { fontSize: 22 },
  pillarLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  wordmarkWrap: { position: 'absolute', bottom: H * 0.18, alignSelf: 'center', alignItems: 'center', width: '100%' },
  wordmark: { fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  tagline: { marginTop: spacing.xs, fontSize: 11, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase' },
});

export default RoundtableSplash;
