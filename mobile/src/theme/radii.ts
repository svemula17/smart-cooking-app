// Minimal Mono — crisper corner scale. Cards/buttons land around 10–12,
// chips are squared (sm). `pill` kept for intentionally round elements
// (avatars, dots, the few true pills).
export const radii = {
  none: 0,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  '2xl': 16,
  '3xl': 20,
  pill: 999,
} as const;

export type RadiiKey = keyof typeof radii;
