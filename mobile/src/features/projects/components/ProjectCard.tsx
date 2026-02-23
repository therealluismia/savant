import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks';
import { StatusBadge } from './StatusBadge';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onLongPress: () => void;
}

export function ProjectCard({ project, onPress, onLongPress }: ProjectCardProps): React.JSX.Element {
  const theme = useTheme();

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing[4],
      marginBottom: theme.spacing[3],
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing[2],
    },
    name: {
      flex: 1,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: theme.colors.text.primary,
      marginRight: theme.spacing[3],
    },
    description: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
      marginBottom: theme.spacing[3],
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    date: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
    },
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
        <StatusBadge status={project.status} />
      </View>
      <Text style={styles.description} numberOfLines={2}>{project.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.date}>Updated {formatDate(project.updatedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}
