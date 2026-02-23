/**
 * AuthUser — the minimal user identity carried inside every session.
 * All fields are required; the provider layer must populate them.
 */
export interface AuthUser {
  id: string;
  email: string;
}

/**
 * AuthSession — the canonical session object used throughout the app.
 * The provider layer is responsible for mapping its own session format
 * into this shape before returning it to callers.
 */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  /**
   * Unix epoch (seconds) at which the access token expires.
   * Used to detect staleness before attempting an API call.
   */
  expiresAt: number;
  user: AuthUser;
}

/**
 * AuthProviderError — structured error thrown by any AuthProvider implementation.
 * Callers should catch this type to display meaningful messages.
 */
export class AuthProviderError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AuthProviderError';
    this.code = code;
  }
}
