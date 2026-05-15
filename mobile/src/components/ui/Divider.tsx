import React from 'react';
import { StyleSheet, StyleProp, View, ViewStyle } from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';

export function Divider({
  vertical = false,
  inset = 0,
  style,
}: {
  vertical?: boolean;
  inset?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useThemeColors();
  return (
    <View
      style={[
        vertical
          ? { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginHorizontal: inset }
          : { height: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginVertical: inset },
        { backgroundColor: c.border },
        style,
      ]}
    />
  );
}
