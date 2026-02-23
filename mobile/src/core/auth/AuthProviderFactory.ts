import type { AuthProvider } from './AuthProvider';
import { SupabaseAuthProvider } from './SupabaseAuthProvider';

/**
 * AuthProviderFactory — returns the singleton AuthProvider instance.
 *
 * Only this module knows which concrete provider is active.
 * Swap the implementation here without touching any store, hook, or screen.
 *
 * Future providers (Firebase, custom JWT, etc.) can be chosen here based
 * on env.APP_ENV or a feature flag without leaking provider types elsewhere.
 */
function createAuthProvider(): AuthProvider {
  return new SupabaseAuthProvider();
}

export const authProvider: AuthProvider = createAuthProvider();
