import { env } from './env';

interface AppConfig {
  apiBaseUrl: string;
  appEnv: 'development' | 'staging' | 'production';
  apiTimeout: number;
  enableLogging: boolean;
}

export const appConfig: AppConfig = {
  apiBaseUrl: env.API_BASE_URL,
  appEnv: env.APP_ENV,
  apiTimeout: 30000,
  enableLogging: env.APP_ENV !== 'production',
};

export { env } from './env';
