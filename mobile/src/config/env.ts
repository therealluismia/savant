import Constants from 'expo-constants';

/**
 * Env — strictly typed environment variables sourced from app.json `extra`.
 * All keys are required strings; missing values cause a loud failure at boot
 * rather than silent undefined behaviour at runtime.
 */
export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  API_BASE_URL: string;
  APP_ENV: 'development' | 'staging' | 'production';
}

function resolveAppEnv(raw: unknown): Env['APP_ENV'] {
  if (raw === 'production') return 'production';
  if (raw === 'staging') return 'staging';
  return 'development';
}

function requireString(key: string, value: unknown): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  throw new Error(
    `[env] Missing or empty required config key "${key}". ` +
      `Add it to the "extra" field in app.json.`,
  );
}

function resolveEnv(): Env {
  const extra: Record<string, unknown> = Constants.expoConfig?.extra ?? {};

  return {
    SUPABASE_URL: requireString('supabaseUrl', extra['supabaseUrl']),
    SUPABASE_ANON_KEY: requireString('supabaseAnonKey', extra['supabaseAnonKey']),
    API_BASE_URL: requireString('apiBaseUrl', extra['apiBaseUrl']),
    APP_ENV: resolveAppEnv(extra['appEnv']),
  };
}

export const env: Env = resolveEnv();
