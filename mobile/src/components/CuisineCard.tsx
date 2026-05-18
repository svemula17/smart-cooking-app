import React from 'react';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useHaptics } from './ui/useHaptics';

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

// Tint colour overlaid on top of the bg image — gives each card its own
// accent without losing the photo underneath.
const CUISINE_TINT: Record<string, string> = {
  Indian:        'rgba(214, 73, 56, 0.42)',   // saffron-red
  Chinese:       'rgba(196, 30, 58, 0.42)',   // crimson
  'Indo-Chinese':'rgba(244, 110, 51, 0.42)',  // tangerine
  Italian:       'rgba(0, 100, 60, 0.45)',    // basil green
  Mexican:       'rgba(255, 142, 13, 0.45)',  // taco orange
  Thai:          'rgba(50, 130, 130, 0.45)',  // lemongrass teal
  Japanese:      'rgba(96, 38, 99, 0.45)',    // plum
  Mediterranean: 'rgba(38, 92, 138, 0.45)',   // aegean blue
};

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
  const tint = CUISINE_TINT[cuisine] ?? 'rgba(0,0,0,0.45)';

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
        <ImageBackground
          source={{ uri: bgUri }}
          style={styles.bg}
          imageStyle={styles.bgImage}
        >
          <View style={[styles.tint, { backgroundColor: tint }]} />
          <View style={styles.content}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.name}>{cuisine}</Text>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.bg, { backgroundColor: '#F0F0F0' }]}>
          <View style={styles.content}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[styles.name, { color: '#333' }]}>{cuisine}</Text>
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
    borderRadius: 22,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#1A1410',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  bg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bgImage: {
    borderRadius: 22,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 14,
    paddingBottom: 12,
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
