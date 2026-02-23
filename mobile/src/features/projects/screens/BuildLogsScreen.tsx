import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/hooks';
import { useBuild } from '../hooks/useBuild';
import { useProjectsStore } from '@/store';
import { EmptyState } from '@/components';
import type { AppStackParamList } from '@/types';
import type { BuildLogEntry, BuildLogLevel } from '../types';

// Terminal palette — fixed colours independent of light/dark theme
const TERMINAL_BG = '#020617';
const TERMINAL_BORDER = '#1E293B';
const TERMINAL_TIMESTAMP = '#475569';

type Props = NativeStackScreenProps<AppStackParamList, 'BuildLogs'>;

const LOG_COLOR: Record<BuildLogLevel, string> = {
  info: '#94A3B8',
  success: '#22C55E',
  warn: '#F59E0B',
  error: '#EF4444',
};

const LOG_PREFIX: Record<BuildLogLevel, string> = {
  info: '  ',
  success: '✓ ',
  warn: '⚠ ',
  error: '✗ ',
};

export default function BuildLogsScreen(): React.JSX.Element {
  const theme = useTheme();
  const route = useRoute<Props['route']>();
  const { projectId } = route.params;
  const flatListRef = useRef<FlatList<BuildLogEntry>>(null);

  const { isBuilding, logs, start, stop } = useBuild(projectId);
  const project = useProjectsStore((s) => s.getProjectById(projectId));

  useEffect(() => {
    if (logs.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [logs.length]);

  const handleToggleBuild = useCallback((): void => {
    if (isBuilding) {
      stop();
    } else {
      start();
    }
  }, [isBuilding, start, stop]);

  const renderItem: ListRenderItem<BuildLogEntry> = useCallback(
    ({ item, index }) => <LogLine entry={item} index={index} theme={theme} />,
    [theme],
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: TERMINAL_BG,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: TERMINAL_BORDER,
    },
    projectLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: '#94A3B8',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: theme.radii.full,
      backgroundColor: isBuilding ? theme.colors.warning : '#475569',
    },
    toolbarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
    },
    buildToggleBtn: {
      height: 32,
      paddingHorizontal: theme.spacing[3],
      borderRadius: theme.radii.md,
      backgroundColor: isBuilding ? theme.colors.error : theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buildToggleText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semiBold,
    },
    logList: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      paddingBottom: theme.spacing[12],
    },
    emptyContainer: {
      flex: 1,
      backgroundColor: TERMINAL_BG,
      justifyContent: 'center',
    },
    startBuildBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing[6],
      paddingVertical: theme.spacing[3],
      borderRadius: theme.radii.md,
    },
    startBuildText: {
      color: '#FFFFFF',
      fontWeight: theme.typography.fontWeight.semiBold,
      fontSize: theme.typography.fontSize.base,
    },
  });

  if (logs.length === 0 && !isBuilding) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="📋"
          title="No Logs Yet"
          description="Start a build to see real-time output here."
          action={
            <TouchableOpacity
              style={styles.startBuildBtn}
              onPress={start}
              activeOpacity={0.85}
            >
              <Text style={styles.startBuildText}>Start Build</Text>
            </TouchableOpacity>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.projectLabel}>{project?.name ?? projectId}</Text>
        <View style={styles.toolbarRight}>
          <View style={styles.statusDot} />
          <TouchableOpacity
            style={styles.buildToggleBtn}
            onPress={handleToggleBuild}
            activeOpacity={0.85}
          >
            <Text style={styles.buildToggleText}>
              {isBuilding ? 'Stop' : 'Re-run'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.logList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
    </View>
  );
}

// ─── LogLine ──────────────────────────────────────────────────────────────────

interface LogLineProps {
  entry: BuildLogEntry;
  index: number;
  theme: ReturnType<typeof useTheme>;
}

function LogLine({ entry, index, theme }: LogLineProps): React.JSX.Element {
  const color = LOG_COLOR[entry.level];
  const prefix = LOG_PREFIX[entry.level];

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      marginBottom: theme.spacing[0.5],
    },
    timestamp: {
      fontSize: 11,
      fontFamily: theme.typography.fontFamily.mono,
      color: TERMINAL_TIMESTAMP,
      marginRight: theme.spacing[2],
      minWidth: 60,
    },
    message: {
      flex: 1,
      fontSize: 12,
      fontFamily: theme.typography.fontFamily.mono,
      color,
      lineHeight: 18,
    },
  });

  function formatTime(iso: string): string {
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const ss = d.getSeconds().toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(200).delay(index < 5 ? 0 : 50)}
      style={styles.row}
    >
      <Text style={styles.timestamp}>{formatTime(entry.timestamp)}</Text>
      <Text style={styles.message}>{prefix}{entry.message}</Text>
    </Animated.View>
  );
}
