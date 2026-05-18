/**
 * Storage tests. The real `storage` module talks to expo-secure-store
 * (native) for tokens and AsyncStorage for everything else. We mock both
 * with in-memory maps so we can verify the routing rules without bringing
 * up a real device.
 */

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    deleteItemAsync: jest.fn(async (k: string) => {
      store.delete(k);
    }),
    __reset: () => store.clear(),
    __store: store,
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      setItem: jest.fn(async (k: string, v: string) => {
        store.set(k, v);
      }),
      getItem: jest.fn(async (k: string) => store.get(k) ?? null),
      removeItem: jest.fn(async (k: string) => {
        store.delete(k);
      }),
      multiRemove: jest.fn(async (keys: string[]) => {
        for (const k of keys) store.delete(k);
      }),
      clear: jest.fn(async () => store.clear()),
      __reset: () => store.clear(),
      __store: store,
    },
  };
});

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { storage } from '../utils/storage';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

beforeEach(() => {
  // Reset both stores between tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (SecureStore as any).__reset();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (AsyncStorage as any).__reset();
});

describe('utils/storage', () => {
  test('tokens go to SecureStore, not AsyncStorage', async () => {
    await storage.setTokens('access-abc', 'refresh-xyz');

    expect(await SecureStore.getItemAsync('accessToken')).toBe('access-abc');
    expect(await SecureStore.getItemAsync('refreshToken')).toBe('refresh-xyz');
    expect(await AsyncStorage.getItem('accessToken')).toBeNull();
    expect(await AsyncStorage.getItem('refreshToken')).toBeNull();
  });

  test('legacy tokens in AsyncStorage are auto-migrated to SecureStore on first read', async () => {
    // Simulate an old install where tokens were still in AsyncStorage.
    await AsyncStorage.setItem('accessToken', 'legacy-token');

    const value = await storage.getAccessToken();

    expect(value).toBe('legacy-token');
    // Should now live in SecureStore...
    expect(await SecureStore.getItemAsync('accessToken')).toBe('legacy-token');
    // ...and be gone from AsyncStorage.
    expect(await AsyncStorage.getItem('accessToken')).toBeNull();
  });

  test('clearAuth wipes both access and refresh tokens', async () => {
    await storage.setTokens('a', 'r');
    await storage.setUser({ id: 'u1', email: 'x@y.com' });

    await storage.clearAuth();

    expect(await storage.getAccessToken()).toBeNull();
    expect(await storage.getRefreshToken()).toBeNull();
    expect(await storage.getUser()).toBeNull();
  });

  test('non-sensitive keys (user object, preferences) stay in AsyncStorage', async () => {
    const user = { id: 'u1', name: 'Sai', email: 'sai@example.com' };
    await storage.setUser(user);

    // User goes to AsyncStorage, not SecureStore
    expect(await AsyncStorage.getItem('user')).toBe(JSON.stringify(user));
    expect(await SecureStore.getItemAsync('user')).toBeNull();

    // Round-trips through getUser
    expect(await storage.getUser()).toEqual(user);
  });
});
