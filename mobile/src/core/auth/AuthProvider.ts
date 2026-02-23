import type { AuthSession } from './AuthSession';

/**
 * AuthProvider — the interface every authentication backend must implement.
 *
 * The rest of the application depends only on this contract; no Supabase,
 * Firebase, or custom-API types leak beyond the implementation files.
 */
export interface AuthProvider {
  /**
   * Authenticate with email + password credentials.
   * Must return a fully-populated AuthSession or throw AuthProviderError.
   */
  signIn(email: string, password: string): Promise<AuthSession>;

  /**
   * Invalidate the current session on the provider side.
   * Must resolve even if the network is unavailable (best-effort).
   */
  signOut(): Promise<void>;

  /**
   * Exchange a refresh token for a new AuthSession.
   * Must throw AuthProviderError if the token is invalid or expired.
   */
  refreshSession(refreshToken: string): Promise<AuthSession>;

  /**
   * Return the current active session from the provider's storage,
   * or null if no session exists.
   * Must never throw — callers rely on the null return to redirect to login.
   */
  getSession(): Promise<AuthSession | null>;
}
