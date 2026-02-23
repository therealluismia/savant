import apiClient from './client';
import type { ApiResponse } from '@/types';
import type { AuthUser } from '@/core/auth';

/**
 * authApi — REST helpers for auth-adjacent endpoints that sit outside the
 * provider boundary (e.g. fetching an enriched user profile after sign-in).
 *
 * Authentication itself (signIn / signOut / refresh) is handled exclusively
 * by the AuthProvider in src/core/auth — never call those here.
 */
export const authApi = {
  /**
   * Fetch the extended user profile from the backend.
   * Call this after sign-in when you need fields beyond id/email.
   */
  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    return response.data.data;
  },
};
