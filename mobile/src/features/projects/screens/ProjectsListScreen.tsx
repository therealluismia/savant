import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Platform,
  type ListRenderItem,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useToast } from '@/hooks';
import { useProjects } from '../hooks/useProjects';
import { useProjectsStore } from '@/store';
import { ProjectCard } from '../components/ProjectCard';
import { SkeletonCard, EmptyState, ConfirmModal } from '@/components';
import {
  hapticLight,
  hapticMedium,
  hapticWarning,
  hapticSuccess,
  hapticError,
} from '@/utils/haptics';
import type { AppStackParamList } from '@/types';
import type { Project } from '../types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// Fixed card height for getItemLayout — prevents FlatList from measuring each
// item and keeps scroll-to-index fast even at 100+ projects.
// card: padding(16×2) + title(22) + description(36) + footer(20) + marginBottom(12) ≈ 118
const ITEM_HEIGHT = 130;

export default function ProjectsListScreen(): React.JSX.Element {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { projects, isLoading, error, refresh, deleteProject } = useProjects();
  const activeBuilds = useProjectsStore((s) => s.activeBuilds);
  const { showSuccess, showError, showWarning } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    hapticLight();
    refresh();
    setTimeout(() => setRefreshing(false), 1200);
  }, [refresh]);

  const handleLongPress = useCallback((project: Project) => {
    hapticWarning();
    setDeleteTarget(project);
  }, []);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!deleteTarget) return;

    if (activeBuilds[deleteTarget.id]) {
      showWarning(
        'Build in Progress',
        `"${deleteTarget.name}" is building. It will be stopped before deletion.`,
      );
    }

    try {
      await deleteProject(deleteTarget.id);
      hapticSuccess();
      showSuccess('Project deleted', `"${deleteTarget.name}" has been removed.`);
    } catch {
      hapticError();
      showError('Delete failed', 'Could not delete the project. Please try again.');
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, activeBuilds, deleteProject, showSuccess, showError, showWarning]);

  const handleCancelDelete = useCallback(() => {
    hapticLight();
    setDeleteTarget(null);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    listContent: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[4],
      paddingBottom: theme.spacing[24],
    },
    errorBanner: {
      marginHorizontal: theme.spacing[4],
      marginTop: theme.spacing[4],
      backgroundColor: theme.colors.errorSubtle,
      borderRadius: theme.radii.md,
      padding: theme.spacing[3],
    },
    errorText: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.sm,
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing[8],
      right: theme.spacing[5],
      width: 56,
      height: 56,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.lg,
    },
    fabText: {
      color: theme.colors.text.inverse,
      fontSize: 28,
      lineHeight: 32,
    },
    skeletonContainer: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[4],
    },
  });

  if (isLoading && projects.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonContainer}>
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} lines={2} />)}
        </View>
      </View>
    );
  }

  const renderItem: ListRenderItem<Project> = useCallback(
    ({ item }) => (
      <ProjectCard
        project={item}
        onPress={() => {
          hapticLight();
          navigation.navigate('ProjectDetail', { projectId: item.id });
        }}
        onLongPress={() => handleLongPress(item)}
      />
    ),
    [navigation, handleLongPress],
  );

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        icon="📦"
        title="No Projects Yet"
        description="Tap the + button to create your first ForgeAI project."
      />
    ),
    [],
  );

  const keyExtractor = useCallback((item: Project) => item.id, []);

  const isTargetBuilding = deleteTarget ? Boolean(activeBuilds[deleteTarget.id]) : false;

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={projects}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          projects.length === 0 ? { flex: 1 } : undefined,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
        // ── Virtualization performance ─────────────────────────────────────
        getItemLayout={(_data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={8}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          hapticMedium();
          navigation.navigate('CreateProject');
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={deleteTarget !== null}
        title="Delete Project"
        message={
          isTargetBuilding
            ? `"${deleteTarget?.name}" is currently building. Deleting it will stop the build. Continue?`
            : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}
