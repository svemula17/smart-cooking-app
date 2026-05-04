import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns, 16px padding each side + 16px gap

export interface CuisineCardProps {
  cuisine: string;
  emoji: string;
  color: string;
  onPress: () => void;
}

export const CuisineCard: React.FC<CuisineCardProps> = ({ cuisine, emoji, color, onPress }) => (
  <TouchableOpacity
    style={[styles.card, { backgroundColor: color, width: CARD_WIDTH }]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={styles.name}>{cuisine}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
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
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
