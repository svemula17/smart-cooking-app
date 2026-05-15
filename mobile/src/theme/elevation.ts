import { Platform, ViewStyle } from 'react-native';

type Elevation = ViewStyle;

const ios = (
  shadowColor: string,
  opacity: number,
  radius: number,
  offsetY: number
): ViewStyle => ({
  shadowColor,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: offsetY },
});

const make = (
  shadowColor: string,
  opacity: number,
  radius: number,
  offsetY: number,
  androidElevation: number
): Elevation =>
  Platform.select({
    ios: ios(shadowColor, opacity, radius, offsetY),
    android: { elevation: androidElevation, shadowColor },
    default: ios(shadowColor, opacity, radius, offsetY),
  }) as Elevation;

// Warm-modern shadows: soft, slightly downward, low opacity.
export const elevation = {
  flat: { shadowColor: 'transparent', elevation: 0 } as Elevation,
  card: make('#1A1410', 0.06, 8, 2, 2),
  raised: make('#1A1410', 0.1, 16, 6, 6),
  overlay: make('#1A1410', 0.18, 24, 12, 12),
} as const;

export type ElevationKey = keyof typeof elevation;
