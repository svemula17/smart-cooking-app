import AsyncStorage from '@react-native-async-storage/async-storage';

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
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ─── Low-level helpers ────────────────────────────────────────────────────────

/** Get a raw string value, returns null if not found or on error */
async function get(key: StorageKey): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Set a raw string value */
async function set(key: StorageKey, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Silently swallow — storage errors should not crash the app
  }
}

/** Remove a key */
async function remove(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Remove multiple keys in one call */
async function removeMany(keys: StorageKey[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch {
    // ignore
  }
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

/** Serialize + store any JSON-serialisable value */
async function setJSON<T>(key: StorageKey, value: T): Promise<void> {
  await set(key, JSON.stringify(value));
}

/** Retrieve + parse a JSON value, returns null on error or missing key */
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

  // ── Auth tokens ─────────────────────────────────────────────────────────────
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

  /** Persist both tokens in parallel */
  async setTokens(access: string, refresh?: string): Promise<void> {
    await Promise.all([
      set(STORAGE_KEYS.ACCESS_TOKEN, access),
      refresh ? set(STORAGE_KEYS.REFRESH_TOKEN, refresh) : Promise.resolve(),
    ]);
  },

  /** Remove all auth-related keys (called on logout) */
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
    try {
      await AsyncStorage.clear();
    } catch {
      // ignore
    }
  },
};
