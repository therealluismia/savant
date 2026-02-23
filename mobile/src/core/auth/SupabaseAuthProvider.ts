import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import { env } from '@/config/env';
import type { AuthProvider } from './AuthProvider';
import { AuthProviderError, type AuthSession, type AuthUser } from './AuthSession';

/**
 * Maps a raw Supabase Session into our canonical AuthSession shape.
 * Throws AuthProviderError if any required field is absent.
 */
function mapSession(session: Session): AuthSession {
  const { access_token, refresh_token, expires_at, user } = session;

  if (!access_token) {
    throw new AuthProviderError('Supabase session is missing access_token.', 'MISSING_ACCESS_TOKEN');
  }
  if (!refresh_token) {
    throw new AuthProviderError(
      'Supabase session is missing refresh_token.',
      'MISSING_REFRESH_TOKEN',
    );
  }
  if (!user.email) {
    throw new AuthProviderError('Supabase user is missing email.', 'MISSING_USER_EMAIL');
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
  };

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    // expires_at is epoch seconds; fall back to 1 hour from now if absent.
    expiresAt: expires_at ?? Math.floor(Date.now() / 1000) + 3600,
    user: authUser,
  };
}

/**
 * SupabaseAuthProvider — concrete AuthProvider implementation backed by
 * @supabase/supabase-js. No Supabase types escape this module.
 */
export class SupabaseAuthProvider implements AuthProvider {
  private readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthProviderError(error.message, error.code ?? 'SIGN_IN_ERROR');
    }
    if (!data.session) {
      throw new AuthProviderError(
        'Sign-in succeeded but no session was returned.',
        'NO_SESSION_RETURNED',
      );
    }

    return mapSession(data.session);
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) {
      // Best-effort: log but do not re-throw so local state is always cleared.
      console.warn('[SupabaseAuthProvider] signOut error (ignored):', error.message);
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    const { data, error } = await this.client.auth.refreshSession({ refresh_token: refreshToken });

    if (error) {
      throw new AuthProviderError(error.message, error.code ?? 'REFRESH_ERROR');
    }
    if (!data.session) {
      throw new AuthProviderError(
        'Token refresh succeeded but no session was returned.',
        'NO_SESSION_AFTER_REFRESH',
      );
    }

    return mapSession(data.session);
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.client.auth.getSession();

    if (error) {
      console.warn('[SupabaseAuthProvider] getSession error:', error.message);
      return null;
    }
    if (!data.session) {
      return null;
    }

    try {
      return mapSession(data.session);
    } catch {
      return null;
    }
  }

  async register(email: string, password: string, _displayName: string): Promise<AuthSession> {
    const { data, error } = await this.client.auth.signUp({ email, password });

    if (error) {
      throw new AuthProviderError(error.message, error.code ?? 'SIGN_UP_ERROR');
    }
    if (!data.session) {
      throw new AuthProviderError(
        'Registration succeeded but no session was returned. Email confirmation may be required.',
        'NO_SESSION_AFTER_SIGNUP',
      );
    }

    return mapSession(data.session);
  }
}
