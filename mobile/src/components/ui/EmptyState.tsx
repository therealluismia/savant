import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps): React.JSX.Element {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing[8],
      paddingVertical: theme.spacing[12],
    },
    iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.primarySubtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[5],
    },
    iconText: {
      fontSize: 36,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing[2],
    },
    description: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
      marginBottom: theme.spacing[6],
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action}
    </View>
  );
}
