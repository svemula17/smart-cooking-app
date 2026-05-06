import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress, emoji }) => (
  <TouchableOpacity
    style={[styles.chip, selected && styles.chipSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {emoji && <Text style={styles.emoji}>{emoji}</Text>}
    <Text style={[styles.label, selected && styles.labelSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 13,
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
