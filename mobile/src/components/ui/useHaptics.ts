// Press feedback hook. `impact` and `selection` now route through the global
// press-feedback system (utils/feedback) so every button fires the user's
// chosen tap SOUND + HAPTIC (configured in Lab → Tap feedback). `notify`
// remains a pure semantic notification haptic (success/warning/error).

import { pressFeedback } from '../../utils/feedback';

type HapticImpactStyle = 'light' | 'medium' | 'heavy';
type HapticNotificationType = 'success' | 'warning' | 'error';

let H: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  H = require('expo-haptics');
} catch {
  H = null;
}

const mapN = (t: HapticNotificationType) =>
  H?.NotificationFeedbackType?.[t.charAt(0).toUpperCase() + t.slice(1)];

export function useHaptics() {
  return {
    // `impact` = a real button press → fires the user's chosen feel (light
    // haptic). `selection` = touching cards/tiles/chips → intentionally silent,
    // so feedback is limited to actual buttons (not every tap).
    impact: (_style: HapticImpactStyle = 'light') => pressFeedback(),
    selection: () => {},
    notify: (type: HapticNotificationType = 'success') => {
      if (!H?.notificationAsync) return;
      H.notificationAsync(mapN(type)).catch(() => {});
    },
  };
}
