import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  ProjectsList: undefined;
  CreateProject: undefined;
  ProjectDetail: { projectId: string };
  BuildLogs: { projectId: string; buildId: string | null };
  Profile: { userId?: string };
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  App: NavigatorScreenParams<AppStackParamList> | undefined;
};
