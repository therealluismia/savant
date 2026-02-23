/**
 * haptics.ts — thin wrapper around expo-haptics that silently no-ops if
 * the device doesn't support haptic feedback (simulator, web, old hardware).
 *
 * Import this module instead of expo-haptics directly so every call site
 * is automatically guarded.
 */
import * as ExpoHaptics from 'expo-haptics';

function safeHaptic(fn: () => Promise<void>): void {
  fn().catch(() => {
    // Haptics are best-effort: swallow errors on unsupported devices.
  });
}

/** Light tap — card press, selection, toggle */
export function hapticLight(): void {
  safeHaptic(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light));
}

/** Medium tap — FAB press, button confirm */
export function hapticMedium(): void {
  safeHaptic(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium));
}

/** Heavy tap — destructive confirm, error */
export function hapticHeavy(): void {
  safeHaptic(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy));
}

/** Success notification — build passed, project created */
export function hapticSuccess(): void {
  safeHaptic(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success));
}

/** Warning notification — build stopped, delete warning */
export function hapticWarning(): void {
  safeHaptic(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning));
}

/** Error notification — build failed, delete error */
export function hapticError(): void {
  safeHaptic(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error));
}

/** Selection changed — theme toggle, radio button */
export function hapticSelection(): void {
  safeHaptic(() => ExpoHaptics.selectionAsync());
}
