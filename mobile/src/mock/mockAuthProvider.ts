import type { AuthProvider } from '@/core/auth/AuthProvider';
import { AuthProviderError, type AuthSession } from '@/core/auth/AuthSession';
import { findMockUser, toAuthUser } from './mockData';
import { simulateLatency } from './latencySimulator';

/**
 * Token TTL in seconds — 15 minutes, matching production-like short expiry
 * so refresh logic can be exercised without waiting hours.
 */
const ACCESS_TOKEN_TTL_SECONDS = 900;

let currentSession: AuthSession | null = null;

function generateToken(prefix: string): string {
  return `${prefix}_mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildSession(userId: string, email: string): AuthSession {
  return {
    accessToken: generateToken('access'),
    refreshToken: generateToken('refresh'),
    expiresAt: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
    user: { id: userId, email },
  };
}

export class MockAuthProvider implements AuthProvider {
  async signIn(email: string, password: string): Promise<AuthSession> {
    await simulateLatency(null, 600);

    const record = findMockUser(email);
    if (!record) {
      throw new AuthProviderError(
        `No account found for "${email}". Try alice@forgeai.dev / password123.`,
        'USER_NOT_FOUND',
      );
    }
    if (record.password !== password) {
      throw new AuthProviderError('Incorrect password.', 'WRONG_PASSWORD');
    }

    const session = buildSession(record.id, record.email);
    currentSession = session;
    return session;
  }

  async signOut(): Promise<void> {
    await simulateLatency(null, 300);
    currentSession = null;
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    await simulateLatency(null, 500);

    if (!currentSession || currentSession.refreshToken !== refreshToken) {
      throw new AuthProviderError('Refresh token is invalid or expired.', 'INVALID_REFRESH_TOKEN');
    }

    const refreshed = buildSession(currentSession.user.id, currentSession.user.email);
    currentSession = refreshed;
    return refreshed;
  }

  async getSession(): Promise<AuthSession | null> {
    await simulateLatency(null, 200);
    return currentSession;
  }
}
