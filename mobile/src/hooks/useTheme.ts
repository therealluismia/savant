import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store';
import { lightTheme, darkTheme, type Theme } from '@/theme';

export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const { mode } = useThemeStore();

  if (mode === 'dark') {
    return darkTheme;
  }
  if (mode === 'light') {
    return lightTheme;
  }
  return systemScheme === 'dark' ? darkTheme : lightTheme;
}
