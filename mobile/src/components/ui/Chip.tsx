import React from 'react';
import { Pressable, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';
import { radii } from '../../theme/radii';
import { useHaptics } from './useHaptics';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Chip({
  label,
  selected = false,
  onPress,
  leading,
  trailing,
  size = 'md',
  disabled,
  style,
}: ChipProps) {
  const c = useThemeColors();
  const haptics = useHaptics();

  const bg = selected ? c.primary : c.surface;
  const fg = selected ? c.onPrimary : c.text;
  const borderColor = selected ? c.primary : c.border;

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        haptics.selection();
        onPress?.();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: bg,
          borderColor,
          paddingVertical: size === 'sm' ? 6 : 8,
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.lg,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {leading}
      <Text
        style={{
          color: fg,
          fontSize: size === 'sm' ? 12 : 13,
          fontWeight: '600',
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
});
