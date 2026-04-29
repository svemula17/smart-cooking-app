import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface Props { name: string; onPress?: () => void; }

export function CuisineCard({ name, onPress }: Props): JSX.Element {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.label}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 14,
  },
  label: { fontWeight: '600', color: colors.text },
});
