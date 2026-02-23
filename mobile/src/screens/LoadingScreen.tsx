import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks';

export default function LoadingScreen(): React.JSX.Element {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    logoText: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing[6],
      letterSpacing: theme.typography.letterSpacing.tight,
    },
    tagline: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing[4],
      letterSpacing: theme.typography.letterSpacing.wide,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)}>
        <Text style={styles.logoText}>ForgeAI Builder</Text>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.tagline}>Loading...</Text>
      </Animated.View>
    </View>
  );
}
