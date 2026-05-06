import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import RecipeBrowserScreen from '../screens/RecipeBrowserScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import { CookingModeScreen } from '../screens/CookingModeScreen';
import { ShoppingListScreen } from '../screens/ShoppingListScreen';
import { AIChatScreen } from '../screens/AIChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

import type { RootStackParamList, TabParamList } from '../types';
import { colors } from '../theme/colors';

// React 19 expands ReactNode to include bigint, which breaks @react-navigation
// v7's ScreenComponentType. Cast all screen components to bypass this.
type AnyComponent = React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

// ─── Tab icon map ─────────────────────────────────────────────────────────────

interface TabIconConfig { emoji: string; label: string }

const TAB_CONFIG: Record<string, TabIconConfig> = {
  Home:     { emoji: '🏠', label: 'Home' },
  Search:   { emoji: '🔍', label: 'Discover' },
  AIChat:   { emoji: '🤖', label: 'AI Chef' },
  Shopping: { emoji: '🛒', label: 'Shopping' },
  Profile:  { emoji: '👤', label: 'Profile' },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const cfg = TAB_CONFIG[name] ?? { emoji: '●', label: name };
  return (
    <View style={tabIconStyles.container}>
      <Text style={[tabIconStyles.emoji, focused && tabIconStyles.emojiActive]}>
        {cfg.emoji}
      </Text>
      {focused && <View style={tabIconStyles.dot} />}
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', width: 44, height: 36 },
  emoji: { fontSize: 22, opacity: 0.5 },
  emojiActive: { opacity: 1 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 2 },
});

// ─── Tab Navigator ────────────────────────────────────────────────────────────

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 4,
          height: 64,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: TAB_CONFIG[route.name]?.label ?? route.name,
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen       as AnyComponent} />
      <Tab.Screen name="Search"   component={SearchScreen     as AnyComponent} />
      <Tab.Screen name="AIChat"   component={AIChatScreen     as AnyComponent} />
      <Tab.Screen name="Shopping" component={ShoppingListScreen as AnyComponent} />
      <Tab.Screen name="Profile"  component={ProfileScreen    as AnyComponent} />
    </Tab.Navigator>
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Splash"     component={SplashScreen     as AnyComponent} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen as AnyComponent} />
      <Stack.Screen
        name="Tabs"
        component={TabNavigator as AnyComponent}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="RecipeBrowser"
        component={RecipeBrowserScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CookingMode"
        component={CookingModeScreen as AnyComponent}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
