import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL =  'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    return Promise.reject(error);
  }
);

export default api;