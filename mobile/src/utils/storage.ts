import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  ACCESS_TOKEN:        'accessToken',
  REFRESH_TOKEN:       'refreshToken',
  USER:                'user',
  ONBOARDING_COMPLETE: 'onboardingComplete',
  USER_PREFERENCES:    'userPreferences',
  MACRO_PROGRESS:      'macroProgress',
  LAST_SYNC_DATE:      'lastSyncDate',
  THEME:               'theme',
  SETTINGS:            'settings',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// Tokens live in the OS keychain (iOS Keychain Services / Android Keystore)
// via expo-secure-store. Everything else stays in AsyncStorage which is
// faster and supports the larger preference / cache payloads.
const SECURE_KEYS = new Set<StorageKey>([
  STORAGE_KEYS.ACCESS_TOKEN,
  STORAGE_KEYS.REFRESH_TOKEN,
]);

// expo-secure-store is unavailable on web; fall back to AsyncStorage there.
const isWeb = Platform.OS === 'web';

// ─── Low-level helpers ────────────────────────────────────────────────────────

async function get(key: StorageKey): Promise<string | null> {
  try {
    if (SECURE_KEYS.has(key) && !isWeb) {
      const v = await SecureStore.getItemAsync(key);
      if (v !== null) return v;
      // Lazy migration: token might still be in old AsyncStorage from before
      // we moved to SecureStore. If so, copy it over and clear the old slot.
      const legacy = await AsyncStorage.getItem(key);
      if (legacy) {
        await SecureStore.setItemAsync(key, legacy);
        await AsyncStorage.removeItem(key);
        return legacy;
      }
      return null;
    }
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function set(key: StorageKey, value: string): Promise<void> {
  try {
    if (SECURE_KEYS.has(key) && !isWeb) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch {
    // Silently swallow — storage errors should not crash the app
  }
}

async function remove(key: StorageKey): Promise<void> {
  try {
    if (SECURE_KEYS.has(key) && !isWeb) {
      await SecureStore.deleteItemAsync(key);
      // Clean any legacy AsyncStorage copy too
      await AsyncStorage.removeItem(key).catch(() => undefined);
      return;
    }
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

async function removeMany(keys: StorageKey[]): Promise<void> {
  // SecureStore has no batch API; run them in parallel.
  await Promise.all(keys.map(remove));
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

async function setJSON<T>(key: StorageKey, value: T): Promise<void> {
  await set(key, JSON.stringify(value));
}

async function getJSON<T>(key: StorageKey): Promise<T | null> {
  const raw = await get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export const storage = {
  // ── Raw / generic ───────────────────────────────────────────────────────────
  get,
  set,
  remove,
  removeMany,
  getJSON,
  setJSON,

  // ── Auth tokens (stored in OS keychain) ─────────────────────────────────────
  async getAccessToken(): Promise<string | null> {
    return get(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    await set(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return get(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async setTokens(access: string, refresh?: string): Promise<void> {
    await Promise.all([
      set(STORAGE_KEYS.ACCESS_TOKEN, access),
      refresh ? set(STORAGE_KEYS.REFRESH_TOKEN, refresh) : Promise.resolve(),
    ]);
  },

  async clearAuth(): Promise<void> {
    await removeMany([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  },

  // ── User object ─────────────────────────────────────────────────────────────
  async getUser<T>(): Promise<T | null> {
    return getJSON<T>(STORAGE_KEYS.USER);
  },

  async setUser<T>(user: T): Promise<void> {
    await setJSON(STORAGE_KEYS.USER, user);
  },

  // ── Onboarding ──────────────────────────────────────────────────────────────
  async isOnboardingComplete(): Promise<boolean> {
    const val = await get(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return val === 'true';
  },

  async markOnboardingComplete(): Promise<void> {
    await set(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
  },

  // ── User preferences ────────────────────────────────────────────────────────
  async getPreferences<T>(): Promise<T | null> {
    return getJSON<T>(STORAGE_KEYS.USER_PREFERENCES);
  },

  async setPreferences<T>(prefs: T): Promise<void> {
    await setJSON(STORAGE_KEYS.USER_PREFERENCES, prefs);
  },

  // ── Macro progress ──────────────────────────────────────────────────────────
  async getMacroProgress<T>(): Promise<T | null> {
    return getJSON<T>(STORAGE_KEYS.MACRO_PROGRESS);
  },

  async setMacroProgress<T>(progress: T): Promise<void> {
    await setJSON(STORAGE_KEYS.MACRO_PROGRESS, progress);
  },

  // ── Sync date ────────────────────────────────────────────────────────────────
  async getLastSyncDate(): Promise<string | null> {
    return get(STORAGE_KEYS.LAST_SYNC_DATE);
  },

  async setLastSyncDate(date: string): Promise<void> {
    await set(STORAGE_KEYS.LAST_SYNC_DATE, date);
  },

  /** Wipe everything — used for "factory reset" / full logout */
  async clearAll(): Promise<void> {
    await AsyncStorage.clear().catch(() => undefined);
    // SecureStore doesn't expose a clear-all; remove each known secure key
    await Promise.all(
      Array.from(SECURE_KEYS).map((k) =>
        SecureStore.deleteItemAsync(k).catch(() => undefined),
      ),
    );
  },
};
