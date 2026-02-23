import React, { useLayoutEffect, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme, useToast } from '@/hooks';
import { useProjectsStore } from '@/store';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorFallback } from '@/components';
import { hapticMedium, hapticSuccess, hapticError, hapticWarning } from '@/utils/haptics';
import type { AppStackParamList } from '@/types';

type Props = NativeStackScreenProps<AppStackParamList, 'ProjectDetail'>;
type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function ProjectDetailScreen(): React.JSX.Element {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { projectId } = route.params;
  const { showError } = useToast();

  const project = useProjectsStore((s) => s.getProjectById(projectId));
  const isBuilding = useProjectsStore((s) => Boolean(s.activeBuilds[projectId]));
  const startBuild = useProjectsStore((s) => s.startBuild);

  // ── Rapid-tap guard ────────────────────────────────────────────────────────
  // useRef persists across renders without causing re-renders itself.
  const startPressedAt = useRef<number>(0);
  const BUILD_DEBOUNCE_MS = 800;

  // ── Build complete micro-animation ─────────────────────────────────────────
  // Track previous isBuilding so we can detect the transition false→true→false
  const prevIsBuilding = useRef(false);
  const statusScale = useSharedValue(1);
  const statusOpacity = useSharedValue(1);

  useEffect(() => {
    const justFinished = prevIsBuilding.current && !isBuilding;
    if (justFinished && project) {
      if (project.status === 'success') {
        hapticSuccess();
        // Scale-up then bounce back
        statusScale.value = withSequence(
          withTiming(1.15, { duration: 150 }),
          withSpring(1, { damping: 8, stiffness: 200 }),
        );
      } else if (project.status === 'failed') {
        hapticError();
        // Shake: oscillate scale slightly
        statusScale.value = withSequence(
          withTiming(0.88, { duration: 80 }),
          withTiming(1.08, { duration: 80 }),
          withTiming(0.94, { duration: 80 }),
          withSpring(1, { damping: 10 }),
        );
      }
    }
    prevIsBuilding.current = isBuilding;
  }, [isBuilding, project, statusScale, statusOpacity]);

  const statusAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statusScale.value }],
    opacity: statusOpacity.value,
  }));

  useLayoutEffect(() => {
    navigation.setOptions({ title: project?.name ?? 'Project' });
  }, [navigation, project?.name]);

  const handleStartBuild = (): void => {
    // Rapid-tap guard: ignore presses within BUILD_DEBOUNCE_MS of the last one
    const now = Date.now();
    if (now - startPressedAt.current < BUILD_DEBOUNCE_MS) return;
    startPressedAt.current = now;

    if (isBuilding) {
      hapticWarning();
      showError('Build Running', 'A build is already in progress for this project.');
      return;
    }
    hapticMedium();
    startBuild(projectId);
    navigation.navigate('BuildLogs', {
      projectId,
      buildId: project?.lastBuildId ?? null,
    });
  };

  if (!project) {
    return <ErrorFallback error="Project not found." onRetry={() => navigation.goBack()} />;
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing[5],
      paddingBottom: theme.spacing[12],
    },
    headerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing[5],
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing[4],
    },
    projectName: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[2],
    },
    description: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
      marginBottom: theme.spacing[4],
    },
    metaSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing[4],
      overflow: 'hidden',
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[5],
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    metaRowLast: {
      borderBottomWidth: 0,
    },
    metaLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    metaValue: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeight.medium,
      maxWidth: '60%',
      textAlign: 'right',
    },
    buildBtn: {
      height: 52,
      borderRadius: theme.radii.md,
      backgroundColor: isBuilding ? theme.colors.warning : theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[3],
    },
    buildBtnText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semiBold,
    },
    logsBtn: {
      height: 48,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logsBtnText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.projectName}>{project.name}</Text>
          <Text style={styles.description}>{project.description}</Text>
          {/* Animated wrapper — scales on build complete */}
          <Animated.View style={statusAnimStyle}>
            <StatusBadge status={isBuilding ? 'building' : project.status} />
          </Animated.View>
        </View>

        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Project ID</Text>
            <Text style={styles.metaValue} numberOfLines={1}>{project.id}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created</Text>
            <Text style={styles.metaValue}>{formatDate(project.createdAt)}</Text>
          </View>
          <View style={[styles.metaRow, styles.metaRowLast]}>
            <Text style={styles.metaLabel}>Last Updated</Text>
            <Text style={styles.metaValue}>{formatDate(project.updatedAt)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.buildBtn}
          onPress={handleStartBuild}
          activeOpacity={0.85}
          disabled={isBuilding}
        >
          <Text style={styles.buildBtnText}>
            {isBuilding ? 'Build Running...' : 'Start Build'}
          </Text>
        </TouchableOpacity>

        {project.lastBuildId ? (
          <TouchableOpacity
            style={styles.logsBtn}
            onPress={() => navigation.navigate('BuildLogs', { projectId, buildId: project.lastBuildId })}
            activeOpacity={0.8}
          >
            <Text style={styles.logsBtnText}>View Last Build Logs</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}
