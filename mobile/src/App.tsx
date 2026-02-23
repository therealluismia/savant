import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary, ToastContainer } from '@/components';
import { AppProviders } from '@/providers';
import { RootNavigator } from '@/navigation';

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
});

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppProviders>
            <StatusBar style="auto" />
            <RootNavigator />
            <ToastContainer />
          </AppProviders>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
