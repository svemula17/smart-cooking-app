import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';
import { useHaptics } from './ui/useHaptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export interface CuisineCardProps {
  cuisine: string;
  emoji: string;
  color: string;
  onPress: () => void;
}

export const CuisineCard: React.FC<CuisineCardProps> = ({ cuisine, emoji, color, onPress }) => {
  const c = useThemeColors();
  const haptics = useHaptics();

  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`Browse ${cuisine} recipes`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: color,
          width: CARD_WIDTH,
          borderColor: c.border,
          borderWidth: 1,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.name, { color: c.text }]}>{cuisine}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#1A1410',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 110,
  },
  emoji: {
    fontSize: 38,
    marginBottom: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
