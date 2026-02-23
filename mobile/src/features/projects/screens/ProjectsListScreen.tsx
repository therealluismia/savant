import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useToast } from '@/hooks';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { SkeletonCard, EmptyState, ConfirmModal } from '@/components';
import type { AppStackParamList } from '@/types';
import type { Project } from '../types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function ProjectsListScreen(): React.JSX.Element {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { projects, isLoading, error, refresh, deleteProject } = useProjects();
  const { showSuccess, showError } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refresh]);

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    try {
      await deleteProject(deleteTarget.id);
      showSuccess('Project deleted', `"${deleteTarget.name}" has been removed.`);
    } catch {
      showError('Delete failed', 'Could not delete the project. Please try again.');
    } finally {
      setDeleteTarget(null);
    }
  };

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

  const renderItem: ListRenderItem<Project> = ({ item }) => (
    <ProjectCard
      project={item}
      onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
      onLongPress={() => setDeleteTarget(item)}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="📦"
      title="No Projects Yet"
      description="Tap the + button to create your first ForgeAI project."
    />
  );

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
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
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateProject')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={deleteTarget !== null}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
