import React from 'react';
import { Pressable, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { radii } from '../../theme/radii';
import { useHaptics } from './useHaptics';

interface IconButtonProps {
  icon: React.ReactNode | string;
  onPress?: () => void;
  accessibilityLabel: string; // required
  size?: number; // tap target; default 44
  variant?: 'plain' | 'tinted' | 'filled';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 44,
  variant = 'plain',
  disabled,
  style,
  testID,
}: IconButtonProps) {
  const c = useThemeColors();
  const haptics = useHaptics();

  const bg =
    variant === 'filled' ? c.primary : variant === 'tinted' ? c.surfaceMuted : 'transparent';

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        haptics.selection();
        onPress?.();
      }}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radii.pill,
          backgroundColor: bg,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {typeof icon === 'string' ? (
        <Text style={{ fontSize: size * 0.5 }}>{icon}</Text>
      ) : (
        icon
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
