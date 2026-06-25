// Centralized press feedback: a tap SOUND + HAPTIC, chosen in Lab (Settings)
// and applied app-wide through useHaptics. Sounds are tiny bundled WAVs;
// haptics use expo-haptics (no-ops on web / unsupported devices).

import { store } from '../store';
import type { TapSound, TapHaptic } from '../store/slices/settingsSlice';

// Native modules loaded defensively so the app still runs (sound/haptics just
// no-op) if a module is unavailable in the current runtime.
let Audio: any = null;
let Haptics: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Audio = require('expo-audio');
} catch {
  Audio = null;
}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

type SoundId = Exclude<TapSound, 'none'>;

const SOUND_SOURCES: Record<SoundId, number> = {
  tap: require('../../assets/sounds/tap.wav'),
  pop: require('../../assets/sounds/pop.wav'),
  tick: require('../../assets/sounds/tick.wav'),
  bubble: require('../../assets/sounds/bubble.wav'),
};

export const TAP_SOUNDS: { id: TapSound; label: string }[] = [
  { id: 'tap', label: 'Tap' },
  { id: 'pop', label: 'Pop' },
  { id: 'tick', label: 'Tick' },
  { id: 'bubble', label: 'Bubble' },
  { id: 'none', label: 'Silent' },
];

export const TAP_HAPTICS: { id: TapHaptic; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'heavy', label: 'Heavy' },
  { id: 'none', label: 'Off' },
];

let audioReady = false;
const players: Partial<Record<SoundId, any>> = {};

function ensureAudioMode() {
  if (audioReady || !Audio?.setAudioModeAsync) return;
  audioReady = true;
  // Play tap sounds even on silent switch, and never interrupt the user's music.
  Audio.setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(
    () => {}
  );
}

function getPlayer(id: SoundId): any {
  if (!Audio?.createAudioPlayer) return null;
  try {
    if (!players[id]) players[id] = Audio.createAudioPlayer(SOUND_SOURCES[id]);
    return players[id] ?? null;
  } catch {
    return null;
  }
}

/** Play a specific tap sound now (used by the Lab sampler + global feedback). */
export function playSound(id: TapSound) {
  if (id === 'none') return;
  ensureAudioMode();
  const p = getPlayer(id);
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch {
    /* ignore */
  }
}

/** Fire a specific haptic now (used by the Lab sampler + global feedback). */
export function triggerHaptic(style: TapHaptic) {
  if (style === 'none' || !Haptics?.impactAsync) return;
  const map: Record<string, unknown> = {
    light: Haptics.ImpactFeedbackStyle?.Light,
    medium: Haptics.ImpactFeedbackStyle?.Medium,
    heavy: Haptics.ImpactFeedbackStyle?.Heavy,
  };
  Haptics.impactAsync(map[style]).catch(() => {});
}

/** The global "button press" feel — reads the user's chosen sound + haptic. */
export function pressFeedback() {
  const { tapSound, tapHaptic } = store.getState().settings;
  triggerHaptic(tapHaptic);
  playSound(tapSound);
}

/** Preview both at once (Lab "Try it" button). */
export function previewFeedback(sound: TapSound, haptic: TapHaptic) {
  triggerHaptic(haptic);
  playSound(sound);
}
