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

  // ─── Response: 401 → clear auth, transient → retry once ────────────────────
  instance.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
      // 401 → drop token + bubble up so callers can route to Login
      if (error.response?.status === 401) {
        _token = null;
        await storage.clearAuth();
        return Promise.reject(error);
      }

      // One-shot retry on idempotent + transient failures
      const cfg = error.config as RetryableConfig | undefined;
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
export const shoppingApi   = makeClient(API_URLS.shopping);
export const nutritionApi  = makeClient(API_URLS.nutrition);
export const aiApi         = makeClient(API_URLS.ai);
export const houseApi      = makeClient(API_URLS.house);

// Keep a sync-accessible token for hot-path needs (set after login)
let _token: string | null = null;
export function setAuthToken(token: string | null) { _token = token; }
export function getAuthToken() { return _token; }
