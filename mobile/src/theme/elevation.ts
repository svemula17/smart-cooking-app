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

// Minimal Mono — depth comes from hairline borders + whitespace, not shadows.
// `card` is intentionally flat; only true overlays (sheets/modals) cast a
// subtle shadow.
export const elevation = {
  flat: { shadowColor: 'transparent', elevation: 0 } as Elevation,
  card: { shadowColor: 'transparent', elevation: 0 } as Elevation,
  raised: make('#000000', 0.06, 14, 5, 3),
  overlay: make('#000000', 0.16, 26, 12, 10),
} as const;

export type ElevationKey = keyof typeof elevation;
