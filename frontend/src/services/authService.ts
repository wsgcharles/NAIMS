import apiClient from './apiClient';
import type {
  LoginRequest,
  LoginResponse,
  CurrentUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<CurrentUser> => {
    const response = await apiClient.get<CurrentUser>('/auth/me');
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/auth/change-password', data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  logout: () => {
    localStorage.removeItem('educore_token');
    localStorage.removeItem('educore_user');
  },
};
