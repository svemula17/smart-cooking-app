import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URLS } from '../config/env';
import { storage } from '../utils/storage';

// ─── Retry config ────────────────────────────────────────────────────────────
// One retry on transient failures (network errors + 5xx responses) with a
// short exponential backoff. We don't retry GETs forever — single retry is
// enough to mask packet loss on a flaky cellular link without making the UI
// feel stuck.
const RETRY_MAX = 1;
const RETRY_BASE_MS = 400;
const RETRIABLE_METHODS = new Set(['get', 'head', 'options']);

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _refreshAttempted?: boolean;
}

// ─── Refresh-token coordination ──────────────────────────────────────────────
// When N requests fail with 401 at the same time (likely after the 15-min
// access token expires), we don't want to fire N refresh calls. They share
// one in-flight refresh promise, then each retries with the new token.
let refreshPromise: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const rt = await storage.getRefreshToken();
      if (!rt) return null;
      // Use raw axios so we don't recurse through our own interceptor.
      const r = await axios.post(
        `${API_URLS.user}/auth/refresh`,
        { refreshToken: rt },
        { timeout: 12_000, headers: { 'Content-Type': 'application/json' } },
      );
      const newAccess: string | undefined = r.data?.data?.accessToken;
      if (!newAccess) return null;
      await storage.setAccessToken(newAccess);
      _token = newAccess;
      return newAccess;
    } catch {
      // Refresh failed (expired, revoked, network) → caller will clear auth.
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function isRetriable(error: AxiosError): boolean {
  const cfg = error.config as RetryableConfig | undefined;
  if (!cfg) return false;
  const method = (cfg.method ?? 'get').toLowerCase();
  // Idempotent methods only — never retry POST/PUT/PATCH/DELETE; could
  // cause duplicate writes.
  if (!RETRIABLE_METHODS.has(method)) return false;
  // No response = network error / timeout — definitely retry.
  if (!error.response) return true;
  // 5xx = server-side; safe to retry.
  return error.response.status >= 500 && error.response.status < 600;
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function makeClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 12_000,
    headers: { 'Content-Type': 'application/json' },
  });

  // ─── Request: attach bearer token ──────────────────────────────────────────
  instance.interceptors.request.use(async (config) => {
    // Prefer the in-memory cache (hot path), fall back to secure storage.
    const token = _token ?? (await storage.getAccessToken());
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ─── Response: 401 → refresh + retry once, transient → retry once ──────────
  instance.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
      const cfg = error.config as RetryableConfig | undefined;

      // 401 → try refreshing the access token ONCE before giving up.
      // Skip refresh attempts on /auth/* itself to avoid loops.
      if (
        error.response?.status === 401 &&
        cfg &&
        !cfg._refreshAttempted &&
        !cfg.url?.startsWith('/auth/')
      ) {
        cfg._refreshAttempted = true;
        const newToken = await attemptRefresh();
        if (newToken) {
          if (cfg.headers) cfg.headers.Authorization = `Bearer ${newToken}`;
          return instance.request(cfg);
        }
        // Refresh failed → clear auth so the UI can route to Login.
        _token = null;
        await storage.clearAuth();
        return Promise.reject(error);
      }

      // 401 we couldn't (or shouldn't) refresh — fall through to clear auth.
      if (error.response?.status === 401) {
        _token = null;
        await storage.clearAuth();
        return Promise.reject(error);
      }

      // One-shot retry on idempotent + transient failures
      if (cfg && isRetriable(error)) {
        cfg._retryCount = (cfg._retryCount ?? 0) + 1;
        if (cfg._retryCount <= RETRY_MAX) {
          // Exponential backoff with a tiny jitter so we don't thundering-
          // herd retry the moment a service comes back up.
          const wait = RETRY_BASE_MS * 2 ** (cfg._retryCount - 1) + Math.random() * 100;
          await delay(wait);
          return instance.request(cfg);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

export const userApi       = makeClient(API_URLS.user);
export const recipeApi     = makeClient(API_URLS.recipe);
export const nutritionApi  = makeClient(API_URLS.nutrition);
export const aiApi         = makeClient(API_URLS.ai);
export const houseApi      = makeClient(API_URLS.house);

// Keep a sync-accessible token for hot-path needs (set after login)
let _token: string | null = null;
export function setAuthToken(token: string | null) { _token = token; }
export function getAuthToken() { return _token; }
