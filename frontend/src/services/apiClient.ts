import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('educore_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401, 403, and global network errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = typeof error.config?.url === 'string' && error.config.url.includes('/auth/login');

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401 && isLoginRequest) {
        // A failed login attempt is not an expired session — let the login page
        // surface the actual error (e.g. "Invalid email or password.") itself.
      } else if (status === 401) {
        localStorage.removeItem('educore_token');
        localStorage.removeItem('educore_user');
        if (window.location.pathname !== '/login') {
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        toast.error('Access Denied: You do not have permission for this action.');
      } else if (status === 500) {
        toast.error('System Error: An unexpected server error occurred.');
      } else if (data && data.message) {
        toast.error(data.message);
      }
    } else if (error.request) {
      toast.error('Network Error: Unable to reach EduCore API server.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
