import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { lightTheme } from '@/theme';

interface ErrorFallbackProps {
  error: string;
  onRetry?: () => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTheme.colors.background,
    paddingHorizontal: lightTheme.spacing[6],
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: lightTheme.radii.full,
    backgroundColor: lightTheme.colors.errorSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: lightTheme.spacing[5],
  },
  iconText: {
    fontSize: 32,
    color: lightTheme.colors.error,
  },
  title: {
    fontSize: lightTheme.typography.fontSize.xl,
    fontWeight: lightTheme.typography.fontWeight.bold,
    color: lightTheme.colors.text.primary,
    textAlign: 'center',
    marginBottom: lightTheme.spacing[2],
  },
  message: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: lightTheme.typography.fontSize.sm * lightTheme.typography.lineHeight.relaxed,
    marginBottom: lightTheme.spacing[8],
  },
  retryBtn: {
    height: 48,
    paddingHorizontal: lightTheme.spacing[8],
    backgroundColor: lightTheme.colors.primary,
    borderRadius: lightTheme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: lightTheme.colors.text.inverse,
    fontSize: lightTheme.typography.fontSize.base,
    fontWeight: lightTheme.typography.fontWeight.semiBold,
  },
});

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Text style={styles.iconText}>!</Text>
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
