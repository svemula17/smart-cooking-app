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

// Crisp neutral shadows.
export const elevation = {
  flat: { shadowColor: 'transparent', elevation: 0 } as Elevation,
  card: make('#000000', 0.05, 10, 3, 2),
  raised: make('#000000', 0.09, 18, 8, 6),
  overlay: make('#000000', 0.18, 28, 14, 12),
} as const;

export type ElevationKey = keyof typeof elevation;
