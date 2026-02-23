/**
 * useAppStateBuilds — subscribes to React Native AppState changes and stops
 * all active builds when the app goes to background or becomes inactive.
 *
 * This prevents the mock setInterval from firing log callbacks indefinitely
 * while the app is in the background, which wastes CPU and can cause
 * state-update issues when the component tree is suspended.
 *
 * Usage: call once in AppProviders or RootNavigator.
 */
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useProjectsStore } from '@/store/projectsStore';

export function useAppStateBuilds(): void {
  const stopAllBuilds = useProjectsStore((s) => s.stopAllBuilds);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasActive = appState.current === 'active';
      const goingBackground = nextState === 'background' || nextState === 'inactive';

      if (wasActive && goingBackground) {
        // App moving to background — stop all builds so timers don't run
        // silently and callbacks don't update unmounted components.
        stopAllBuilds();
      }

      appState.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, [stopAllBuilds]);
}
