import axios from 'axios';
import { toast } from 'sonner';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5097/api';

/**
 * Converts any relative API route or backend document path into a full absolute API URL.
 * Handles paths starting with '/api/', 'api/', or relative routes like '/Enrollment/...'.
 */
export const getApiUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  let cleanPath = path;
  if (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.substring(4);
  } else if (cleanPath.startsWith('api/')) {
    cleanPath = '/' + cleanPath.substring(4);
  }

  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  const base = API_BASE_URL.replace(/\/+$/, '');
  return `${base}${cleanPath}`;
};

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
    const isForgotPasswordRequest = typeof error.config?.url === 'string' && error.config.url.includes('/auth/forgot-password');
    const isResetPasswordRequest = typeof error.config?.url === 'string' && error.config.url.includes('/auth/reset-password');

    if (error.response) {
      const { status, data } = error.response;

      if (status === 429) {
        // Rate limited — let the individual page handle this with specific UX.
        // Do NOT show a generic toast here; the page knows the context (15 min wait, etc.).
      } else if (status === 400 && (isResetPasswordRequest || isForgotPasswordRequest)) {
        // 400 on auth endpoints (e.g., invalid/expired reset token) — let the page
        // handle this with its own dedicated error state rather than a generic toast.
      } else if (status === 401 && isLoginRequest) {
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
