import { useAuthStore } from '@/store';

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
