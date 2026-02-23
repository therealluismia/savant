import apiClient from './client';
import type { ApiResponse } from '@/types';
import type { User, AuthTokens } from '@/types/auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface ForgotPasswordPayload {
  email: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    return response.data.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>(
      '/auth/register',
      payload,
    );
    return response.data.data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    await apiClient.post('/auth/forgot-password', payload);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
};
