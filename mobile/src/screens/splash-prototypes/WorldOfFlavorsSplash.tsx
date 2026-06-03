// Concept A — "World of Flavors"
// Multi-cuisine angle. A globe in the center; 6 cuisine emojis fly OUT
// from it, orbit briefly, then collapse into a single plate. Says
// "every cuisine in one app" in 1.2s.

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';

const { width: W, height: H } = Dimensions.get('window');
const DURATION = 1700;

const CUISINES = ['🍛', '🍝', '🍣', '🌮', '🫒', '🥟']; // Indian, Italian, JP, Mex, Med, Chinese

interface Props { onDone?: () => void }

export function WorldOfFlavorsSplash({ onDone }: Props) {
  const c = useThemeColors();

  const globeIn   = useRef(new Animated.Value(0)).current; // 0→1 globe pops in
  const orbit     = useRef(new Animated.Value(0)).current; // 0→1 ingredients fan out + orbit
  const collapse  = useRef(new Animated.Value(0)).current; // 0→1 collapse to plate
  const plateIn   = useRef(new Animated.Value(0)).current; // 0→1 plate appears
  const wordmark  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const seq = Animated.sequence([
      Animated.spring(globeIn, { toValue: 1, damping: 11, stiffness: 180, useNativeDriver: true }),
      Animated.timing(orbit,   { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(collapse,{ toValue: 1, duration: 350, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(plateIn, { toValue: 1, damping: 9, stiffness: 200, useNativeDriver: true }),
        Animated.timing(wordmark,{ toValue: 1, duration: 320, useNativeDriver: true }),
      ]),
    ]);
    seq.start(() => onDone?.());
    return () => seq.stop();
  }, []);

  const globeOpacity = globeIn.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 1] });
  const globeScale   = Animated.add(globeIn, collapse.interpolate({ inputRange: [0, 1], outputRange: [0, -0.7] }));
  const globeOut     = collapse.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <View style={[styles.fill, { backgroundColor: c.background }]}>
      {/* Orbiting ingredients */}
      {CUISINES.map((emoji, i) => {
        const angle = (i / CUISINES.length) * Math.PI * 2;
        const radius = 110;
        const targetX = Math.cos(angle) * radius;
        const targetY = Math.sin(angle) * radius;
        const orbitRot = orbit.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${360 + (i * 60)}deg`],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: W / 2 - 18,
              top: H / 2 - 18,
              transform: [
                { translateX: orbit.interpolate({ inputRange: [0, 1], outputRange: [0, targetX] }) },
                { translateY: orbit.interpolate({ inputRange: [0, 1], outputRange: [0, targetY] }) },
                {
                  scale: Animated.multiply(
                    orbit,
                    collapse.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                  ),
                },
                { rotate: orbitRot },
              ],
              opacity: Animated.multiply(orbit, collapse.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.6, 0] })),
            }}
          >
            <Text style={styles.cuisineEmoji}>{emoji}</Text>
          </Animated.View>
        );
      })}

      {/* Globe */}
      <Animated.View
        style={[
          styles.center,
          { opacity: Animated.multiply(globeOpacity, globeOut), transform: [{ scale: globeScale }] },
        ]}
      >
        <Text style={styles.globe}>🌍</Text>
      </Animated.View>

      {/* Plate (final state) */}
      <Animated.View
        style={[
          styles.center,
          { opacity: plateIn, transform: [{ scale: plateIn }] },
        ]}
      >
        <Text style={styles.plate}>🍽️</Text>
      </Animated.View>

      {/* Wordmark */}
      <Animated.View style={[styles.wordmarkWrap, { opacity: wordmark }]}>
        <Text style={[styles.wordmark, { color: c.text }]}>
          Smart<Text style={{ color: c.primary }}>Cooking</Text>
        </Text>
        <Text style={[styles.tagline, { color: c.textLight }]}>every cuisine, one kitchen</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { position: 'absolute', left: W / 2 - 50, top: H / 2 - 60, width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  globe: { fontSize: 84 },
  plate: { fontSize: 76 },
  cuisineEmoji: { fontSize: 32 },
  wordmarkWrap: { position: 'absolute', bottom: H * 0.18, alignSelf: 'center', alignItems: 'center', width: '100%' },
  wordmark: { fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  tagline: { marginTop: spacing.xs, fontSize: 11, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase' },
});

export default WorldOfFlavorsSplash;
