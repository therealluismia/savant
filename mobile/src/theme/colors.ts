export const colors = {
  // Primary brand
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  // Neutrals
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    1000: '#020617',
  },
  // Semantic
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  error: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  // Transparent
  transparent: 'transparent',
} as const;

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  borderSubtle: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
  };
  primary: string;
  primaryHover: string;
  primarySubtle: string;
  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;
  error: string;
  errorSubtle: string;
  info: string;
  infoSubtle: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: colors.neutral[50],
  backgroundSecondary: colors.neutral[100],
  surface: colors.neutral[0],
  surfaceSecondary: colors.neutral[100],
  border: colors.neutral[200],
  borderSubtle: colors.neutral[100],
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[400],
    inverse: colors.neutral[0],
    disabled: colors.neutral[300],
  },
  primary: colors.primary[600],
  primaryHover: colors.primary[700],
  primarySubtle: colors.primary[50],
  success: colors.success[500],
  successSubtle: colors.success[50],
  warning: colors.warning[500],
  warningSubtle: colors.warning[50],
  error: colors.error[500],
  errorSubtle: colors.error[50],
  info: colors.info[500],
  infoSubtle: colors.info[50],
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors: ThemeColors = {
  background: colors.neutral[900],
  backgroundSecondary: colors.neutral[800],
  surface: colors.neutral[800],
  surfaceSecondary: colors.neutral[700],
  border: colors.neutral[700],
  borderSubtle: colors.neutral[800],
  text: {
    primary: colors.neutral[50],
    secondary: colors.neutral[400],
    tertiary: colors.neutral[500],
    inverse: colors.neutral[900],
    disabled: colors.neutral[600],
  },
  primary: colors.primary[400],
  primaryHover: colors.primary[300],
  primarySubtle: colors.primary[900],
  success: colors.success[500],
  successSubtle: colors.success[700],
  warning: colors.warning[500],
  warningSubtle: colors.warning[700],
  error: colors.error[500],
  errorSubtle: colors.error[700],
  info: colors.info[500],
  infoSubtle: colors.info[700],
  overlay: 'rgba(0, 0, 0, 0.7)',
};
