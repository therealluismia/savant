import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  type ListRenderItem,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/hooks';
import { useBuild } from '../hooks/useBuild';
import { useProjectsStore } from '@/store';
import { EmptyState } from '@/components';
import { hapticMedium, hapticSuccess, hapticError, hapticWarning } from '@/utils/haptics';
import type { AppStackParamList } from '@/types';
import type { BuildLogEntry, BuildLogLevel } from '../types';

// Terminal palette — fixed colours independent of light/dark theme
const TERMINAL_BG = '#020617';
const TERMINAL_BORDER = '#1E293B';
const TERMINAL_TIMESTAMP = '#475569';

// Fixed row height for getItemLayout (timestamp fontSize 11 × lineHeight 1.5 ≈ 17 + mb 4)
const LOG_ROW_HEIGHT = 21;

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

  // Track previous isBuilding to detect build completion
  const prevIsBuilding = useRef(false);

  useEffect(() => {
    if (logs.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [logs.length]);

  // Haptics + scroll on build completion
  useEffect(() => {
    const justFinished = prevIsBuilding.current && !isBuilding && logs.length > 0;
    if (justFinished && project) {
      if (project.status === 'success') {
        hapticSuccess();
      } else if (project.status === 'failed') {
        hapticError();
      }
      // Scroll to the final log line
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
    prevIsBuilding.current = isBuilding;
  }, [isBuilding, project, logs.length]);

  const handleToggleBuild = useCallback((): void => {
    if (isBuilding) {
      hapticWarning();
      stop();
    } else {
      hapticMedium();
      start();
    }
  }, [isBuilding, start, stop]);

  const renderItem: ListRenderItem<BuildLogEntry> = useCallback(
    ({ item, index }) => <LogLine entry={item} index={index} theme={theme} />,
    [theme],
  );

  const keyExtractor = useCallback((item: BuildLogEntry) => item.id, []);

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
      flex: 1,
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
    logCount: {
      fontSize: theme.typography.fontSize.xs,
      color: TERMINAL_TIMESTAMP,
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
              onPress={() => {
                hapticMedium();
                start();
              }}
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
        <Text style={styles.projectLabel} numberOfLines={1}>
          {project?.name ?? projectId}
        </Text>
        <View style={styles.toolbarRight}>
          {/* Log count — helps user see memory cap in action */}
          <Text style={styles.logCount}>{logs.length} lines</Text>
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
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.logList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        // ── Performance ────────────────────────────────────────────────────
        getItemLayout={(_data, index) => ({
          length: LOG_ROW_HEIGHT,
          offset: LOG_ROW_HEIGHT * index,
          index,
        })}
        maxToRenderPerBatch={20}
        windowSize={15}
        initialNumToRender={30}
        // Logs only grow at the end — no need for removeClippedSubviews
        // (it can cause flicker in bottom-anchored lists)
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

// Only animate the first 3 lines and newly-arriving lines (index ≥ total-3).
// This avoids running 500 entering animations simultaneously when the user
// scrolls to the top, which would cause jank.
const ANIMATE_THRESHOLD = 3;

function LogLine({ entry, index, theme }: LogLineProps): React.JSX.Element {
  const color = LOG_COLOR[entry.level];
  const prefix = LOG_PREFIX[entry.level];

  const shouldAnimate = index < ANIMATE_THRESHOLD;

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      marginBottom: 4,
      minHeight: LOG_ROW_HEIGHT - 4,
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

  if (shouldAnimate) {
    return (
      <Animated.View
        entering={FadeInDown.duration(180)}
        style={styles.row}
      >
        <Text style={styles.timestamp}>{formatTime(entry.timestamp)}</Text>
        <Text style={styles.message}>{prefix}{entry.message}</Text>
      </Animated.View>
    );
  }

  // Non-animated path: plain View, zero JS-thread animation overhead.
  return (
    <View style={styles.row}>
      <Text style={styles.timestamp}>{formatTime(entry.timestamp)}</Text>
      <Text style={styles.message}>{prefix}{entry.message}</Text>
    </View>
  );
}
