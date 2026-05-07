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

// Configure how notifications appear when the app is in the foreground
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
      <NavigationContainer>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <RootNavigator />
      </NavigationContainer>
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
