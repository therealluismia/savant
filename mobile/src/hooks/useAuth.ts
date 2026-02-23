import { useAuthStore } from '@/store';
import { authApi } from '@/api';
import type { LoginPayload, RegisterPayload } from '@/api/auth';

export function useAuth() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuthStore();

  const login = async (payload: LoginPayload): Promise<void> => {
    useAuthStore.getState().setLoading(true);
    try {
      const { user: u, tokens } = await authApi.login(payload);
      await signIn(u, tokens);
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    useAuthStore.getState().setLoading(true);
    try {
      const { user: u, tokens } = await authApi.register(payload);
      await signIn(u, tokens);
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      await signOut();
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
}
