import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { appConfig } from '@/config';
import { authProvider } from '@/core/auth';
import { AuthProviderError } from '@/core/auth/AuthSession';
import { eventBus } from '@/core/events';
import { STORAGE_KEYS } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiError } from '@/types';

// ─── Error class ────────────────────────────────────────────────────────────

export class ApiRequestError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, string[]>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiRequestError';
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.details = error.details;
  }
}

// ─── Axios instance ──────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // Read from AsyncStorage so the token is always current even after refresh.
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (appConfig.enableLogging) {
      console.log(`[API] ${config.method?.toUpperCase() ?? 'REQUEST'} ${config.url ?? ''}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Refresh queue ───────────────────────────────────────────────────────────

let isRefreshing = false;

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (reason: unknown) => void;
};

let refreshQueue: QueueEntry[] = [];

function drainQueue(token: string): void {
  refreshQueue.forEach(({ resolve }) => resolve(token));
  refreshQueue = [];
}

function rejectQueue(reason: unknown): void {
  refreshQueue.forEach(({ reject }) => reject(reason));
  refreshQueue = [];
}

function enqueueRequest(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  });
}

// ─── Response interceptor ────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (appConfig.enableLogging) {
      console.log(`[API] ${response.status} ${response.config.url ?? ''}`);
    }
    return response;
  },
  async (error: AxiosError<ApiError>): Promise<AxiosResponse> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── 401 handling ──────────────────────────────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in-flight, queue this request.
      if (isRefreshing) {
        const newToken = await enqueueRequest();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!storedRefreshToken) {
          throw new AuthProviderError('No refresh token available.', 'NO_REFRESH_TOKEN');
        }

        const session = await authProvider.refreshSession(storedRefreshToken);

        // Persist the new tokens so subsequent request interceptors pick them up.
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.AUTH_TOKEN, session.accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken],
        ]);

        drainQueue(session.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        rejectQueue(refreshError);
        // Signal the rest of the app to perform a clean logout.
        eventBus.emit('FORCE_LOGOUT');

        const code =
          refreshError instanceof AuthProviderError
            ? refreshError.code
            : 'REFRESH_FAILED';

        return Promise.reject(
          new ApiRequestError({
            message: 'Session expired. Please sign in again.',
            code,
            statusCode: 401,
          }),
        );
      } finally {
        isRefreshing = false;
      }
    }

    // ── Generic error normalisation ───────────────────────────────────────
    const apiError: ApiError = {
      message:
        error.response?.data?.message ?? error.message ?? 'An unexpected error occurred.',
      code: error.response?.data?.code ?? 'UNKNOWN_ERROR',
      statusCode: error.response?.status ?? 0,
      details: error.response?.data?.details,
    };

    if (appConfig.enableLogging) {
      console.error(`[API] Error ${apiError.statusCode}: ${apiError.message}`);
    }

    return Promise.reject(new ApiRequestError(apiError));
  },
);

export default apiClient;
