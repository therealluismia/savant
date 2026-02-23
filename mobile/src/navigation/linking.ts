import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '@/types';

/**
 * linkingConfig — typed deep-link configuration for React Navigation.
 *
 * Scheme:  forgeai://
 *
 * Supported deep links:
 *   forgeai://auth/login              → Auth > Login
 *   forgeai://auth/register           → Auth > Register
 *   forgeai://auth/forgot-password    → Auth > ForgotPassword
 *   forgeai://app/home                → App  > Home
 *   forgeai://app/profile/:userId     → App  > Profile
 *   forgeai://app/settings            → App  > Settings
 */
export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: ['forgeai://'],
  config: {
    screens: {
      Auth: {
        path: 'auth',
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
      App: {
        path: 'app',
        screens: {
          Home: 'home',
          Profile: 'profile/:userId',
          Settings: 'settings',
        },
      },
    },
  },
};
