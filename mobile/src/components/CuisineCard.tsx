import React from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useHaptics } from './ui/useHaptics';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// One Unsplash photo per cuisine. All HTTP 200 verified.
const CUISINE_BG_IMAGE: Record<string, string> = {
  Indian:        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
  Chinese:       'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80',
  'Indo-Chinese':'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
  Italian:       'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80',
  Mexican:       'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  Thai:          'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
  Japanese:      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
  Mediterranean: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
};

// Minimal Mono: one neutral dark scrim over every photo (no decorative tint),
// keeps the food photo readable behind white text.
const CUISINE_SCRIM = 'rgba(17, 17, 20, 0.42)';

export interface CuisineCardProps {
  cuisine: string;
  emoji: string;
  /** Legacy prop kept for back-compat — ignored; we use bg image + tint now. */
  color?: string;
  onPress: () => void;
}

export const CuisineCard: React.FC<CuisineCardProps> = ({ cuisine, emoji, onPress }) => {
  const haptics = useHaptics();
  const bgUri = CUISINE_BG_IMAGE[cuisine];
  const tint = CUISINE_SCRIM;

  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`Browse ${cuisine} recipes`}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
    >
      {bgUri ? (
        <View style={styles.bg}>
          <Image
            source={{ uri: bgUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            recyclingKey={cuisine}
          />
          <View style={[styles.tint, { backgroundColor: tint }]} />
          <View style={styles.content}>
            <Text style={styles.name}>{cuisine}</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.bg, { backgroundColor: colors.surfaceMuted }]}>
          <View style={styles.content}>
            <Text style={[styles.name, { color: colors.text }]}>{cuisine}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 120,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bgImage: {
    borderRadius: radii.xl,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.md,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
