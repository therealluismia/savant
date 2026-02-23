import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme, useAuth, useToast } from '@/hooks';

export default function HomeScreen(): React.JSX.Element {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { showSuccess } = useToast();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      showSuccess('Signed out', 'You have been signed out successfully.');
    } catch {
      // Logout clears state regardless of API call result
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing[6],
    },
    header: {
      marginBottom: theme.spacing[8],
    },
    greeting: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing[1],
    },
    userName: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing[6],
      marginBottom: theme.spacing[4],
      ...theme.shadows.sm,
    },
    cardTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[2],
    },
    cardBody: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primarySubtle,
      borderRadius: theme.radii.full,
      paddingVertical: theme.spacing[0.5],
      paddingHorizontal: theme.spacing[3],
      marginBottom: theme.spacing[3],
    },
    badgeText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: theme.colors.primary,
      letterSpacing: theme.typography.letterSpacing.wider,
    },
    logoutButton: {
      marginTop: theme.spacing[6],
      height: 52,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutText: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.displayName ?? 'Builder'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AI POWERED</Text>
          </View>
          <Text style={styles.cardTitle}>Start Building</Text>
          <Text style={styles.cardBody}>
            Your AI-powered development workspace is ready. Use the tools below to scaffold,
            generate, and deploy your next project in minutes.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Projects</Text>
          <Text style={styles.cardBody}>
            No projects yet. Create your first project to get started.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
