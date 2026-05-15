import axios from 'axios';

const HOST = (import.meta.env.VITE_API_HOST as string) || 'http://localhost';

export const userApi      = axios.create({ baseURL: `${HOST}:4001` });
export const recipeApi    = axios.create({ baseURL: `${HOST}:4002` });
export const nutritionApi = axios.create({ baseURL: `${HOST}:4003` });
export const aiApi        = axios.create({ baseURL: `${HOST}:4004` });
export const shoppingApi  = axios.create({ baseURL: `${HOST}:4005` });
export const houseApi     = axios.create({ baseURL: `${HOST}:4006` });

function addAuthInterceptor(instance: ReturnType<typeof axios.create>, isCritical: boolean) {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  instance.interceptors.response.use(
    (r) => r,
    (err) => {
      const status = err.response?.status;
      // Only force-logout on 401 from the critical user service (auth/profile).
      // For other services, surface the error to the page so it can show a friendly fallback
      // instead of nuking the session.
      if (status === 401 && isCritical) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(err);
    },
  );
}

addAuthInterceptor(userApi, true);
addAuthInterceptor(recipeApi, false);
addAuthInterceptor(nutritionApi, false);
addAuthInterceptor(aiApi, false);
addAuthInterceptor(shoppingApi, false);
addAuthInterceptor(houseApi, false);
