import React from 'react';
import { StyleSheet, Text, StyleProp, View, ViewStyle } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';
import { radii } from '../../theme/radii';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  tone?: Tone;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, tone = 'neutral', size = 'sm', style }: BadgeProps) {
  const c = useThemeColors();

  const palette = (() => {
    switch (tone) {
      case 'primary':
        return { bg: c.primaryMuted, fg: c.primary };
      case 'success':
        return { bg: c.successMuted, fg: c.success };
      case 'warning':
        return { bg: c.warningMuted, fg: c.warning };
      case 'error':
        return { bg: c.errorMuted, fg: c.error };
      case 'info':
        return { bg: c.infoMuted, fg: c.info };
      case 'neutral':
      default:
        return { bg: c.surfaceMuted, fg: c.textSecondary };
    }
  })();

  return (
    <View
      style={[
        {
          backgroundColor: palette.bg,
          paddingHorizontal: size === 'md' ? spacing.md : spacing.sm,
          paddingVertical: size === 'md' ? 6 : 3,
          borderRadius: radii.pill,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: palette.fg,
          fontSize: size === 'md' ? 12 : 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export const badgeStyles = StyleSheet.create({});
