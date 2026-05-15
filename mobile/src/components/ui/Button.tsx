import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';
import { radii } from '../../theme/radii';
import { typography } from '../../theme/typography';
import { useHaptics } from './useHaptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'none';
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const HEIGHT: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
const PAD_X: Record<Size, number> = { sm: spacing.lg, md: spacing.xl, lg: spacing['2xl'] };
const FONT_SIZE: Record<Size, number> = { sm: 13, md: 15, lg: 17 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leading,
  trailing,
  hapticStyle = 'light',
  accessibilityLabel,
  testID,
  style,
}: ButtonProps) {
  const c = useThemeColors();
  const haptics = useHaptics();

  const palette = (() => {
    switch (variant) {
      case 'secondary':
        return { bg: c.surfaceMuted, border: c.border, fg: c.text };
      case 'ghost':
        return { bg: 'transparent', border: 'transparent', fg: c.primary };
      case 'destructive':
        return { bg: c.error, border: c.error, fg: c.onPrimary };
      case 'primary':
      default:
        return { bg: c.primary, border: c.primary, fg: c.onPrimary };
    }
  })();

  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={() => {
        if (isInactive) return;
        if (hapticStyle !== 'none') haptics.impact(hapticStyle);
        onPress?.();
      }}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      accessibilityLabel={accessibilityLabel ?? label}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHT[size],
          paddingHorizontal: PAD_X[size],
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: isInactive ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {leading ? <View style={styles.icon}>{leading}</View> : null}
          <Text
            style={
              [
                typography.button,
                { color: palette.fg, fontSize: FONT_SIZE[size] },
              ] as TextStyle[]
            }
            numberOfLines={1}
          >
            {label}
          </Text>
          {trailing ? <View style={styles.icon}>{trailing}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: { alignItems: 'center', justifyContent: 'center' },
});
