import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { radii, RadiiKey } from '../../theme/radii';
import { spacing, SpacingKey } from '../../theme/spacing';
import { elevation, ElevationKey } from '../../theme/elevation';
import { useHaptics } from './useHaptics';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: SpacingKey | 'none';
  radius?: RadiiKey;
  surface?: 'surface' | 'surfaceMuted' | 'surfaceRaised';
  elevation?: ElevationKey;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

export function Card({
  children,
  onPress,
  padding = 'lg',
  radius = 'xl',
  surface = 'surface',
  elevation: elev = 'card',
  bordered = false,
  style,
  accessibilityLabel,
  testID,
}: CardProps) {
  const c = useThemeColors();
  const haptics = useHaptics();

  const containerStyle: ViewStyle = {
    backgroundColor: c[surface],
    borderRadius: radii[radius],
    padding: padding === 'none' ? 0 : spacing[padding],
    borderWidth: bordered ? 1 : 0,
    borderColor: c.border,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          haptics.selection();
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={({ pressed }) => [
          containerStyle,
          elevation[elev],
          { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.997 : 1 }] },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={[containerStyle, elevation[elev], style]}>
      {children}
    </View>
  );
}

export const cardStyles = StyleSheet.create({});
