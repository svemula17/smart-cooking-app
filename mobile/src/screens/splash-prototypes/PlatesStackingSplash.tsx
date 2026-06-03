// Concept C — "Plates Stacking"
// 4 colored plates drop from above and stack one by one, top plate
// flips to reveal the logo. Playful, friendly, multi-cuisine.

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';

const { width: W, height: H } = Dimensions.get('window');

interface Props { onDone?: () => void }

const PLATES = [
  { color: '#FF6B35', label: 'Indian' },     // tikka orange
  { color: '#D62828', label: 'Italian' },    // marinara red
  { color: '#F1C40F', label: 'Mexican' },    // mole yellow
  { color: '#52796F', label: 'Med' },        // olive green
];

const PLATE_SIZE = 140;
const STACK_GAP = 14;

export function PlatesStackingSplash({ onDone }: Props) {
  const c = useThemeColors();

  const drops    = useRef(PLATES.map(() => new Animated.Value(-H))).current; // y-offset
  const flip     = useRef(new Animated.Value(0)).current;                    // top plate flips
  const wordmark = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const stackOffset = (i: number) => -i * STACK_GAP; // each plate sits stack-gap higher

    const stagger = Animated.stagger(140,
      drops.map((d, i) =>
        Animated.spring(d, {
          toValue: stackOffset(i),
          damping: 9,
          stiffness: 240,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ),
    );

    const finale = Animated.parallel([
      Animated.timing(flip, { toValue: 1, duration: 600, easing: Easing.bezier(0.65, 0, 0.35, 1), useNativeDriver: true }),
      Animated.timing(wordmark, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]);

    Animated.sequence([stagger, finale]).start(() => onDone?.());
  }, []);

  const flipRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const flipBackOpacity = flip.interpolate({ inputRange: [0, 0.45, 0.55, 1], outputRange: [1, 1, 0, 0] });
  const flipFrontOpacity = flip.interpolate({ inputRange: [0, 0.45, 0.55, 1], outputRange: [0, 0, 1, 1] });

  return (
    <View style={[styles.fill, { backgroundColor: c.background }]}>
      <View style={styles.stackWrap}>
        {PLATES.map((p, i) => {
          const isTop = i === PLATES.length - 1;
          return (
            <Animated.View
              key={i}
              style={[
                styles.plate,
                {
                  backgroundColor: p.color,
                  zIndex: i,
                  transform: [{ translateY: drops[i] }, isTop ? { rotateY: flipRotate } : { rotateY: '0deg' }],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.18,
                  shadowRadius: 12,
                  elevation: i + 1,
                },
              ]}
            >
              {isTop ? (
                <>
                  {/* Front (plate color) */}
                  <Animated.View style={[styles.faceFill, { backgroundColor: p.color, opacity: flipBackOpacity }]} />
                  {/* Back (logo reveal) */}
                  <Animated.View style={[styles.faceFill, { backgroundColor: c.background, opacity: flipFrontOpacity }]}>
                    <Text style={{ fontSize: 50 }}>🍽️</Text>
                  </Animated.View>
                </>
              ) : null}
            </Animated.View>
          );
        })}
      </View>

      <Animated.View style={[styles.wordmarkWrap, { opacity: wordmark }]}>
        <Text style={[styles.wordmark, { color: c.text }]}>
          Smart<Text style={{ color: c.primary }}>Cooking</Text>
        </Text>
        <Text style={[styles.tagline, { color: c.textLight }]}>plates · people · plans</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  stackWrap: {
    position: 'absolute',
    left: W / 2 - PLATE_SIZE / 2,
    top: H / 2 - PLATE_SIZE / 2,
    width: PLATE_SIZE,
    height: PLATE_SIZE,
  },
  plate: {
    position: 'absolute',
    width: PLATE_SIZE,
    height: PLATE_SIZE,
    borderRadius: PLATE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceFill: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: PLATE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkWrap: { position: 'absolute', bottom: H * 0.18, alignSelf: 'center', alignItems: 'center', width: '100%' },
  wordmark: { fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  tagline: { marginTop: spacing.xs, fontSize: 11, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase' },
});

export default PlatesStackingSplash;
