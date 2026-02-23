export const APP_NAME = 'ForgeAI Builder';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@forgeai/auth_token',
  REFRESH_TOKEN: '@forgeai/refresh_token',
  USER_PROFILE: '@forgeai/user_profile',
  THEME_PREFERENCE: '@forgeai/theme_preference',
  ONBOARDING_COMPLETE: '@forgeai/onboarding_complete',
} as const;

export const API_TIMEOUT = 30000;
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000;

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3500,
  LONG: 5000,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 400,
} as const;
