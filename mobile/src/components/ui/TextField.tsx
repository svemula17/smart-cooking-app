import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';
import { radii } from '../../theme/radii';
import { typography } from '../../theme/typography';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helper?: string;
  error?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, helper, error, leading, trailing, containerStyle, onFocus, onBlur, ...rest },
  ref
) {
  const c = useThemeColors();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? c.error : focused ? c.primary : c.border;
  const helperColor = error ? c.error : c.textSecondary;

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {label ? <Text style={[typography.label, { marginBottom: spacing.xs }]}>{label}</Text> : null}
      <View
        style={[
          styles.box,
          {
            backgroundColor: c.surface,
            borderColor,
            borderWidth: focused || error ? 1.5 : 1,
          },
        ]}
      >
        {leading ? <View style={styles.adornment}>{leading}</View> : null}
        <TextInput
          ref={ref}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={c.textLight}
          style={[styles.input, { color: c.text }]}
          accessibilityLabel={rest.accessibilityLabel ?? label}
        />
        {trailing ? <View style={styles.adornment}>{trailing}</View> : null}
      </View>
      {helper || error ? (
        <Text style={[typography.caption, { color: helperColor, marginTop: spacing.xs }]}>
          {error ?? helper}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: spacing.md,
  },
  adornment: { marginHorizontal: spacing.xs },
});
