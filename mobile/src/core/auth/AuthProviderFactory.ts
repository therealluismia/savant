import type { AuthProvider } from './AuthProvider';
import { MockAuthProvider } from '@/mock/mockAuthProvider';

/**
 * AuthProviderFactory — returns the singleton AuthProvider instance.
 *
 * Currently wired to MockAuthProvider for frontend development.
 * To switch to Supabase: replace MockAuthProvider with SupabaseAuthProvider.
 * No other file needs to change.
 */
function createAuthProvider(): AuthProvider {
  return new MockAuthProvider();
}

export const authProvider: AuthProvider = createAuthProvider();
