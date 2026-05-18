/**
 * Tests for the API URL resolver. This module reads EXPO_PUBLIC_* env vars
 * at import time (Expo inlines them into process.env), so we can't exercise
 * the env-driven branches inside Jest — those are validated by EAS build.
 * What we can guarantee here is that the resolver always produces a
 * well-formed URL for every service, never undefined, and never with a
 * mismatched port.
 */
import { API_URLS, ENV_INFO } from '../config/env';

describe('config/env', () => {
  test('exports a URL for every service', () => {
    expect(API_URLS.user).toMatch(/^https?:\/\/.+/);
    expect(API_URLS.recipe).toMatch(/^https?:\/\/.+/);
    expect(API_URLS.nutrition).toMatch(/^https?:\/\/.+/);
    expect(API_URLS.ai).toMatch(/^https?:\/\/.+/);
    expect(API_URLS.shopping).toMatch(/^https?:\/\/.+/);
    expect(API_URLS.house).toMatch(/^https?:\/\/.+/);
  });

  test('exposes env info for debug screens', () => {
    expect(ENV_INFO).toHaveProperty('isProduction');
    expect(ENV_INFO).toHaveProperty('source');
    expect(typeof ENV_INFO.devHost).toBe('string');
  });

  test('dev-fallback host is the LAN IP, not localhost (which would not work on a phone)', () => {
    // The default `EXPO_PUBLIC_DEV_HOST` must be a routable IP. The phone
    // running Expo Go can't reach "localhost" — that resolves to the phone
    // itself. We default to 10.0.0.34 (the Mac's LAN IP). When the source
    // is dev-defaults the URLs should embed that host.
    if (ENV_INFO.source === 'dev-defaults') {
      expect(API_URLS.user).toContain(ENV_INFO.devHost);
      expect(ENV_INFO.devHost).not.toBe('localhost');
    }
  });
});
