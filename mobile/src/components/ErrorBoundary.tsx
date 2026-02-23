import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { lightTheme } from '@/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
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
    fontSize: lightTheme.typography.fontSize['2xl'],
    color: lightTheme.colors.error,
    fontWeight: lightTheme.typography.fontWeight.bold,
  },
  title: {
    fontSize: lightTheme.typography.fontSize.xl,
    fontWeight: lightTheme.typography.fontWeight.bold,
    color: lightTheme.colors.text.primary,
    textAlign: 'center',
    marginBottom: lightTheme.spacing[3],
  },
  message: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight:
      lightTheme.typography.fontSize.base * lightTheme.typography.lineHeight.relaxed,
    marginBottom: lightTheme.spacing[8],
  },
  retryButton: {
    height: 52,
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

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <View style={styles.container}>
          <View style={styles.iconWrapper}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message ??
              'An unexpected error occurred. Please try again.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleRetry}
            activeOpacity={0.85}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
