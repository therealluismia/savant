import React, { useEffect, type ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useTheme } from '@/hooks';
import { useAppStateBuilds } from '@/hooks/useAppStateBuilds';
import { useAuthStore, useThemeStore } from '@/store';
import { linkingConfig } from '@/navigation/linking';
import type { Theme as NavTheme } from '@react-navigation/native';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  const theme = useTheme();
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const initializeTheme = useThemeStore((state) => state.initialize);

  // Stop all active builds when the app goes to background / becomes inactive.
  useAppStateBuilds();

  useEffect(() => {
    void restoreSession();
    void initializeTheme();
  }, [restoreSession, initializeTheme]);

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

  return (
    <NavigationContainer theme={navTheme} linking={linkingConfig}>
      {children}
    </NavigationContainer>
  );
}
