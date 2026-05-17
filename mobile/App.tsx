import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { store, type RootState } from './src/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastProvider } from './src/components/ui';

// NOTE: Mobile Sentry temporarily disabled — @sentry/react-native's Expo
// config plugin doesn't resolve correctly under our npm workspaces hoisting
// (it ends up at the repo-root node_modules and can't find `expo` from
// there). Backend Sentry across all 6 services is still wired and captures
// the bulk of production errors. To re-enable mobile Sentry later, either
// move @sentry/react-native into a workspace nohoist list or eject from the
// monorepo for the mobile/ directory.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

function ThemedApp() {
  const isDark = useSelector((s: RootState) => s.settings.isDark);
  useEffect(() => {
    Notifications.requestPermissionsAsync().catch(() => {});
  }, []);
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NavigationContainer>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <RootNavigator />
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemedApp />
      </QueryClientProvider>
    </ReduxProvider>
  );
}
