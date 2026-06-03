// Concept B — "The Sizzle"
// Pan slides in → ingredients tumble from top → flame ignites → steam
// rises → wordmark reveals. Visceral cooking energy in ~1.4s.

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';

const { width: W, height: H } = Dimensions.get('window');

interface Props { onDone?: () => void }

const INGREDIENTS = ['🧅', '🧄', '🌶️', '🍅']; // onion, garlic, chili, tomato

export function SizzleSplash({ onDone }: Props) {
  const c = useThemeColors();

  const panX        = useRef(new Animated.Value(W)).current;          // slide in from right
  const ingredients = useRef(INGREDIENTS.map(() => new Animated.Value(0))).current;
  const flame       = useRef(new Animated.Value(0)).current;
  const steam       = useRef(new Animated.Value(0)).current;
  const wordmark    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const seq = Animated.sequence([
      // 1. Pan slides in
      Animated.spring(panX, { toValue: 0, damping: 15, stiffness: 180, useNativeDriver: true }),
      // 2. Ingredients tumble in, staggered
      Animated.stagger(80, ingredients.map((v) =>
        Animated.spring(v, { toValue: 1, damping: 8, stiffness: 220, useNativeDriver: true }),
      )),
      // 3. Flame + steam rise together
      Animated.parallel([
        Animated.timing(flame, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.timing(steam, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      // 4. Wordmark
      Animated.timing(wordmark, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]);
    seq.start(() => onDone?.());
    return () => seq.stop();
  }, []);

  const flameHeight = flame.interpolate({ inputRange: [0, 1], outputRange: [0, 38] });
  const flameOpacity = flame.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] });
  const steamY = steam.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
  const steamOpacity = steam.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.7, 0] });

  return (
    <View style={[styles.fill, { backgroundColor: c.background }]}>
      {/* Steam */}
      <Animated.View
        style={{
          position: 'absolute',
          left: W / 2 - 24,
          top: H / 2 - 30,
          opacity: steamOpacity,
          transform: [{ translateY: steamY }],
        }}
      >
        <Text style={{ fontSize: 38, color: c.textLight }}>💨</Text>
      </Animated.View>

      {/* Ingredient drops */}
      {ingredients.map((v, i) => {
        const dropX = (i - 1.5) * 26;
        return (
          <Animated.Text
            key={i}
            style={{
              position: 'absolute',
              left: W / 2 - 16 + dropX,
              top: H / 2 - 4,
              fontSize: 30,
              transform: [
                {
                  translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-180, 0] }),
                },
                {
                  rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] }),
                },
                { scale: v },
              ],
              opacity: v,
            }}
          >
            {INGREDIENTS[i]}
          </Animated.Text>
        );
      })}

      {/* Pan */}
      <Animated.View
        style={{
          position: 'absolute',
          left: W / 2 - 70,
          top: H / 2,
          transform: [{ translateX: panX }],
        }}
      >
        <Text style={{ fontSize: 100 }}>🍳</Text>
      </Animated.View>

      {/* Flame */}
      <Animated.View
        style={{
          position: 'absolute',
          left: W / 2 - 20,
          top: H / 2 + 90,
          width: 40,
          height: flameHeight,
          borderRadius: 20,
          backgroundColor: c.warning,
          opacity: flameOpacity,
        }}
      />

      {/* Wordmark */}
      <Animated.View style={[styles.wordmarkWrap, { opacity: wordmark }]}>
        <Text style={[styles.wordmark, { color: c.text }]}>
          Smart<Text style={{ color: c.primary }}>Cooking</Text>
        </Text>
        <Text style={[styles.tagline, { color: c.textLight }]}>cook · share · eat</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  wordmarkWrap: { position: 'absolute', bottom: H * 0.18, alignSelf: 'center', alignItems: 'center', width: '100%' },
  wordmark: { fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  tagline: { marginTop: spacing.xs, fontSize: 11, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase' },
});

export default SizzleSplash;
