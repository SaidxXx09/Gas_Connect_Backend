import axios from 'axios';
import useAuthStore from '../context/storeAuth';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = useAuthStore.getState()?.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
