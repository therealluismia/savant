import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '@/store';
import { useTheme } from '@/hooks';
import type { ToastMessage } from '@/types';

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps): React.JSX.Element {
  const theme = useTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });
  }, [translateY, opacity]);

  const dismiss = (): void => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-80, { duration: 200 }, () => {
      runOnJS(onDismiss)(toast.id);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const colorMap = {
    success: { bg: theme.colors.successSubtle, border: theme.colors.success, text: theme.colors.success },
    error: { bg: theme.colors.errorSubtle, border: theme.colors.error, text: theme.colors.error },
    warning: { bg: theme.colors.warningSubtle, border: theme.colors.warning, text: theme.colors.warning },
    info: { bg: theme.colors.infoSubtle, border: theme.colors.info, text: theme.colors.info },
  } as const;

  const toastColors = colorMap[toast.type];

  const styles = StyleSheet.create({
    wrapper: {
      marginBottom: theme.spacing[2],
    },
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: toastColors.bg,
      borderLeftWidth: 4,
      borderLeftColor: toastColors.border,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      ...theme.shadows.md,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: toastColors.text,
      marginBottom: toast.description ? theme.spacing[0.5] : 0,
    },
    description: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.relaxed,
    },
    closeButton: {
      marginLeft: theme.spacing[3],
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text.tertiary,
      lineHeight: 20,
    },
  });

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{toast.title}</Text>
          {toast.description ? (
            <Text style={styles.description}>{toast.description}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={dismiss} activeOpacity={0.7}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export function ToastContainer(): React.JSX.Element {
  const { toasts, removeToast } = useToastStore();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: insets.top + theme.spacing[2],
      left: theme.spacing[4],
      right: theme.spacing[4],
      zIndex: 9999,
    },
  });

  if (toasts.length === 0) {
    return <View />;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </View>
  );
}
