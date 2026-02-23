import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, useAuth } from '@/hooks';
import { useProjectsStore } from '@/store';
import { StatusBadge } from '@/features/projects/components/StatusBadge';
import type { AppStackParamList } from '@/types';
import type { Project } from '@/features/projects/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

interface StatCardProps {
  label: string;
  value: number;
  accent: string;
  accentSubtle: string;
}

function StatCard({ label, value, accent, accentSubtle }: StatCardProps): React.JSX.Element {
  const theme = useTheme();

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing[4],
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    valuePill: {
      width: 48,
      height: 48,
      borderRadius: theme.radii.full,
      backgroundColor: accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[2],
    },
    value: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: accent,
    },
    label: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.valuePill}>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

interface ActivityRowProps {
  project: Project;
  onPress: () => void;
}

function ActivityRow({ project, onPress }: ActivityRowProps): React.JSX.Element {
  const theme = useTheme();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    info: { flex: 1, marginRight: theme.spacing[3] },
    name: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[0.5],
    },
    date: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
    },
  });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
        <Text style={styles.date}>
          {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </View>
      <StatusBadge status={project.status} />
    </TouchableOpacity>
  );
}

export default function HomeScreen(): React.JSX.Element {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();

  const projects = useProjectsStore((s) => s.projects);
  const fetchProjects = useProjectsStore((s) => s.fetchProjects);
  const getStats = useProjectsStore((s) => s.getStats);

  useEffect(() => {
    if (projects.length === 0) {
      void fetchProjects();
    }
  }, [fetchProjects, projects.length]);

  const stats = getStats();
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: {
      padding: theme.spacing[5],
      paddingBottom: theme.spacing[12],
    },
    greeting: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing[0.5],
    },
    userName: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[6],
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: theme.colors.text.secondary,
      letterSpacing: theme.typography.letterSpacing.wider,
      textTransform: 'uppercase',
      marginBottom: theme.spacing[3],
    },
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing[3],
      marginBottom: theme.spacing[6],
    },
    activityCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      paddingHorizontal: theme.spacing[4],
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing[5],
    },
    activityRowLast: {
      borderBottomWidth: 0,
    },
    ctaRow: {
      flexDirection: 'row',
      gap: theme.spacing[3],
      marginBottom: theme.spacing[4],
    },
    primaryBtn: {
      flex: 1,
      height: 48,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      color: theme.colors.text.inverse,
      fontWeight: theme.typography.fontWeight.semiBold,
      fontSize: theme.typography.fontSize.base,
    },
    secondaryBtn: {
      flex: 1,
      height: 48,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryBtnText: {
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeight.medium,
      fontSize: theme.typography.fontSize.base,
    },
    logoutBtn: {
      height: 44,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing[2],
    },
    logoutText: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
    },
    emptyActivity: {
      paddingVertical: theme.spacing[6],
      alignItems: 'center',
    },
    emptyActivityText: {
      color: theme.colors.text.tertiary,
      fontSize: theme.typography.fontSize.sm,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.email?.split('@')[0] ?? 'Builder'}</Text>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Total"
            value={stats.total}
            accent={theme.colors.primary}
            accentSubtle={theme.colors.primarySubtle}
          />
          <StatCard
            label="Success"
            value={stats.success}
            accent={theme.colors.success}
            accentSubtle={theme.colors.successSubtle}
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            accent={theme.colors.error}
            accentSubtle={theme.colors.errorSubtle}
          />
          <StatCard
            label="Building"
            value={stats.building}
            accent={theme.colors.warning}
            accentSubtle={theme.colors.warningSubtle}
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('CreateProject')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>+ New Project</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('ProjectsList')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>View All</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {recentProjects.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>No recent activity</Text>
            </View>
          ) : (
            recentProjects.map((project, idx) => (
              <ActivityRow
                key={project.id}
                project={project}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
              />
            ))
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
