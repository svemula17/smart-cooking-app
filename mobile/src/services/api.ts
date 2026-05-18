import axios from 'axios';
import { API_URLS } from '../config/env';
import { storage } from '../utils/storage';

function makeClient(baseURL: string) {
  const instance = axios.create({
    baseURL,
    timeout: 12_000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(async (config) => {
    // Prefer the in-memory cache (hot path), fall back to secure storage.
    const token = _token ?? (await storage.getAccessToken());
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (r) => r,
    async (error) => {
      if (error.response?.status === 401) {
        _token = null;
        await storage.clearAuth();
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
