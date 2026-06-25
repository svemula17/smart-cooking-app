import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';
import { radii } from '../../theme/radii';
import { useHaptics } from './useHaptics';

export interface SegmentedOption<T extends string> {
  key: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (key: T) => void;
  style?: ViewStyle;
}

// Minimal Mono segmented control: a hairline `surfaceMuted` track with a single
// sliding mono indicator. Replaces ad-hoc chip rows used as tab switchers.
export function Segmented<T extends string>({ options, value, onChange, style }: SegmentedProps<T>) {
  const c = useThemeColors();
  const haptics = useHaptics();
  const [trackW, setTrackW] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  const segW = trackW > 0 ? (trackW - PAD * 2) / options.length : 0;
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(x, {
      toValue: index * segW,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [index, segW, x]);

  const onLayout = (e: LayoutChangeEvent) => setTrackW(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.track,
        { backgroundColor: c.surfaceMuted, borderColor: c.border },
        style,
      ]}
    >
      {segW > 0 ? (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: segW,
              backgroundColor: c.surface,
              borderColor: c.border,
              transform: [{ translateX: x }],
            },
          ]}
        />
      ) : null}
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            style={styles.segment}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            onPress={() => {
              if (!active) {
                haptics.selection();
                onChange(o.key);
              }
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: active ? c.text : c.textSecondary,
                fontWeight: active ? '700' : '600',
                fontSize: 13,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const PAD = 3;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radii.md,
    borderWidth: 1,
    padding: PAD,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: PAD,
    left: PAD,
    bottom: PAD,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
