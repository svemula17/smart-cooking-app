import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from '../config/env';

function makeClient(baseURL: string) {
  const instance = axios.create({
    baseURL,
    timeout: 12_000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (r) => r,
    async (error) => {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
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
