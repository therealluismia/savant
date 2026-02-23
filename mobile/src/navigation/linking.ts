import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '@/types';

/**
 * linkingConfig — typed deep-link configuration for React Navigation.
 *
 * Scheme:  forgeai://
 *
 * Supported deep links:
 *   forgeai://auth/login                        → Auth > Login
 *   forgeai://auth/register                     → Auth > Register
 *   forgeai://auth/forgot-password              → Auth > ForgotPassword
 *   forgeai://app/home                          → App  > Home
 *   forgeai://app/projects                      → App  > ProjectsList
 *   forgeai://app/projects/new                  → App  > CreateProject
 *   forgeai://app/projects/:projectId           → App  > ProjectDetail
 *   forgeai://app/projects/:projectId/logs      → App  > BuildLogs
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
          ProjectsList: 'projects',
          CreateProject: 'projects/new',
          ProjectDetail: 'projects/:projectId',
          BuildLogs: 'projects/:projectId/logs',
          Profile: 'profile/:userId',
          Settings: 'settings',
        },
      },
    },
  },
};
