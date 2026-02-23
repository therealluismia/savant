export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Profile: { userId?: string };
  Settings: undefined;
};

export type RootStackParamList = {
  Loading: undefined;
  Auth: { screen?: keyof AuthStackParamList };
  App: { screen?: keyof AppStackParamList };
};
