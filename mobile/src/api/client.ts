import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appConfig } from '@/config';
import { STORAGE_KEYS, API_TIMEOUT } from '@/constants';
import type { ApiError } from '@/types';

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

const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (appConfig.enableLogging) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) {
    return null;
  }
  try {
    const response = await axios.post<{ accessToken: string }>(
      `${appConfig.apiBaseUrl}/auth/refresh`,
      { refreshToken },
    );
    const { accessToken } = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    return accessToken;
  } catch {
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.REFRESH_TOKEN]);
    return null;
  }
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (appConfig.enableLogging) {
      console.log(`[API] Response ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
          void reject;
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newToken = await attemptTokenRefresh();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      }
    }

    const apiError: ApiError = {
      message: error.response?.data?.message ?? error.message ?? 'An unexpected error occurred',
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
