import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 16, borderRadius }: SkeletonProps): React.JSX.Element {
  const theme = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(opacity);
    };
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const styles = StyleSheet.create({
    base: {
      width: width as number,
      height,
      borderRadius: borderRadius ?? theme.radii.md,
      backgroundColor: theme.colors.border,
    },
  });

  return <Animated.View style={[styles.base, animatedStyle]} />;
}

interface SkeletonRowProps {
  lines?: number;
}

export function SkeletonCard({ lines = 2 }: SkeletonRowProps): React.JSX.Element {
  const theme = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing[4],
      marginBottom: theme.spacing[3],
      ...theme.shadows.sm,
    },
    titleRow: {
      marginBottom: theme.spacing[3],
    },
    lineRow: {
      marginBottom: theme.spacing[2],
    },
    badgeRow: {
      marginTop: theme.spacing[3],
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Skeleton width="60%" height={18} />
      </View>
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={styles.lineRow}>
          <Skeleton width={i === lines - 1 ? '40%' : '100%'} height={13} />
        </View>
      ))}
      <View style={styles.badgeRow}>
        <Skeleton width={72} height={22} borderRadius={theme.radii.full} />
      </View>
    </View>
  );
}
