import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// iOS Simulator can reach host machine via localhost
// Android Emulator needs 10.0.2.2 instead of localhost
// Ports must match .env SERVICE_PORT values (4001-4005)
const USER_SERVICE     = 'http://localhost:4001';
const RECIPE_SERVICE   = 'http://localhost:4002';
const SHOPPING_SERVICE = 'http://localhost:4005';

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

const NUTRITION_SERVICE = 'http://localhost:4003';
const AI_SERVICE        = 'http://localhost:4004';

export const userApi       = makeClient(USER_SERVICE);
export const recipeApi     = makeClient(RECIPE_SERVICE);
export const shoppingApi   = makeClient(SHOPPING_SERVICE);
export const nutritionApi  = makeClient(NUTRITION_SERVICE);
export const aiApi         = makeClient(AI_SERVICE);

// Keep a sync-accessible token for hot-path needs (set after login)
let _token: string | null = null;
export function setAuthToken(token: string | null) { _token = token; }
export function getAuthToken() { return _token; }
