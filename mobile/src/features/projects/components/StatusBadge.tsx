import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks';
import type { ProjectStatus } from '../types';

interface StatusBadgeProps {
  status: ProjectStatus;
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; colorKey: 'success' | 'error' | 'warning' | 'info' }> = {
  idle: { label: 'Idle', colorKey: 'info' },
  building: { label: 'Building', colorKey: 'warning' },
  success: { label: 'Success', colorKey: 'success' },
  failed: { label: 'Failed', colorKey: 'error' },
};

export function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  const theme = useTheme();
  const config = STATUS_CONFIG[status];

  const bgColorMap: Record<typeof config.colorKey, string> = {
    success: theme.colors.successSubtle,
    error: theme.colors.errorSubtle,
    warning: theme.colors.warningSubtle,
    info: theme.colors.infoSubtle,
  };
  const textColorMap: Record<typeof config.colorKey, string> = {
    success: theme.colors.success,
    error: theme.colors.error,
    warning: theme.colors.warning,
    info: theme.colors.info,
  };

  const styles = StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[0.5],
      paddingHorizontal: theme.spacing[2.5],
      borderRadius: theme.radii.full,
      backgroundColor: bgColorMap[config.colorKey],
      gap: theme.spacing[1],
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: theme.radii.full,
      backgroundColor: textColorMap[config.colorKey],
    },
    label: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: textColorMap[config.colorKey],
      letterSpacing: theme.typography.letterSpacing.wide,
    },
  });

  return (
    <View style={styles.badge}>
      <View style={styles.dot} />
      <Text style={styles.label}>{config.label.toUpperCase()}</Text>
    </View>
  );
}
