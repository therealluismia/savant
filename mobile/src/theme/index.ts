import { lightColors, darkColors, type ThemeColors } from './colors';
import { spacing, type Spacing } from './spacing';
import { typography, type Typography } from './typography';
import { radii, shadows, type Radii, type Shadows } from './radii';

export interface Theme {
  colors: ThemeColors;
  spacing: Spacing;
  typography: Typography;
  radii: Radii;
  shadows: Shadows;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  typography,
  radii,
  shadows,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  typography,
  radii,
  shadows,
  isDark: true,
};

export { lightColors, darkColors, spacing, typography, radii, shadows };
export type { ThemeColors, Spacing, Typography, Radii, Shadows };
