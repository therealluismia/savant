import Constants from 'expo-constants';

interface AppConfig {
  apiBaseUrl: string;
  appEnv: 'development' | 'staging' | 'production';
  apiTimeout: number;
  enableLogging: boolean;
}

function resolveConfig(): AppConfig {
  const extra = Constants.expoConfig?.extra ?? {};

  const rawEnv = (extra['appEnv'] as string | undefined) ?? 'development';
  const appEnv: AppConfig['appEnv'] =
    rawEnv === 'production' ? 'production' : rawEnv === 'staging' ? 'staging' : 'development';

  const apiBaseUrl =
    typeof extra['apiBaseUrl'] === 'string'
      ? extra['apiBaseUrl']
      : 'https://api.forgeai.dev';

  return {
    apiBaseUrl,
    appEnv,
    apiTimeout: 30000,
    enableLogging: appEnv !== 'production',
  };
}

export const appConfig: AppConfig = resolveConfig();
