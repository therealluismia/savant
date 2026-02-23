import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, useAuth, useToast } from '@/hooks';
import { useProjectsStore } from '@/store';
import type { AppStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps): React.JSX.Element {
  const theme = useTheme();

  const styles = StyleSheet.create({
    row: {
      paddingVertical: theme.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    label: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: theme.typography.letterSpacing.wider,
      marginBottom: theme.spacing[1],
    },
    value: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeight.medium,
    },
  });

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen(): React.JSX.Element {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const { showSuccess } = useToast();

  const getStats = useProjectsStore((s) => s.getStats);
  const stats = getStats();

  const displayName = user?.email?.split('@')[0] ?? 'Builder';
  const memberSince = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleLogout = async (): Promise<void> => {
    await logout();
    showSuccess('Signed Out', 'You have been signed out.');
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: {
      paddingHorizontal: theme.spacing[5],
      paddingBottom: theme.spacing[12],
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing[8],
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.primarySubtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[3],
    },
    avatarText: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    displayName: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[0.5],
    },
    email: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing[3],
      marginBottom: theme.spacing[6],
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      paddingVertical: theme.spacing[4],
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statValue: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[0.5],
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: theme.colors.text.secondary,
      letterSpacing: theme.typography.letterSpacing.wider,
      textTransform: 'uppercase',
      marginBottom: theme.spacing[3],
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      paddingHorizontal: theme.spacing[5],
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing[6],
    },
    settingsBtn: {
      height: 48,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[3],
    },
    settingsBtnText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    logoutBtn: {
      height: 48,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutBtnText: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
        </View>

        {/* Quick stats */}
        <Text style={styles.sectionTitle}>Build Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats.success}</Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.error }]}>{stats.failed}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>

        {/* Account info */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <InfoRow label="User ID" value={user?.id ?? '—'} />
          <InfoRow label="Email" value={user?.email ?? '—'} />
          <InfoRow label="Member Since" value={memberSince} />
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.85}
        >
          <Text style={styles.settingsBtnText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => { void handleLogout(); }}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
