// src/utils/axios.ts
import axios from 'axios';
import { useUserStore } from '@/stores/user';

const api = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const userStore = useUserStore();
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
