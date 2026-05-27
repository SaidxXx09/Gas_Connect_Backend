import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use(
  (config) => {
    try {
      const authStorage = localStorage.getItem('auth-token');
      
      if (authStorage) {
        const auth = JSON.parse(authStorage);
        const token = auth?.state?.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error al obtener el token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
