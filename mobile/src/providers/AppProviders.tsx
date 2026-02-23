import React, { useEffect, type ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useTheme } from '@/hooks';
import { useAuthStore, useThemeStore } from '@/store';
import type { Theme as NavTheme } from '@react-navigation/native';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  const theme = useTheme();
  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeTheme = useThemeStore((state) => state.initialize);

  useEffect(() => {
    void initializeAuth();
    void initializeTheme();
  }, [initializeAuth, initializeTheme]);

  const navTheme: NavTheme = {
    dark: theme.isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text.primary,
      border: theme.colors.border,
      notification: theme.colors.error,
    },
  };

  return <NavigationContainer theme={navTheme}>{children}</NavigationContainer>;
}
