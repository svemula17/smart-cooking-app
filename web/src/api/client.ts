import axios from 'axios';

const HOST = (import.meta.env.VITE_API_HOST as string) || 'http://localhost';

export const userApi     = axios.create({ baseURL: `${HOST}:4001` });
export const recipeApi   = axios.create({ baseURL: `${HOST}:4002` });
export const nutritionApi = axios.create({ baseURL: `${HOST}:4003` });
export const aiApi       = axios.create({ baseURL: `${HOST}:4004` });
export const shoppingApi = axios.create({ baseURL: `${HOST}:4005` });
export const houseApi    = axios.create({ baseURL: `${HOST}:4006` });

function addAuthInterceptor(instance: ReturnType<typeof axios.create>) {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  instance.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    },
  );
}

[userApi, recipeApi, nutritionApi, aiApi, shoppingApi, houseApi].forEach(addAuthInterceptor);
