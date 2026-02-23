import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authProvider, AuthProviderError } from '@/core/auth';
import { eventBus } from '@/core/events';
import { STORAGE_KEYS } from '@/constants';
import type { AuthSession } from '@/core/auth';

/**
 * SESSION_EXPIRY_BUFFER_SECONDS — how many seconds before actual expiry we
 * consider a token stale and attempt a proactive refresh.
 */
const SESSION_EXPIRY_BUFFER_SECONDS = 60;

function isSessionExpired(session: AuthSession): boolean {
  return session.expiresAt - SESSION_EXPIRY_BUFFER_SECONDS < Math.floor(Date.now() / 1000);
}

async function persistSession(session: AuthSession): Promise<void> {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.AUTH_TOKEN, session.accessToken],
    [STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken],
    [STORAGE_KEYS.USER_PROFILE, JSON.stringify(session)],
  ]);
}

async function clearPersistedSession(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.AUTH_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER_PROFILE,
  ]);
}

async function loadPersistedSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'accessToken' in parsed &&
      'refreshToken' in parsed &&
      'expiresAt' in parsed &&
      'user' in parsed
    ) {
      return parsed as AuthSession;
    }
    return null;
  } catch {
    return null;
  }
}

interface AuthStore {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  // Subscribe to FORCE_LOGOUT once at store creation time.
  // This handles Axios-triggered logouts without circular imports.
  eventBus.on('FORCE_LOGOUT', () => {
    void get().logout();
  });

  return {
    session: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,

    login: async (email: string, password: string): Promise<void> => {
      set({ isLoading: true });
      try {
        const session = await authProvider.signIn(email, password);
        await persistSession(session);
        set({ session, isAuthenticated: true });
      } finally {
        set({ isLoading: false });
      }
    },

    register: async (email: string, password: string, displayName: string): Promise<void> => {
      set({ isLoading: true });
      try {
        const session = await authProvider.register(email, password, displayName);
        await persistSession(session);
        set({ session, isAuthenticated: true });
      } finally {
        set({ isLoading: false });
      }
    },

    logout: async (): Promise<void> => {
      // Stop all active builds before clearing session so setInterval callbacks
      // don't fire against a logged-out state (logout mid-build edge case).
      // Lazy import breaks the circular dep: authStore → projectsStore.
      const { useProjectsStore } = await import('@/store/projectsStore');
      useProjectsStore.getState().stopAllBuilds();

      set({ isLoading: true });
      try {
        await authProvider.signOut();
      } finally {
        await clearPersistedSession();
        set({ session: null, isAuthenticated: false, isLoading: false });
      }
    },

    restoreSession: async (): Promise<void> => {
      set({ isLoading: true });
      try {
        const stored = await loadPersistedSession();

        if (!stored) {
          set({ isInitialized: true });
          return;
        }

        if (!isSessionExpired(stored)) {
          set({ session: stored, isAuthenticated: true, isInitialized: true });
          return;
        }

        // Token is stale — attempt a silent refresh before giving up.
        try {
          const refreshed = await authProvider.refreshSession(stored.refreshToken);
          await persistSession(refreshed);
          set({ session: refreshed, isAuthenticated: true });
        } catch (err) {
          // Refresh failed — treat as logged out.
          if (err instanceof AuthProviderError) {
            console.warn('[authStore] Session refresh failed:', err.message);
          }
          await clearPersistedSession();
          set({ session: null, isAuthenticated: false });
        }
      } catch {
        await clearPersistedSession();
        set({ session: null, isAuthenticated: false });
      } finally {
        set({ isLoading: false, isInitialized: true });
      }
    },

    // Legacy alias kept so existing callers (AppProviders) compile without change.
    // Internally delegates to restoreSession.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } satisfies AuthStore;
});
