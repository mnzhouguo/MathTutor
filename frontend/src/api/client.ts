import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create a typed axios instance that automatically unwraps response.data
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // You can add auth token here in the future
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - unwraps response.data
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    (error: AxiosError) => {
      // Handle common errors
      if (error.response) {
        // Server responded with error status
        console.error('API Error:', error.response.data);
      } else if (error.request) {
        // Request was made but no response
        console.error('Network Error:', error.message);
      } else {
        // Error in setting up request
        console.error('Request Error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const apiClient = createApiInstance();

export default apiClient;
