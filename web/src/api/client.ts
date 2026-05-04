import axios from 'axios';

export const userApi = axios.create({ baseURL: 'http://localhost:3001' });
export const recipeApi = axios.create({ baseURL: 'http://localhost:3002' });
export const shoppingApi = axios.create({ baseURL: 'http://localhost:3003' });

/** Attach the stored JWT to every request automatically */
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

addAuthInterceptor(userApi);
addAuthInterceptor(recipeApi);
addAuthInterceptor(shoppingApi);
