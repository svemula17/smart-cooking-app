import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import * as Sentry from '@sentry/react-native';
import { store, type RootState } from './src/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastProvider } from './src/components/ui';

// ─── Sentry crash & error reporting ─────────────────────────────────────────
// Hardcoded DSN is intentional — Sentry DSNs are public-by-design and
// included client-side. We disable reporting in dev so local crashes don't
// pollute the production project.
Sentry.init({
  dsn: 'https://7e23c244e58c91bb1d45c60d7098997d@o4511403615387648.ingest.us.sentry.io/4511403620433920',
  enabled: !__DEV__,
  // Trace 10% of transactions in production to keep within free tier.
  tracesSampleRate: 0.1,
  // Annotate every event with the environment for filtering in the UI.
  environment: __DEV__ ? 'development' : 'production',
});

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

function App() {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemedApp />
      </QueryClientProvider>
    </ReduxProvider>
  );
}

// Sentry.wrap() installs error boundaries and instruments the navigation tree
// so unhandled JS errors and slow screens are reported automatically.
export default Sentry.wrap(App);
