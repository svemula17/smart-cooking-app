// Thin wrapper around expo-haptics. If the module is not installed we no-op,
// so callers can sprinkle haptics confidently without adding a hard dep.

type HapticImpactStyle = 'light' | 'medium' | 'heavy';
type HapticNotificationType = 'success' | 'warning' | 'error';

let H: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  H = require('expo-haptics');
} catch {
  H = null;
}

const map = (s: HapticImpactStyle) =>
  H?.ImpactFeedbackStyle?.[s.charAt(0).toUpperCase() + s.slice(1)];

const mapN = (t: HapticNotificationType) =>
  H?.NotificationFeedbackType?.[t.charAt(0).toUpperCase() + t.slice(1)];

export function useHaptics() {
  return {
    impact: (style: HapticImpactStyle = 'light') => {
      if (!H?.impactAsync) return;
      H.impactAsync(map(style)).catch(() => {});
    },
    notify: (type: HapticNotificationType = 'success') => {
      if (!H?.notificationAsync) return;
      H.notificationAsync(mapN(type)).catch(() => {});
    },
    selection: () => {
      if (!H?.selectionAsync) return;
      H.selectionAsync().catch(() => {});
    },
  };
}
