import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import RecipeBrowserScreen from '../screens/RecipeBrowserScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import { CookingModeScreen } from '../screens/CookingModeScreen';
import { ShoppingListScreen } from '../screens/ShoppingListScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

import type { RootStackParamList, TabParamList } from '../types';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home:     { active: '🏠', inactive: '🏡' },
  Search:   { active: '🔍', inactive: '🔎' },
  Shopping: { active: '🛒', inactive: '🛍️' },
  Profile:  { active: '👤', inactive: '👥' },
};

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
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused }) => {
          const icons = TAB_ICONS[route.name] ?? { active: '●', inactive: '○' };
          return (
            <Text style={{ fontSize: 22 }}>
              {focused ? icons.active : icons.inactive}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}         options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Search"   component={RecipeBrowserScreen as React.ComponentType<any>} options={{ tabBarLabel: 'Recipes' }} />
      <Tab.Screen name="Shopping" component={ShoppingListScreen} options={{ tabBarLabel: 'Shopping' }} />
      <Tab.Screen name="Profile"  component={ProfileScreen}      options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator(): JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Splash"        component={SplashScreen} />
      <Stack.Screen name="Onboarding"    component={OnboardingScreen} />
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="RecipeBrowser"
        component={RecipeBrowserScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CookingMode"
        component={CookingModeScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
